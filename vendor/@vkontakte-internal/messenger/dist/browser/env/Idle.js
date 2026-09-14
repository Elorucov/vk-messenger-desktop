const IDLE_TIMEOUT = 30 * 1000;
const FIRST_ONLINE_TIMEOUT = 30 * 1000;
const ONLINE_INTERVAL = 3 * 60 * 1000;
export class Idle {
    logger;
    api;
    listeners = new Set();
    timeoutId;
    online = { intervalId: 0, lastCalled: 0, firstTimoutId: 0 };
    constructor(logger, api) {
        this.logger = logger;
        this.api = api;
        this.subscribe(() => {
            if (this.isIdle()) {
                clearInterval(this.online.intervalId);
                this.online.intervalId = 0;
                return;
            }
            const reportOnline = async () => {
                if (Date.now() - this.online.lastCalled > ONLINE_INTERVAL &&
                    !this.isIdle()) {
                    try {
                        await this.api.fetch('account.setOnline', {});
                    }
                    catch {
                        // do nothing
                    }
                    finally {
                        this.online.lastCalled = Date.now();
                    }
                }
            };
            this.online.intervalId = window.setInterval(reportOnline, ONLINE_INTERVAL);
            this.online.firstTimoutId = window.setTimeout(reportOnline, 
            // Немного задержим певый вызов, чтобы снизить нагрузку на лимиты АПИ
            // при начальной загрузке приложения
            FIRST_ONLINE_TIMEOUT);
        });
        this.onVisibilityChange();
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        /**
         * Обработчик blur нужны для понимания активности страницы, для случаев,
         * когда не шлется visibilitychange событие.
         * Для mac это следующий кейс:
         * вкладка с мессенджером не развернута на полный экран и мы переключаемся
         * на другое приложение тоже не развернутое на полный экран.
         */
        window.addEventListener('blur', this.handleWindowBlur, true);
        window.addEventListener('focus', this.onActive, true);
        document.addEventListener('mousemove', this.onActive, true);
        document.addEventListener('keydown', this.onActive, true);
    }
    handleWindowBlur = (event) => {
        /**
         * Событие всплывает, а нас интересует только потеря фокуса на window,
         * это означает что браузер больше не в фокусе.
         */
        if (event.target === window) {
            this.onIdle();
        }
    };
    isIdle = () => {
        return this.timeoutId === undefined;
    };
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };
    onVisibilityChange = () => {
        if (document.hidden) {
            this.onIdle();
        }
        else {
            this.onActive();
        }
    };
    onIdle = () => {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
            this.notify();
        }
    };
    onActive = () => {
        const wasActive = this.timeoutId !== undefined;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = window.setTimeout(this.onIdle, IDLE_TIMEOUT);
        if (wasActive) {
            return;
        }
        this.notify();
    };
    notify = () => {
        this.logger.info('[IDLE]', `user became ${this.isIdle() ? 'idle' : 'active'}`);
        for (const listener of this.listeners) {
            listener(this.isIdle());
        }
    };
    /**
     * Освободить ресурсы
     */
    dispose() {
        clearInterval(this.online.intervalId);
        clearTimeout(this.online.firstTimoutId);
        window.removeEventListener('focus', this.onActive, true);
        window.removeEventListener('blur', this.handleWindowBlur, true);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        document.removeEventListener('mousemove', this.onActive, true);
        document.removeEventListener('keydown', this.onActive, true);
    }
}
//# sourceMappingURL=Idle.js.map