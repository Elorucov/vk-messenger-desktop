import { useLang } from '../../hooks/useLang';
import { useNotifier, ECalendar, EMailRuGoals, mailRuCounter, } from '@vkontakte-internal/calls-core';
import { copyTextToClipboard } from '@vkontakte/vkjs';
import { usePromiseError } from '../../hooks/usePromiseError';
import { CallWithLiveStatsReason, useSendStatsDataCallScheduled, } from '../../hooks/useSendStatsDataCallScheduled';
import { vou } from '../../helpers/helpers';
import { getBroadcastLink } from '../../helpers/url';
import { useConfig } from '../../services/config';
import { useCalendarEventDetails } from './useCalendarEventDetails';
import { createGoogleCalendarUrl, createMailRuCalendarUrl, ics, openLinkInNewTab } from './utils';
export function useHandleSuccessScheduleCall({ me, isSferum }) {
    const { handleError } = usePromiseError();
    const { getDescription } = useCalendarEventDetails({ meParticipant: me });
    const { showText } = useNotifier();
    const { getLang } = useLang();
    const { sendCallScheduled } = useSendStatsDataCallScheduled();
    const { deviceId, enableShortCredentials, enableShortCredentialsSferum, sferum } = useConfig();
    const isShortCredentialsEnabled = (enableShortCredentials && !sferum) || (enableShortCredentialsSferum && sferum);
    return ({ params, data, call, closePopup, setPlannedCalendarEvent }) => {
        const start = new Date(params.start);
        const event = {
            start,
            title: params.name,
            repeatRule: params.rrule,
            duration: params.duration,
            displayName: params.displayName,
            timezone: params.timezone,
            repeatRuleEnd: params.recurrenceUntilTime,
            broadcastLink: vou(!!params.broadcastId, getBroadcastLink(params.broadcastId, isSferum)),
            joinLink: data?.join_link || call?.vk_join_link || '',
            location: getLang('calls_default_meeting_name'),
            callId: data?.call_id || call?.call_id || '',
            shortCredentials: data?.short_credentials || call?.short_credentials,
        };
        const description = getDescription(event, isShortCredentialsEnabled);
        event.description = description;
        // копируем в буфер ссылку на звонок
        copyTextToClipboard(description)
            .then(() => {
            showText(getLang('calls_create_call_by_link_text_copied'));
        })
            .catch(handleError);
        sendCallScheduled({
            sharingChannel: params.calendar,
            reason: vou(!!params.broadcastId, CallWithLiveStatsReason),
            creatorId: call ? call.caller_id : params.groupId,
            session_id: data?.call_id || call?.call_id || '',
            deviceId,
            isEdit: !!call,
            chatHistoryEnabled: params.showChatHistory,
        });
        if (!call && data) {
            mailRuCounter.push(EMailRuGoals.ScheduledCall);
        }
        switch (params.calendar) {
            case ECalendar.Other: {
                // сохраняем данные в стейт для других модалок
                setPlannedCalendarEvent(event);
                if (!call) {
                    return;
                }
                break;
            }
            case ECalendar.MailRu: {
                const url = createMailRuCalendarUrl(event);
                openLinkInNewTab(url, start);
                break;
            }
            case ECalendar.Google: {
                const url = createGoogleCalendarUrl(event);
                openLinkInNewTab(url, start);
                break;
            }
            case ECalendar.iCloud:
            case ECalendar.Outlook: {
                const url = ics(event);
                openLinkInNewTab(url, start, false);
                break;
            }
        }
        closePopup();
    };
}
//# sourceMappingURL=useHandleSuccessScheduleCall.js.map