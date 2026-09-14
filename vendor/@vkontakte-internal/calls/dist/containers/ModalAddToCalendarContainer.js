import { jsx as _jsx } from "react/jsx-runtime";
import { ModalEventPlanned } from '../components/ModalEventPlanned/ModalEventPlanned';
import { useCalendarEventDetails } from '../components/ModalScheduleCall';
import { useCloseModal } from '../hooks/useCloseModal';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { ModalType, useNotifier } from '@vkontakte-internal/calls-core';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { copyTextToClipboard } from '@vkontakte/vkjs';
import { usePromiseError } from '../hooks/usePromiseError';
import { handlePromiseError } from '../helpers/logger';
import { useLang } from '../hooks/useLang';
import { toggleModal } from '../actions';
import { useConfig } from '../services/config';
import { ClickHouseEventType, useSendStatsService } from '../stats/clickHouse';
export const ModalAddToCalendarContainer = ({ event }) => {
    const { handleError } = usePromiseError();
    const { getLang, langReplace } = useLang();
    const { showText } = useNotifier();
    const dispatch = useTypedDispatch();
    const meParticipant = useTypedSelector((state) => state.participants[state.externalId?.id || state.me]);
    const onClose = useCloseModal();
    const sendStats = useSendStatsService();
    const details = useCalendarEventDetails({ meParticipant });
    const { enableShortCredentials, enableShortCredentialsSferum, sferum } = useConfig();
    const isShortCredentialsEnabled = (enableShortCredentials && !sferum) || (enableShortCredentialsSferum && sferum);
    const text = details.getDescription(event, isShortCredentialsEnabled);
    const detailedDescription = details.getDetailedDescription(event);
    const dateText = details.getTitle(event);
    const handleOnCopyLink = () => {
        copyTextToClipboard(event.joinLink)
            .then(() => {
            showText(getLang('calls_create_call_by_link_copied'));
        })
            .catch(handleError);
    };
    const handleOnCopyBroadcastLink = () => {
        if (!event.broadcastLink) {
            handlePromiseError('No event with broadcast link to copy :(');
            return;
        }
        copyTextToClipboard(event.broadcastLink)
            .then(() => {
            showText(getLang('calls_broadcast_planning_link_copied'));
        })
            .catch(handleError);
    };
    const handleOnCopyShortLink = () => {
        if (!event.shortCredentials) {
            handlePromiseError('No event with short link to copy :(');
            return;
        }
        copyTextToClipboard(langReplace(getLang('calls_short_link_with_password_template'), {
            link: event.shortCredentials.link_without_password,
            password: event.shortCredentials.password,
        }))
            .then(() => {
            showText(getLang('calls_create_call_by_link_copied'));
        })
            .catch(handleError);
    };
    const handleOnCopyText = () => {
        copyTextToClipboard(text)
            .then(() => {
            showText(getLang('calls_create_call_by_link_text_copied'));
        })
            .catch(handleError);
    };
    const handleOnSendByMessage = () => {
        const showPlannedEventModal = () => {
            dispatch(toggleModal(ModalType.SHARE_PLANNED_CALL, { calendarEvent: event }));
        };
        dispatch(toggleModal(ModalType.SEND_LINK, {
            title: getLang('calls_send_call_link_title'),
            initialText: text,
            onClose: showPlannedEventModal,
        }));
    };
    const handleOnQRCodeClick = () => {
        const showPlannedEventModal = () => {
            dispatch(toggleModal(ModalType.SHARE_PLANNED_CALL, { calendarEvent: event }));
        };
        sendStats(ClickHouseEventType.CALL_LINK_QR_CODE_CLICK, {
            session_id: event.callId,
        });
        dispatch(toggleModal(ModalType.QR_CODE, {
            textToEncode: event.joinLink,
            detailedDescription,
            qrFileName: `${event.title} ${dateText}.png`,
            onClose: showPlannedEventModal,
            isSferum: sferum,
            callId: event.callId,
        }));
    };
    return (_jsx(ModalEventPlanned, { onClose: onClose, onCopyText: handleOnCopyText, onCopyJoinLink: handleOnCopyLink, onCopyBroadcastLink: handleOnCopyBroadcastLink, onCopyShortLink: handleOnCopyShortLink, onSendByMessage: handleOnSendByMessage, onQRCodeClick: handleOnQRCodeClick, detailedDescription: detailedDescription, eventTitle: event.title, dateText: dateText }));
};
//# sourceMappingURL=ModalAddToCalendarContainer.js.map