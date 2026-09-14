import { GlobalStore } from '../../reducers/globalStore';
import { getCommonClickHouseStatsData } from './helpers';
import { callStats } from './collector';
import { handlePromiseError } from '../../helpers/logger';
export const getSendStatService = (commonData) => (eventType, data = {}) => {
    const _commonData = (commonData || {});
    const eventRawData = {
        ..._commonData,
        ...data,
        call_event_type: eventType,
    };
    callStats.logEvent(eventRawData);
};
export const sendStats = (eventType, data = {}) => {
    let state;
    let commonRawData;
    try {
        state = GlobalStore.getCallsState();
        commonRawData = getCommonClickHouseStatsData({
            myId: state.me,
            peerId: state.peer,
            configDeviceId: state.config?.deviceId,
            callId: state.callData?.callId,
            isVoiceRoom: state.isVoiceRoom,
            entryPoint: state.entryPoint,
        });
    }
    catch (e) {
        handlePromiseError(e);
    }
    return getSendStatService(commonRawData)(eventType, data);
};
//# sourceMappingURL=service.js.map