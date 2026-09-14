import { useCallback } from 'react';
import { mapPrevVirtualBackgroundData } from '../helpers/statsVirtualBackground';
import { effectStorage } from '../helpers/localStorage';
import { useSendStatsService, ClickHouseEventType } from '../stats/clickHouse';
/** прибытый айдишник блюра */
export const BLUR_ID = -16;
/** хук для отправки статистики по виртуальным фонам */
export const useSendStatsDataVirtualBackground = () => {
    const sendStats = useSendStatsService();
    /** @private отправляет статистику о выключенном фоне */
    const sendPrevVirtualBackgroundDisabled = useCallback((prevValue, currTs, prevTs) => {
        const { disabledActionType, prevSendValue, effectDuration } = mapPrevVirtualBackgroundData(prevValue, currTs, prevTs);
        if (disabledActionType !== null) {
            sendStats(disabledActionType, {
                background_id: prevSendValue,
                background_duration: effectDuration,
            });
        }
    }, [sendStats]);
    /** коллбек для отправки статистики при выборе виртуального фона */
    const sendVirtualBackgroundSelected = useCallback((backgroundId, prevValue) => {
        const currTs = Date.now();
        const prevTs = effectStorage.getEffectTs();
        let enabledActionType;
        if (prevTs) {
            // отправляем информацию об отключении виртуального фона
            sendPrevVirtualBackgroundDisabled(prevValue, currTs, prevTs);
        }
        // отправляем информацию о включении виртуального фона
        if (backgroundId > 4000) {
            enabledActionType = ClickHouseEventType.CUSTOM_VIRTUAL_BACKGROUND_SELECTED;
        }
        else {
            enabledActionType = ClickHouseEventType.VIRTUAL_BACKGROUND_SELECTED;
        }
        sendStats(enabledActionType, { background_id: backgroundId });
        effectStorage.saveEffectTs(currTs);
    }, [sendPrevVirtualBackgroundDisabled, sendStats]);
    /** коллбек для отправки статистики при выборе отключения виртуального фона */
    const sendVirtualBackgroundDisabled = useCallback((prevValue) => {
        const prevTs = effectStorage.getEffectTs();
        if (!prevTs) {
            // уже кто то выключил
            return;
        }
        const currTs = Date.now();
        sendPrevVirtualBackgroundDisabled(prevValue, currTs, prevTs);
        effectStorage.clearEffectTs();
    }, [sendPrevVirtualBackgroundDisabled]);
    /** коллбек для отправки статистики при загрузке виртуального фона */
    const sendVirtualBackgroundAdded = useCallback((backgroundId) => {
        sendStats(ClickHouseEventType.CUSTOM_VIRTUAL_BACKGROUND_ADDED, {
            background_id: backgroundId,
        });
    }, [sendStats]);
    /** коллбек для отправки статистики при удалении виртуального фона */
    const sendVirtualBackgroundDeleted = useCallback((backgroundId) => {
        sendStats(ClickHouseEventType.CUSTOM_VIRTUAL_BACKGROUND_DELETED, {
            background_id: backgroundId,
        });
    }, [sendStats]);
    return {
        sendVirtualBackgroundSelected,
        sendVirtualBackgroundDisabled,
        sendVirtualBackgroundDeleted,
        sendVirtualBackgroundAdded,
    };
};
//# sourceMappingURL=useSendStatsDataVirtualBackground.js.map