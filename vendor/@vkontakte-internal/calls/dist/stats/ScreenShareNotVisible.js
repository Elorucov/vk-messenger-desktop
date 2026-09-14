import { useEffect } from 'react';
import { MediaType } from '@vkontakte/calls-sdk';
import { isString } from '@vkontakte/vkjs';
import { sendStats } from './clickHouse';
import { externalIdToString, ClickHouseEventType } from '@vkontakte-internal/calls-core';
/** максимальный срок жизни таймера по стате шары */
const WAIT_MAX = 30 * 1000;
/** минимальная задержка, до которой мы не отправляем статистику */
const MIN_DIFF = 10 * 1000;
/** хелпер для логирования задержек физического получения стрима со скриншарой */
class ScreenShareNotVisibleStat {
    constructor() {
        this._timers = new Map();
        this._isEnabled = false;
    }
    /** вызываем один раз, чтобы выставить фича флаг */
    init(isEnabled) {
        this._isEnabled = isEnabled;
    }
    /** при завершении звонка очищаем таймеры */
    destroy() {
        for (const timerValue of this._timers.values()) {
            clearTimeout(timerValue.timer);
        }
        this._timers.clear();
    }
    /** проверяем запрошенные \ остановленные udl по скриншаре */
    checkLayoutDiff(layouts) {
        if (!this._isEnabled) {
            return;
        }
        for (const layout of layouts) {
            if (isString(layout.uid)) {
                // скорее всего, таких не будет, но мы в любом случае
                // их не сметчим с коллбеками сдк, поэтому пропускаем
                continue;
            }
            if (layout.mediaType !== MediaType.SCREEN) {
                // layout не по скриншаре
                continue;
            }
            const deviceId = externalIdToString(layout.uid);
            if ('stopStream' in layout) {
                this._clearMark(deviceId);
            }
            else {
                this._mark(deviceId);
            }
        }
    }
    /** замеряем время получения стрима с скриншарой */
    measure(externalId) {
        if (!this._isEnabled) {
            return;
        }
        this._collectStat(externalIdToString(externalId));
    }
    /** видим udl с запросом скриншары */
    _mark(deviceId) {
        this._clearMark(deviceId);
        this._timers.set(deviceId, {
            timer: setTimeout(this._collectStat.bind(this, deviceId), WAIT_MAX),
            ts: Date.now(),
        });
    }
    /** отключаем таймер по скриншаре */
    _clearMark(deviceId) {
        this._getTimerValue(deviceId);
    }
    _getTimerValue(deviceId) {
        const prev = this._timers.get(deviceId);
        if (prev) {
            clearTimeout(prev.timer);
            this._timers.delete(deviceId);
            return prev.ts;
        }
        return null;
    }
    _collectStat(deviceId) {
        const ts = this._getTimerValue(deviceId);
        if (ts === null) {
            return;
        }
        const diff = Date.now() - ts;
        if (diff < MIN_DIFF) {
            return;
        }
        sendStats(ClickHouseEventType.SCREEN_SHARE_NOT_VISIBLE, { event_param: diff });
    }
}
/** хелпер для логирования задержек физического получения стрима со скриншарой */
export const screenShareNotVisibleStat = new ScreenShareNotVisibleStat();
/** хук для использования в `App.tsx` */
export function useScreenShareNotVisibleStat(isInActiveCall, isEnabled) {
    useEffect(() => {
        if (isInActiveCall) {
            screenShareNotVisibleStat.init(isEnabled);
            return () => screenShareNotVisibleStat.destroy();
        }
    }, [isInActiveCall]);
}
//# sourceMappingURL=ScreenShareNotVisible.js.map