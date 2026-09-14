import { UpdatesError } from '../errors/updates';
import { EventDispatcher } from '../helpers/eventDispatcher';
import { handleVmojiQueueEvent } from './events/vmoji';
import { handlerStickersQueueEvent } from './events/stickers';
import { wait } from '../utils/wait';
import { POLLING_VERSION } from '../constants';
export var UpdatesSource;
(function (UpdatesSource) {
    UpdatesSource["USER"] = "user";
    UpdatesSource["GROUP"] = "group";
    UpdatesSource["VMOJI"] = "vmoji";
    UpdatesSource["STICKERS"] = "stickers";
})(UpdatesSource || (UpdatesSource = {}));
var UpdatesAction;
(function (UpdatesAction) {
    UpdatesAction["CHECK"] = "a_check";
    UpdatesAction["RELEASE"] = "a_release";
})(UpdatesAction || (UpdatesAction = {}));
export var UpdatesErrorCode;
(function (UpdatesErrorCode) {
    UpdatesErrorCode["NEED_RESTART"] = "NEED_RESTART";
    UpdatesErrorCode["POLLING_REQUEST_FAILED"] = "POLLING_REQUEST_FAILED";
})(UpdatesErrorCode || (UpdatesErrorCode = {}));
export class Updates extends EventDispatcher {
    constructor(api, options = {}) {
        super();
        /**
         * Режим прослушивание очереди, битовая маска
         * 2 - Получать вложения
         * 8 - Возвращать расширенный набор событий
         * 32 - Возвращать pts, требуется для работы метода messages.getLongPollHistory без ограничения в 256 последних событий
         * 64 - В событии с кодом 8 (друг стал онлайн) возвращать дополнительные данные в поле $extra
         * 128 - Нужно ли возвращать random_id в сообщениях
         */
        this.mode = 2 | 8 | 64 | 128;
        /**
         * Статус прослушивания
         */
        this.started = false;
        /**
         * Временная отметка относительно которой получить обновления
         */
        this.ts = 0;
        /**
         * Постоянная временная отметка относительно которой получить обновления
         */
        this.pts = 0;
        /**
         * Количество попыток перезапуска прослушивания
         */
        this.restarted = 0;
        this.api = api;
        const { source, userId, groupId, wait, retryLimit } = options;
        this.source = source;
        this.userId = userId;
        this.groupId = groupId;
        this.wait = wait || 3_000;
        this.retryLimit = retryLimit || 3;
    }
    async start() {
        if (this.started) {
            return;
        }
        this.started = true;
        try {
            const longPollServer = await this.getLongPollServer();
            if (!longPollServer) {
                return;
            }
            const { server, key, ts } = longPollServer;
            if (this.ts === 0) {
                this.ts = ts;
            }
            this.url = new URL(server);
            this.url.searchParams.set('key', key);
            this.url.searchParams.set('act', UpdatesAction.CHECK);
            this.url.searchParams.set('wait', '25');
            this.url.searchParams.set('mode', String(this.mode));
            this.url.searchParams.set('version', String(POLLING_VERSION));
            switch (this.source) {
                case UpdatesSource.VMOJI:
                case UpdatesSource.STICKERS:
                    this.url.searchParams.set('id', String(this.userId));
                    break;
            }
            this.startFetchLoop();
        }
        catch (error) {
            this.started = false;
            throw error;
        }
    }
    async getLongPollServer() {
        let longPollServer;
        switch (this.source) {
            case UpdatesSource.GROUP:
                longPollServer = await this.api.groups.getLongPollServer({
                    group_id: this.groupId
                });
                break;
            case UpdatesSource.VMOJI:
            case UpdatesSource.STICKERS:
                longPollServer = await this.api[this.source].subscribeToQueue()
                    .then(({ base_url, ...longPollServer }) => ({
                    server: base_url,
                    ...longPollServer
                }));
                break;
            default:
                return;
        }
        const { server } = longPollServer;
        longPollServer.server = `${!server.startsWith('https') ? 'https://' : ''}${server}`;
        return longPollServer;
    }
    /**
     * Останавливает получение событий
     */
    async stop() {
        this.started = false;
        this.restarted = 0;
    }
    /**
     * Запускает бесконечный цикл опроса очереди
     */
    async startFetchLoop() {
        try {
            while (this.started) {
                await this.fetchUpdates();
            }
        }
        catch (error) {
            if (error.code !== UpdatesErrorCode.NEED_RESTART && this.restarted !== this.retryLimit) {
                this.restarted += 1;
                await wait(3_000);
                this.startFetchLoop();
                return;
            }
            while (this.started) {
                try {
                    await this.stop();
                    await this.start();
                    break;
                }
                catch (restartError) {
                    console.log(restartError);
                    this.started = true;
                    await wait(this.wait);
                }
            }
        }
    }
    /**
     * Получает события
     */
    async fetchUpdates() {
        this.url.searchParams.set('ts', String(this.ts));
        const controller = new AbortController();
        const interval = setTimeout(() => controller.abort(), 30_000);
        let result;
        try {
            const response = await fetch(this.url, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    connection: 'keep-alive'
                },
                credentials: 'include',
                mode: 'cors',
            });
            if (!response.ok) {
                throw new UpdatesError({
                    code: UpdatesErrorCode.POLLING_REQUEST_FAILED,
                    message: 'Polling request failed'
                });
            }
            result = await response.json();
        }
        finally {
            clearTimeout(interval);
        }
        if (result.failed !== undefined) {
            if (result.failed === 1) {
                this.ts = result.ts;
                return;
            }
            this.ts = 0;
            throw new UpdatesError({
                code: UpdatesErrorCode.NEED_RESTART,
                message: 'The server has been failed'
            });
        }
        this.restarted = 0;
        this.ts = result.ts;
        if (result.pts) {
            this.pts = Number(result.pts);
        }
        result.updates = result.updates || result.events || [];
        for (const update of result.updates) {
            this.handleUpdate(update);
        }
    }
    handleUpdate(update) {
        switch (this.source) {
            case UpdatesSource.VMOJI:
                handleVmojiQueueEvent(this, update);
                break;
            case UpdatesSource.STICKERS:
                handlerStickersQueueEvent(this, update);
                break;
        }
    }
}
export * from './events';
//# sourceMappingURL=index.js.map