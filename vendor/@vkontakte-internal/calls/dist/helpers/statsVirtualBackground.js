import { EVideoEffectType, VIRTUAL_BACKGROUND_BLUR_ID } from '../constants';
import { isGroupCallByPeer } from '@vkontakte-internal/calls-core';
import { effectStorage } from '../helpers/localStorage';
import { ClickHouseEventType, sendStats } from '../stats/clickHouse';
export const mapPrevVirtualBackgroundData = (prevValue, currTs, prevTs) => {
    let disabledActionType = null;
    let prevSendValue = prevValue.id; // при блюре подставим (int) "-16"
    if (prevValue.type === EVideoEffectType.BLUR) {
        // блюр
        disabledActionType = ClickHouseEventType.VIRTUAL_BACKGROUND_DISABLED;
        prevSendValue = VIRTUAL_BACKGROUND_BLUR_ID;
    }
    else if (typeof prevValue === 'number') {
        // предустановленные фоны имеют id < 4000
        if (prevValue > 4000) {
            // пользовательский фон
            disabledActionType = ClickHouseEventType.CUSTOM_VIRTUAL_BACKGROUND_DISABLED;
        }
        else {
            // предустановленный фон
            disabledActionType = ClickHouseEventType.VIRTUAL_BACKGROUND_DISABLED;
        }
    }
    const effectDuration = Math.round((currTs - prevTs) / 1000); // в секундах
    return {
        prevSendValue,
        disabledActionType,
        effectDuration,
    };
};
/** хелпер для отправки статы по выключению виртуального фоне не из под реакта */
export const sendVirtualBackgroundDisabled = (sessionId, peerId) => {
    const prevTs = effectStorage.getEffectTs();
    if (!prevTs) {
        // уже кто то выключил
        return;
    }
    effectStorage.clearEffectTs(); // очищаем ts
    const prevValue = effectStorage.getEffect();
    const currTs = Date.now();
    const isGroupCall = isGroupCallByPeer(peerId);
    const { disabledActionType, effectDuration, prevSendValue } = mapPrevVirtualBackgroundData(prevValue, currTs, prevTs);
    if (disabledActionType !== null) {
        sendStats(disabledActionType, {
            is_group_call: isGroupCall,
            peer_id: peerId,
            session_id: sessionId,
            background_duration: effectDuration,
            background_id: prevSendValue,
            device_id: '',
        });
    }
};
//# sourceMappingURL=statsVirtualBackground.js.map