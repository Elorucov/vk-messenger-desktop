import { exhaustivenessCheck, RetryTimeout } from '../../core/utils/misc';
const VERSION = 1;
const WAIT = 25;
const MIN_RECONNECT_TIMEOUT = 250;
const MAX_RECONNECT_TIMEOUT = 20 * 1000;
const BACKPRESSURE_LIMIT = 1000;
export class VideoEngine {
    logger;
    request;
    reconnectTimeout = new RetryTimeout(MIN_RECONNECT_TIMEOUT, MAX_RECONNECT_TIMEOUT);
    /**
     * Работает ли лонгполл в данный момент.
     */
    isWorking = false;
    isDisposed = false;
    empty = () => ({
        kind: 'Buffer',
        buffer: [],
    });
    queued = this.empty();
    requestCtrl = null;
    version;
    constructor(logger, request) {
        this.logger = logger;
        this.request = request;
        this.version = VERSION;
    }
    /**
     * Запускает цикл лонгполла.
     */
    connect = (config) => {
        if (this.isDisposed) {
            // никто не может переконнектить движок если его "освободили"
            return;
        }
        if (this.isWorking) {
            // кидаем ошибку, чтобы не позволить вызвать повторный poll в UserOpenedVideoChat_RequestCompleted
            throw new Error('Already connected');
        }
        this.isWorking = true;
        this.queued = this.empty();
        const drain = async () => {
            while (this.isWorking) {
                if (this.queued.kind === 'Buffer') {
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
                    const totalSize = this.queued.buffer.reduce((acc, x) => (x.kind === 'Batch' ? acc + x.updates.length : acc + 1), 0);
                    if (totalSize >= BACKPRESSURE_LIMIT) {
                        this.isWorking = false;
                        this.dispatch({ kind: 'Failure', config });
                        return;
                    }
                }
                const url = new URL(config.url);
                if (config.ts) {
                    url.searchParams.set('ts', config.ts.toString());
                }
                url.searchParams.set('wait', WAIT.toString());
                try {
                    this.requestCtrl = new AbortController();
                    const timeoutId = setTimeout(() => this.requestCtrl?.abort(), 
                    // Ставим таймаут на 5 секунды позже времени ожидания
                    WAIT * 1000 + 5000);
                    const event = await this.request(url.href, {}, this.requestCtrl.signal).finally(() => clearTimeout(timeoutId));
                    this.reconnectTimeout.reset();
                    if ('failed' in event) {
                        throw event;
                    }
                    config.ts = event.ts;
                    this.dispatch({
                        kind: 'Batch',
                        ts: event.ts,
                        updates: event.events.map((event) => typeof event === 'string' ? JSON.parse(event) : event),
                    });
                }
                catch (err) {
                    this.logger.info('[VIDEO ENGINE] Error', err);
                    // если уже не работает, значит shutdown
                    if (this.isWorking) {
                        this.isWorking = false;
                        this.dispatch({ kind: 'Failure', config });
                    }
                }
            }
        };
        drain().catch((e) => {
            this.isWorking = false;
            this.logger.error('[VIDEO ENGINE] Drain error', e);
        });
        this.logger.info('[VIDEO ENGINE] Connected');
    };
    /**
     * Метод умеет понимать, что делать с событием в зависимости
     * от его содержимого и текущего состояния.
     */
    dispatch = (what) => {
        if (this.queued.kind === 'Callback') {
            this.queued.resolve(what);
            this.queued = this.empty();
            return;
        }
        switch (what.kind) {
            case 'Failure':
                this.queued.buffer.push(what);
                return;
            case 'Batch': {
                const last = this.queued.buffer[this.queued.buffer.length - 1];
                /**
                 * Оптимизация.
                 * Если у нас было [[1]] и мы получили [[2]], то вместо того,
                 * чтобы сделать [[1], [2]], мы можем сделать [[1, 2]].
                 * В таком случае клиентская сторона получит бОльший батч
                 * апдейтов за раз.
                 * Это, например, поможет оптимизаровать догрузку дополнительных
                 * данных на клиентской стороне.
                 */
                if (last && last.kind !== 'Failure') {
                    last.ts = what.ts;
                    last.updates.push(...what.updates);
                }
                else {
                    this.queued.buffer.push(what);
                }
                return;
            }
            default:
                exhaustivenessCheck(what);
        }
    };
    /**
     * Отдает новую пачку апдейтов, как только она становится доступна.
     */
    poll = () => {
        if (this.queued.kind === 'Callback') {
            this.queued.reject('VideoEngine.poll вызван повторно до обработки первого вызова!');
            return new Promise((resolve, reject) => {
                this.queued = { kind: 'Callback', resolve, reject };
            });
        }
        const next = this.queued.buffer.shift();
        if (next) {
            return Promise.resolve(next);
        }
        /**
         * Если в буффере нет ни одного эвента и мы не работаем,
         * значит кто-то вызвалл pull при нерабочем соединениии.
         */
        if (!this.isWorking) {
            return Promise.reject('VideoEngine.connect еще не был вызван!');
        }
        return new Promise((resolve, reject) => {
            this.queued = { kind: 'Callback', resolve, reject };
        });
    };
    /**
     * Работает ли в данный момент движок.
     */
    isConnected = () => {
        return this.isWorking;
    };
    /**
     * Завершаем работу
     */
    shutdown() {
        this.isWorking = false;
        this.queued = this.empty();
        if (this.requestCtrl) {
            this.requestCtrl.abort('shutdown');
        }
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        this.shutdown();
        this.isDisposed = true;
    }
}
//# sourceMappingURL=VideoEngine.js.map