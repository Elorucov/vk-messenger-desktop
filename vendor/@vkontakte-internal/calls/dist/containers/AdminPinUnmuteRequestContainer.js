import { jsx as _jsx } from "react/jsx-runtime";
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { useSelector } from 'react-redux';
import { E_ACTION } from '../constants';
import { NotificationType } from '@vkontakte-internal/calls-core';
import { checkPermissions } from '../permissions';
import { AdminPinUnmuteRequestModal } from '../components/AdminPinUnmuteRequestModal/AdminPinUnmuteRequestModal';
import { MediaOption } from '@vkontakte/calls-sdk';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { handlePromiseError } from '../helpers/logger';
import { useLang } from '../hooks/useLang';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useCloseModal } from '../hooks/useCloseModal';
export const AdminPinUnmuteRequestContainer = () => {
    const SDK = useCallsSDK();
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const state = useSelector((state) => state);
    const localDevice = state.localDevice;
    const mySettings = localDevice.mediaSettings;
    const closeModal = useCloseModal();
    const unmuteAudio = () => {
        const permissionPromise = !!mySettings.isAudioEnabled
            ? Promise.resolve()
            : checkPermissions(SDK, [MediaOption.AUDIO]);
        permissionPromise
            .then(() => {
            if (state.notification?.type === NotificationType.SPEAKING_ON_MUTE) {
                dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: null,
                });
            }
            SDK.toggleLocalAudio(true).catch(handlePromiseError);
        })
            .then(closeModal);
    };
    return (_jsx(AdminPinUnmuteRequestModal, { onClose: closeModal, title: getLang('calls_admin_pin_dialog_title'), description: getLang('calls_admin_pin_dialog_description'), actionButtons: [
            _jsx(Button, { size: "m", onClick: closeModal, mode: "secondary", children: getLang('calls_admin_pin_dialog_cancel') }, "cancel"),
            _jsx(Button, { size: "m", mode: "primary", onClick: unmuteAudio, children: getLang('calls_admin_pin_dialog_action') }, "mic"),
        ] }));
};
//# sourceMappingURL=AdminPinUnmuteRequestContainer.js.map