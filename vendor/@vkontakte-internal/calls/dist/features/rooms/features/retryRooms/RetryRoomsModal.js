import { jsx as _jsx } from "react/jsx-runtime";
import { DialogConfirm } from '../../../../components/DialogConfirm/DialogConfirm';
import { useLang } from '../../../../hooks/useLang';
import { useRetryRoomsModel, RetryRoomsProvider } from './RetryRoomsModel';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { InnerHTML } from '@vkontakte-internal/vkcom-kit';
const RetryRoomsModalView = observer(function RetryRoomsModalView() {
    const { onCloseDialog, handleTryAgain } = useRetryRoomsModel();
    const { getLang } = useLang();
    return (_jsx(DialogConfirm, { title: getLang('calls_room_control_retry_title'), description: _jsx(InnerHTML, { children: getLang('calls_room_control_retry_desc') }), cancelTitle: getLang('calls_room_control_retry_cancel'), submitTitle: getLang('calls_room_control_retry_submit'), onClose: onCloseDialog, onSubmit: handleTryAgain }));
});
export const RetryRoomsModal = createWidget(RetryRoomsProvider, RetryRoomsModalView);
//# sourceMappingURL=RetryRoomsModal.js.map