import { ECalendar, ClickHouseEventType, } from '@vkontakte-internal/calls-core';
import { sendStats } from '../stats/clickHouse';
export const CallWithLiveStatsReason = 'Live';
/** хук для отправки статистики по планированию звонка */
export const useSendStatsDataCallScheduled = () => {
    const sendStatsData = (eventType, data) => {
        sendStats(eventType, {
            is_group_call: false,
            ...data,
        });
    };
    /** отправить статиску по запланированному звонку */
    const sendCallScheduled = ({ creatorId, sharingChannel, isEdit, session_id, reason = undefined, deviceId, chatHistoryEnabled = undefined, }) => {
        const actionType = isEdit
            ? ClickHouseEventType.SCHEDULED_CALL_EDITED
            : ClickHouseEventType.CALL_SCHEDULED;
        sendStatsData(actionType, {
            sharing_channel: mapSharingChannel(sharingChannel),
            peer_id: creatorId || 0,
            session_id,
            reason,
            device_id: deviceId,
            ...(chatHistoryEnabled !== undefined && {
                event_param: chatHistoryEnabled ? 1 : 0,
            }),
        });
    };
    return { sendCallScheduled };
};
export function mapSharingChannel(source) {
    switch (source) {
        case ECalendar.Google:
            return 'calendar_google';
        case ECalendar.Other:
            return 'other';
        case ECalendar.Outlook:
            return 'calendar_outlook';
        case ECalendar.iCloud:
            return 'calendar_icloud';
        case ECalendar.MailRu:
            return 'calendar_mailru';
    }
}
//# sourceMappingURL=useSendStatsDataCallScheduled.js.map