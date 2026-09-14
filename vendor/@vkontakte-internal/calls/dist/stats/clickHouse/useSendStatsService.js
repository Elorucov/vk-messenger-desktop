import { useCallback } from 'react';
import { shallowEqual } from 'react-redux';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { getCommonClickHouseStatsData } from './helpers';
import { getSendStatService } from './service';
export const useSendStatsService = () => {
    const commonRawData = useTypedSelector((state) => getCommonClickHouseStatsData({
        myId: state.me,
        peerId: state.peer,
        configDeviceId: state.config?.deviceId,
        callId: state.callData?.callId,
        isVoiceRoom: state.isVoiceRoom,
        entryPoint: state.entryPoint,
    }), shallowEqual);
    return useCallback(getSendStatService(commonRawData), [commonRawData]);
};
//# sourceMappingURL=useSendStatsService.js.map