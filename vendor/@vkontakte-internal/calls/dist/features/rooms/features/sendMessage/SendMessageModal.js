import { jsx as _jsx } from "react/jsx-runtime";
import { DialogSimpleInput } from '../../../../components/DialogSimpleInput/DialogSimpleInput';
import { useLang } from '../../../../hooks/useLang';
import { useSendMessage } from './useSendMessage';
const MAX_MESSAGE_LENGTH = 150;
export function SendMessageModal({ onCloseDialog }) {
    const { getLang } = useLang();
    const sendMessageController = useSendMessage(onCloseDialog);
    return (_jsx(DialogSimpleInput, { title: getLang('calls_room_control_send_message_modal_header'), placeholder: getLang('calls_room_control_send_message_modal_placeholder'), isTextArea: true, hasLengthCounter: true, onClose: onCloseDialog, onSubmit: sendMessageController.handleSendMessage, value: sendMessageController.message, maxLength: MAX_MESSAGE_LENGTH, isDisabledInput: sendMessageController.loading, disableSubmit: sendMessageController.disableSendMessageControl, onChange: sendMessageController.handleSetMessage, disableBackdropClick: true, submitTitle: getLang('calls_room_control_send_message_modal_action'), cancelTitle: getLang('calls_cancel') }));
}
//# sourceMappingURL=SendMessageModal.js.map