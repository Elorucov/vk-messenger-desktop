import { CallStatSource, isGroupCallByPeerAndMe, } from '@vkontakte-internal/calls-core';
export const getCommonClickHouseStatsData = ({ myId, peerId, configDeviceId, callId, isVoiceRoom, entryPoint, }) => {
    let stats = {
        session_id: callId,
        peer_id: peerId,
        device_id: configDeviceId || '',
        is_group_call: isGroupCallByPeerAndMe(peerId, myId),
        is_room: isVoiceRoom,
    };
    if (entryPoint?.source === CallStatSource.MINI_APP) {
        stats.source = CallStatSource.MINI_APP;
        stats.mini_app_id = entryPoint?.miniAppId;
    }
    return stats;
};
//# sourceMappingURL=helpers.js.map