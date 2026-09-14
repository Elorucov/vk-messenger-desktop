import { EventEmitter } from '../../data/env/EventEmitter';
const applyEventConstructor = (eventType) => {
    return { __act: eventType };
};
// сделать из локалстораджа вместо одного "storage" события шину событий
export class BroadcastChannel extends EventEmitter {
    connectionId;
    onDisposeActions = [];
    constructor(peerId) {
        super();
        this.connectionId = `queue_connection_events_queue${peerId}`;
        const onStorage = (e) => {
            try {
                // необходимо убедиться, что это сообщение адресовано нашей шине и событие создано по известным нам правилам
                if (e.key === this.connectionId && e.newValue) {
                    const data = JSON.parse(e.newValue);
                    const eventType = data?.__act; // согласно соглашениям тип события находиться в поле __act
                    if (eventType) {
                        super.emit(eventType); // если всё ОК - то даём шине отработать событие
                    }
                }
            }
            catch {
                // do nothing
            }
        };
        window.addEventListener('storage', onStorage);
        this.onDisposeActions.push(() => window.removeEventListener('storage', onStorage));
    }
    emit(eventType) {
        const key = this.connectionId;
        const stringifiedEvent = JSON.stringify(applyEventConstructor(eventType));
        /**
         * Здесь решено оставить прямой доступ к localStorage.
         * В данном случае localStorage используется не как хранилище, а как альтернатива
         * браузерному BroadcastChannel API (слабая поддержка).
         */
        try {
            window.localStorage.removeItem(key);
            window.localStorage.setItem(key, stringifiedEvent);
        }
        catch { }
    }
    // события, предназначенные только для своего таба
    emitLocally(eventType, payload) {
        super.emit(eventType, payload);
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        this.onDisposeActions.forEach((action) => action());
    }
}
//# sourceMappingURL=BroadcastChannel.js.map