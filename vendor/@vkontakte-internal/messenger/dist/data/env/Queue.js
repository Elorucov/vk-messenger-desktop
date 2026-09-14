import { exhaustivenessCheck, RetryTimeout, sleep } from '../../core/utils/misc';
const WAIT = 25;
const MIN_RECONNECT_TIMEOUT = 500;
const MAX_RECONNECT_TIMEOUT = 60 * 1000;
const DEFAULT_BACKPRESSURE_LIMIT = 50;
export class Queue {
    logger;
    request;
    backpressureLimit;
    reconnectTimeout = new RetryTimeout(MIN_RECONNECT_TIMEOUT, MAX_RECONNECT_TIMEOUT);
    /**
     * Работает ли лонгполл в данный момент.
     */
    abort = null;
    empty = () => ({
        kind: 'Buffer',
        buffer: [],
        isReconnecting: false,
    });
    /**
     * Функция ожидающая новый события или буффер для накопления событий.
     */
    queued = this.empty();
    constructor(logger, request, backpressureLimit = DEFAULT_BACKPRESSURE_LIMIT) {
        this.logger = logger;
        this.request = request;
        this.backpressureLimit = backpressureLimit;
    }
    /**
     * Запускает цикл лонгполла.
     */
    connect = async (config) => {
        if (this.isConnected()) {
            return;
        }
        this.abort = () => { };
        this.queued = this.empty();
        const key = config.queues.map((q) => q.key).join('');
        let ts = config.queues.map((q) => q.timestamp).join('_');
        const drain = async () => {
            while (this.isConnected()) {
                try {
                    const ctrl = new AbortController();
                    const timeoutId = setTimeout(() => ctrl.abort(), WAIT * 1000 + 5000);
                    this.abort = () => {
                        ctrl.abort();
                        this.abort = null;
                    };
                    const isQueueSuccessful = (events) => !events.some((ev) => 'failed' in ev);
                    const events = await this.request(config.base_url, {
                        act: 'a_check',
                        key,
                        ts,
                        id: config.user_id,
                        wait: WAIT,
                    }, ctrl.signal).finally(() => clearTimeout(timeoutId));
                    this.reconnectTimeout.reset();
                    if (!isQueueSuccessful(events)) {
                        this.logger.info('[QUEUE] Failure', events);
                        this.dispatch({ kind: 'Disconnected', reason: 'failure' });
                        return;
                    }
                    ts = events.map((ev) => ev.ts).join('_');
                    events.forEach((event) => {
                        this.dispatch({ kind: 'Batch', ...event });
                    });
                }
                catch (err) {
                    this.logger.info('[QUEUE] Error', err);
                    // Будет происходить, если мы вручную вызвали дисконнект
                    const shouldNotReconnect = err instanceof Error &&
                        err.name === 'AbortError' &&
                        !this.isConnected();
                    if (shouldNotReconnect) {
                        return;
                    }
                    this.dispatch({ kind: 'Reconnecting' });
                    this.logger.info('[QUEUE] Reconnecting in', this.reconnectTimeout.delay());
                    await sleep(this.reconnectTimeout.delay());
                    this.reconnectTimeout.backoff();
                    this.logger.info('[QUEUE] Reconnecting...');
                }
            }
        };
        drain().catch((err) => {
            this.logger.error('[QUEUE] Drain failed', err);
        });
        this.logger.info('[QUEUE] Connected');
    };
    /**
     * Метод умеет понимать, что делать с событием в зависимости
     * от его содержимого и текущего состояния.
     */
    dispatch = (what) => {
        if (what.kind === 'Disconnected') {
            this.abort && this.abort();
            this.logger.info('[QUEUE] Disconnected, reason:', what.reason);
        }
        if (this.queued.kind === 'Callback') {
            this.queued.resolve(what);
            this.queued = this.empty();
            return;
        }
        this.queued.isReconnecting = false;
        switch (what.kind) {
            case 'Disconnected': {
                this.queued.buffer.push(what);
                return;
            }
            case 'Batch': {
                const last = this.queued.buffer.pop();
                if (!last) {
                    this.queued.buffer.push(what);
                    return;
                }
                if (last.kind === 'Disconnected') {
                    this.logger.error('[QUEUE] Error', new Error('очередь продолжает работать после дисконнекта'));
                    return;
                }
                /**
                 * Защищаемся от утечки памяти.
                 * Это еще называется термином "back pressure" - количество входящих данных больше,
                 * чем консьюмер способен обработать.
                 *
                 * Если мы накопили достаточно много эвентов, но их никто не разбирает,
                 * то нам нет смысла ходить дальше в сеть и продолжать их копить.
                 *
                 * Поэтому мы кидаем ошибку и даем возможность консьюмеру самостоятельно
                 * перезапустить нас, когда он будет к этому готов.
                 */
                if (this.queued.buffer.length >= this.backpressureLimit ||
                    last.events.length >= this.backpressureLimit) {
                    this.queued.buffer.push(last);
                    this.dispatch({ kind: 'Disconnected', reason: 'backpressure' });
                    return;
                }
                this.queued.buffer.push(what);
                return;
            }
            case 'Reconnecting':
                this.queued.isReconnecting = true;
                return;
            default:
                exhaustivenessCheck(what);
        }
    };
    /**
     * Освободить ресурсы
     */
    dispose() {
        this.disconnect();
        this.abort?.();
    }
    /**
     * Отдает новую пачку апдейтов, как только она становится доступна.
     */
    poll = () => {
        if (this.queued.kind === 'Callback') {
            this.queued.reject('Queue.poll вызван дважды!');
            return new Promise((resolve, reject) => {
                this.queued = { kind: 'Callback', resolve, reject };
            });
        }
        const next = this.queued.buffer.shift();
        if (next) {
            return Promise.resolve(next);
        }
        if (this.queued.isReconnecting) {
            return Promise.resolve({ kind: 'Reconnecting' });
        }
        /**
         * Если в буффере нет ни одного эвента и мы не работаем,
         * значит кто-то вызвалл pull при нерабочем соединениии.
         */
        if (!this.isConnected()) {
            return Promise.reject('Queue.connect еще не был вызван!');
        }
        return new Promise((resolve, reject) => {
            this.queued = { kind: 'Callback', resolve, reject };
        });
    };
    disconnect = () => {
        this.dispatch({ kind: 'Disconnected', reason: 'manual' });
    };
    reconnect = () => {
        this.dispatch({ kind: 'Disconnected', reason: 'changed' });
    };
    isConnected = () => !!this.abort;
}
//# sourceMappingURL=Queue.js.map