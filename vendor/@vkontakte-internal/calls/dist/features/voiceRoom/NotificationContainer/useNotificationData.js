import { jsx as _jsx } from "react/jsx-runtime";
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getVoiceRoomNotification, setVoiceRoomNotification } from '../../../features/voiceRoom';
import { VoiceRoomNotification } from '@vkontakte-internal/calls-core';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { useLang } from '../../../hooks/useLang';
import { AccessiblyButton } from './AccessiblyButton';
export const useNotificationData = () => {
    const { getLang } = useLang();
    const dispatch = useTypedDispatch();
    const notification = useTypedSelector(getVoiceRoomNotification);
    const closeNotification = () => dispatch(setVoiceRoomNotification(null));
    let actions;
    let header = '';
    let subheader;
    switch (notification) {
        case VoiceRoomNotification.MOVE_SPEAKER_TO_ADMIN: {
            header = getLang('voicerooms_move_speaker_to_admin_notification');
            actions = (_jsx(AccessiblyButton, { children: getLang('voicerooms_move_speaker_to_admin_notification_button') }));
            break;
        }
        case VoiceRoomNotification.MOVE_ADMIN_TO_SPEAKER: {
            header = getLang('voicerooms_move_admin_to_speaker_notification');
            actions = (_jsx(AccessiblyButton, { children: getLang('voicerooms_move_admin_to_speaker_notification_button') }));
            break;
        }
        case VoiceRoomNotification.MOVE_SPEAKER_TO_LISTENER: {
            header = getLang('voicerooms_move_speaker_to_listener_notification');
            actions = (_jsx(AccessiblyButton, { children: getLang('voicerooms_move_speaker_to_listener_notification_button') }));
            break;
        }
        case VoiceRoomNotification.MOVE_LISTENER_TO_SPEAKER: {
            header = getLang('voicerooms_move_listener_to_speaker_notification');
            actions = (_jsx(AccessiblyButton, { children: getLang('voicerooms_move_listener_to_speaker_notification_button') }));
            break;
        }
        case VoiceRoomNotification.DECLINE_PROMOTION_REQUEST: {
            header = getLang('voicerooms_decline_promotion_request_notification');
            actions = (_jsx(AccessiblyButton, { children: getLang('voicerooms_decline_promotion_request_notification_button') }));
            break;
        }
        case VoiceRoomNotification.PROMOTED_LIMIT_ERROR: {
            header = getLang('voicerooms_promoted_limit_notification');
            actions = (_jsx(AccessiblyButton, { children: getLang('voicerooms_promoted_limit_notification_button') }));
            break;
        }
        case VoiceRoomNotification.RECORDING_FINISHED: {
            header = getLang('voicerooms_recording_finished_notification_header');
            subheader = getLang('voicerooms_recording_finished_notification_description');
            break;
        }
    }
    return { actions, closeNotification, header, subheader };
};
//# sourceMappingURL=useNotificationData.js.map