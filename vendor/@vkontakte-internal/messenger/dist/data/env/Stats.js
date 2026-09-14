import { isDev, toNonEmpty } from '../../core/utils/misc';
/**
 * Коллектор для статы, решающий следующие проблемы:
 * 1) Отправка всей статистики одним запросом (батчинг)
 * 2) Сохранение всех состояний при внесении изменений (персистентность)
 * 3) В случае дисконнекта и/или других возможных прерываний работы
 *    приложения, данные будут сохранены и отправлены в следующий
 *    раз, когда будет возможно
 * 4) Синхронизация отправки ивентов между вкладками с приложением (благодаря IndexedDB)
 */
class StatsCollector {
    statsConfig;
    storage;
    sendStats;
    intervalId;
    constructor(statsConfig, storage, sendStats) {
        this.statsConfig = statsConfig;
        this.storage = storage;
        this.sendStats = sendStats;
        const INTERVAL_DELAY = 20 * 1000;
        /**
         * Отправляем данные в цикле раз в INTERVAL_DELAY милисекунд.
         *
         * Если запрос зафейлился - то он ретрайнится сам
         * на следующей итерации (с дополненными данными).
         */
        this.intervalId = window.setInterval(async () => {
            try {
                await this.pushStats();
            }
            catch (e) {
                console.error(`[Stats] Ошибка отправки статистики: ${e}`);
            }
        }, INTERVAL_DELAY);
    }
    collectEvent = (data) => {
        this.storage
            .updateIDB('stats-transport-data', (logs) => {
            if (logs?.length) {
                return [...logs, data];
            }
            return [data];
        })
            .catch((e) => {
            console.error(`[Stats] Ошибка записи: ${e}`);
        });
    };
    /**
     * Метод для отправки статы в цикле.
     * Если применяется после неудачи, то будут отправлены как старые,
     * так и новые события
     */
    pushStats = async () => {
        const events = (await this.storage.getIDB('stats-transport-data')) || [];
        /**
         * Через slice взяли максимум, который можем отправить за один запрос.
         */
        const strippedEvents = toNonEmpty(
        /**
         * Значение максимального количества событий контролируется тогглом
         * (чтобы можно было понять какие ограничения могут существовать и
         * вовремя все изменить по тогглу)
         *
         * В случае, если тоггл отключили или выставили значение в true,
         * применяем значение по умолчанию
         */
        events.slice(0, this.statsConfig.sendingAmount || 1000));
        if (!strippedEvents) {
            return;
        }
        const strippedEventsIds = new Set(strippedEvents.map(({ id }) => id));
        await this.sendStats(strippedEvents);
        /**
         * Успешно отправили статистику - очистили буфер, оставив те события,
         * что не были отправлены, ввиду ограничения
         */
        await this.storage.updateIDB('stats-transport-data', (currentEvents = []) => {
            /**
             * Убрали отправленные ивенты, тем самым оставили те, что не были
             * отправлены + те, что были добавлены во время отправки статистики
             *
             * Проверяем по id ивента, чтобы не перетереть что-то новое, если работаем
             * в двух или более вкладках
             */
            return currentEvents.filter(({ id }) => !strippedEventsIds.has(id));
        });
    };
    /**
     * Освободить ресурсы
     */
    dispose() {
        window.clearInterval(this.intervalId);
        // не забываем отправить оставшиеся логи
        void this.pushStats();
    }
}
export class Stats {
    featureFlags;
    sendLog;
    storage;
    /**
     * Mаксимально положительное int32 число.
     * Предотвращаем переполнение в kphp идентификатора
     */
    static MAX_INT32 = 2147483647;
    collector;
    lastEvent;
    constructor(featureFlags, sendLog, storage) {
        this.featureFlags = featureFlags;
        this.sendLog = sendLog;
        this.storage = storage;
        this.logEvent = this.logEvent.bind(this);
    }
    logEvent(eventData) {
        /**
         * Инициализируем коллектор и цикл отправки
         * в момент получения первого ивент или
         * во время InitialData экшeна
         */
        this.init();
        const event = {
            ...this.getBaseEvent(),
            ...eventData,
        };
        this.getCollector()?.collectEvent(event);
        this.lastEvent = event;
    }
    /**
     * Этот метод используется для неперсистентного (!) трекинга событий во внешние
     * к мессенджеру системы.
     *
     * Если вам нужно трекать событие в ВК, используйте Stats.logEvent().
     *
     * Если возникла необходимость одно и то же событие трекать и в ВК и наружу,
     * тогда следует делать это через trackExternalEvent() и дополнительно отправить
     * его в logEvent() переопределив trackExternalEvent снаружи.
     */
    trackExternalEvent(eventData) {
        if (isDev) {
            console.info(`[Stats]: trackExternalEvent (${eventData.type})`);
        }
    }
    init() {
        if (!this.collector) {
            const { vkm_stats_config: statsConfig } = this.featureFlags;
            this.collector = new StatsCollector(statsConfig, this.storage, this.sendLog);
        }
    }
    getCollector() {
        return this.collector;
    }
    getCurrentTime(isMicrosec = true) {
        const strTime = Date.now().toString(10);
        if (isMicrosec) {
            return strTime + '000';
        }
        return strTime;
    }
    getLastEvent() {
        return this.lastEvent;
    }
    getIntId() {
        return Math.floor(Math.random() * Stats.MAX_INT32);
    }
    getBaseEvent() {
        return {
            id: this.getIntId(),
            prev_id: this.getLastEvent()?.id,
            timestamp: this.getCurrentTime(),
            url: window.location.href,
        };
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        this.collector?.dispose();
    }
}
//# sourceMappingURL=Stats.js.map