import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":3}]} */
import { useEffect, useMemo, useRef } from 'react';
import { defaultNotificationLifeSpan, E_ACTION } from '../constants';
import { NotificationType } from '@vkontakte-internal/calls-core';
import { Icon16CamSlash, Icon16Connection, Icon16Sync, Icon24Voice } from '@vkontakte/icons';
import { CallNotification } from '../components/CallNotification/CallNotification';
import { classNames as cx } from '@vkontakte/vkjs';
import { getCallStatus } from '../services/status';
import { isMiniAppSource } from '../helpers/apps';
import { getCallData, getDevices, getEntryPoint, getMyDevice, getMyId, getParticipants, getPeerId, } from '../selectors';
import { useLang } from '../hooks/useLang';
import { IconMicrophoneIndicator, InnerHTML } from '@vkontakte-internal/vkcom-kit';
import { useTypedSelector } from '../hooks/useTypedSelector';
export const CallNotificationContainer = ({ dispatch, notification, participant, className = '', }) => {
    const { getLang, langSex } = useLang();
    const callData = useTypedSelector(getCallData);
    const devices = useTypedSelector(getDevices);
    const entryPoint = useTypedSelector(getEntryPoint);
    const hangupType = useTypedSelector((state) => state.hangupType);
    const maps = useTypedSelector((state) => state.maps);
    const localDevice = useTypedSelector(getMyDevice);
    const myPeerId = useTypedSelector(getMyId);
    const participants = useTypedSelector(getParticipants);
    const peerId = useTypedSelector(getPeerId);
    const notificationContent = useMemo(() => getNotificationContent(notification, getLang, langSex, participant), [notification, participant?.id]);
    const timerId = useRef(0);
    const isMiniApp = useMemo(() => isMiniAppSource(entryPoint?.source), [entryPoint?.source]);
    useEffect(() => {
        if (timerId.current) {
            window.clearTimeout(timerId.current);
        }
        notification?.callback?.();
        /* Ставим таймер, если нотификация есть
         * и она не управляется вручную */
        if (notification && !(notification.timer === 0)) {
            timerId.current = window.setTimeout(() => {
                dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: null,
                });
                timerId.current = 0;
            }, notification.timer || defaultNotificationLifeSpan);
        }
        return () => {
            if (timerId.current) {
                window.clearTimeout(timerId.current);
            }
        };
    }, [notification]);
    const status = getCallStatus({
        callData,
        devices,
        entryPoint,
        hangupType,
        localDevice,
        maps,
        me: myPeerId,
        participants,
        peer: peerId,
    }, getLang);
    const classes = cx(className, {
        'CallNotification__pushToTalk': notification?.type === NotificationType.PUSH_TO_TALK,
        'CallNotification__miniAppNotification': isMiniApp,
        'CallNotification--visually-hidden': notification?.hidden || !(notificationContent || status),
    });
    return _jsx(CallNotification, { className: classes, children: status ? status : notificationContent });
};
function getNotificationContent(notification, getLang, langSex, participant = { name: '', sex: 0, shortName: '', customName: '' }) {
    if (!notification) {
        return null;
    }
    const getParticipantName = (participant) => {
        return participant.customName || participant.name || '';
    };
    switch (notification.type) {
        case NotificationType.SPEAKING_ON_MUTE: {
            return getLang('calls_notification_mic_is_mute');
        }
        case NotificationType.SCREEN_SHARING_STARTED: {
            if (!participant || !participant.name) {
                return _jsx("span", { children: getLang('calls_notification_screen_sharing_started') });
            }
            const string = langSex(participant.sex, 'calls_notification_user_started_screen_sharing', getLang('calls_notification_user_started_screen_sharing', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        case NotificationType.SCREEN_SHARING_STOPPED: {
            if (!participant || !participant.name) {
                return _jsx("span", { children: getLang('calls_notification_screen_sharing_stopped') });
            }
            const string = langSex(participant.sex, 'calls_notification_user_stopped_screen_sharing', getLang('calls_notification_user_stopped_screen_sharing', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        case NotificationType.RAISED_HAND: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_notification_raised_hand', getLang('calls_notification_raised_hand', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        case NotificationType.LOWERED_HAND: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_notification_lowered_hand', getLang('calls_notification_lowered_hand', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        case NotificationType.BAD_NETWORK_CONNECTION: {
            return _jsx("span", { children: getLang('calls_notification_bad_network_connection') });
        }
        case NotificationType.BAD_NETWORK_CONNECTION_DISABLE_CAMERA: {
            return [
                _jsx(Icon16CamSlash, {}, "icon"),
                _jsx("span", { children: getLang('calls_notification_bad_network_connection_disable_camera') }, "text"),
            ];
        }
        case NotificationType.ADMIN_ROLE_GRANTED: {
            return _jsx("span", { children: getLang('calls_notification_admin_role_granted') }, "text");
        }
        case NotificationType.ADMIN_ROLE_REMOVED: {
            return _jsx("span", { children: getLang('calls_notification_admin_role_removed') }, "text");
        }
        case NotificationType.USER_GRANTED_WITH_ADMIN_ROLE: {
            if (!participant || (!participant.name && !participant.shortName)) {
                return null;
            }
            const text = getLang('calls_notification_user_granted_with_admin_role')
                // @todo После исправления shortName в CALL-3519, убрать фолбэк
                .replace('{name}', participant.shortName || participant.name);
            return _jsx("span", { children: text }, "text");
        }
        case NotificationType.PINNED_BY_ADMIN: {
            return _jsx("span", { children: getLang('calls_notification_admin_pinned_self') }, "text");
        }
        case NotificationType.USER_PINNED_BY_ADMIN: {
            if (!participant || (!participant.name && !participant.shortName)) {
                return null;
            }
            const text = getLang('calls_notification_admin_pinned_user')
                // @todo После исправления shortName в CALL-3519, убрать фолбэк
                .replace('{name}', participant.shortName || participant.name);
            return _jsx("span", { children: text }, "text");
        }
        case NotificationType.PUSH_TO_TALK: {
            const text = getLang('calls_notification_push_to_talk_enabled');
            const amISpeaking = notification.data;
            return [
                _jsx(IconMicrophoneIndicator, { activated: amISpeaking, color: "color_icon_contrast", Icon: Icon24Voice }, "icon"),
                _jsx("div", { className: "CallNotification__pushToTalkText", children: text }, "text"),
            ];
        }
        case NotificationType.LINK_COPIED_TO_CLIPBOARD: {
            const text = getLang('calls_create_call_by_link_copied');
            return _jsx("span", { children: text }, "text");
        }
        case NotificationType.ADMIN_MUTE: {
            return _jsx("span", { children: getLang('calls_notification_admin_mute') }, "text");
        }
        case NotificationType.ADMIN_MUTE_AUDIO: {
            return _jsx("span", { children: getLang('calls_notification_admin_mute_audio') }, "text");
        }
        case NotificationType.ADMIN_MUTE_AUDIO_COMMON: {
            return _jsx("span", { children: getLang('calls_notification_admin_permanent_mute_audio_common') }, "text");
        }
        case NotificationType.ADMIN_MUTE_VIDEO_AND_SCREENSHARING: {
            return _jsx("span", { children: getLang('calls_notification_admin_mute_video') }, "text");
        }
        case NotificationType.ADMIN_MUTE_VIDEO: {
            return _jsx("span", { children: getLang('calls_notification_admin_mute_video_only') }, "text");
        }
        case NotificationType.ADMIN_MUTE_VIDEO_COMMON: {
            return _jsx("span", { children: getLang('calls_notification_admin_mute_video_only_common') }, "text");
        }
        case NotificationType.ADMIN_MUTE_SCREENSHARING: {
            return _jsx("span", { children: getLang('calls_notification_admin_mute_screensharing') }, "text");
        }
        case NotificationType.ADMIN_MUTE_SCREENSHARING_COMMON: {
            return (_jsx("span", { children: getLang('calls_notification_admin_permanent_mute_screensharing_common') }, "text"));
        }
        case NotificationType.ADMIN_MUTE_PERMANENT: {
            return _jsx("span", { children: getLang('calls_notification_admin_permanent_mute') }, "text");
        }
        case NotificationType.ADMIN_MUTE_PERMANENT_AUDIO: {
            return _jsx("span", { children: getLang('calls_notification_admin_permanent_mute_audio') }, "text");
        }
        case NotificationType.ADMIN_MUTE_PERMANENT_VIDEO_AND_SCREENSHARING: {
            return _jsx("span", { children: getLang('calls_notification_admin_permanent_mute_video') }, "text");
        }
        case NotificationType.ADMIN_MUTE_PERMANENT_VIDEO: {
            return _jsx("span", { children: getLang('calls_notification_admin_permanent_mute_video_only') }, "text");
        }
        case NotificationType.ADMIN_MUTE_PERMANENT_SCREENSHARING: {
            return _jsx("span", { children: getLang('calls_notification_admin_permanent_mute_screensharing') }, "text");
        }
        case NotificationType.ADMIN_MUTE_PERMANENT_WATCH_TOGETHER: {
            return _jsx("span", { children: getLang('calls_notification_admin_permanent_mute_watch_together') }, "text");
        }
        case NotificationType.ADMIN_UNMUTE_PERMANENT: {
            return _jsx("span", { children: getLang('calls_notification_admin_unmute') }, "text");
        }
        case NotificationType.ADMIN_UNMUTE_PERMANENT_AUDIO: {
            return _jsx("span", { children: getLang('calls_notification_admin_unmute_audio') }, "text");
        }
        case NotificationType.ADMIN_UNMUTE_PERMANENT_VIDEO_AND_SCREENSHARING: {
            return _jsx("span", { children: getLang('calls_notification_admin_unmute_video') }, "text");
        }
        case NotificationType.ADMIN_UNMUTE_PERMANENT_VIDEO: {
            return _jsx("span", { children: getLang('calls_notification_admin_unmute_video_only') }, "text");
        }
        case NotificationType.ADMIN_UNMUTE_PERMANENT_SCREENSHARING: {
            return _jsx("span", { children: getLang('calls_notification_admin_unmute_screensharing') }, "text");
        }
        case NotificationType.ENTER_TO_ROOM: {
            return (_jsx("span", { children: getLang('calls_notification_enter_to_room').replace('{name}', notification.data) }, "text"));
        }
        case NotificationType.EXIT_FROM_ROOM: {
            return _jsx("span", { children: getLang('calls_notification_exit_from_room') }, "text");
        }
        case NotificationType.ROOM_HELP_REQUESTED: {
            return _jsx("span", { children: getLang('calls_notification_room_help_requested') }, "text");
        }
        case NotificationType.ROOMS_OPENED: {
            return _jsx("span", { children: getLang('calls_notification_room_rooms_opened') }, "text");
        }
        case NotificationType.ROOMS_CLOSED: {
            return _jsx("span", { children: getLang('calls_notification_room_rooms_closed') }, "text");
        }
        case NotificationType.ROOMS_CLOSED_BY_ADMIN: {
            return _jsx(InnerHTML, { children: getLang('calls_notification_room_rooms_closed_by_admin') }, "text");
        }
        case NotificationType.ADMIN_UNMUTE_PERMANENT_WATCH_TOGETHER: {
            return _jsx("span", { children: getLang('calls_notification_admin_unmute_watch_together') }, "text");
        }
        case NotificationType.ROOMS_ADMIN_MESSAGE_SENT: {
            return _jsx("span", { children: getLang('calls_room_control_message_is_sent_snackbar') }, "text");
        }
        case NotificationType.MOVIE_ALREADY_STARTED: {
            return notification.data ? (_jsx("span", { children: getLang('calls_movie_already_started_modal_content').replace('{userName}', notification.data) }, "text")) : null;
        }
        case NotificationType.NETWORK_PROBLEMS: {
            return [
                _jsx("div", { className: `CallNotification__connection--${notification.data?.status ?? 'bad'}`, children: _jsx(Icon16Connection, {}) }, "icon"),
                _jsx("span", { children: getLang('calls_notification_bad_signal') }, "text"),
            ];
        }
        case NotificationType.CONNECTING: {
            return [
                _jsx("div", { className: "CallNotification__connecting", children: _jsx(Icon16Sync, {}) }, "icon"),
                _jsx("span", { children: getLang('calls_notification_connecting') }, "text"),
            ];
        }
        case NotificationType.PARTICIPANT_JOINED_THE_CALL: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_participant_joined_the_call', getLang('calls_participant_joined_the_call', 'raw'));
            return _jsx("span", { children: string.replace('{user}', participant.customName || participant.name) });
        }
        case NotificationType.PARTICIPANT_LEFT_THE_CALL: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_participant_left_the_call', getLang('calls_participant_left_the_call', 'raw'));
            return _jsx("span", { children: string.replace('{user}', participant.customName || participant.name) });
        }
        case NotificationType.SHARE_MOVIE_STARTED: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_notification_user_started_movie_sharing', getLang('calls_notification_user_started_movie_sharing', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        case NotificationType.SHARE_MOVIE_STOPPED: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_notification_user_stopped_movie_sharing', getLang('calls_notification_user_stopped_movie_sharing', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        case NotificationType.PARTICIPANT_CALL_RECORD_STARTED: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_participant_call_record_started', getLang('calls_participant_call_record_started', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        case NotificationType.PARTICIPANT_CALL_RECORD_STOPPED: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_participant_call_record_stopped', getLang('calls_participant_call_record_stopped', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        case NotificationType.PARTICIPANT_CALL_STREAM_STARTED: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_participant_call_stream_started', getLang('calls_participant_call_stream_started', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        case NotificationType.PARTICIPANT_CALL_STREAM_STOPPED: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_participant_call_stream_stopped', getLang('calls_participant_call_stream_stopped', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        case NotificationType.PARTICIPANT_TURNED_ON_CAMERA: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_participant_turned_on_camera', getLang('calls_participant_turned_on_camera', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        case NotificationType.PARTICIPANT_TURNED_OFF_CAMERA: {
            if (!participant || !participant.name) {
                return null;
            }
            const string = langSex(participant.sex, 'calls_participant_turned_off_camera', getLang('calls_participant_turned_off_camera', 'raw'));
            return _jsx("span", { children: string.replace('{user}', getParticipantName(participant)) });
        }
        default: {
            return _jsx(_Fragment, {});
        }
    }
}
//# sourceMappingURL=CallNotificationContainer.js.map