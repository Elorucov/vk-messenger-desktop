import React, { useMemo, useCallback, useState } from 'react';
import { useBrowserEnv, useConvo, useDispatch } from './misc';
import { useModal } from '../hooks/useModal';
import { useRouter } from '../ui/Router/Router';
import { AlertInterface } from '../ui/AlertInterface/AlertInterface';
import { ReforgedCheckbox } from '../ui/ReforgedCheckbox/ReforgedCheckbox';
import { Flex } from '@vkontakte-internal/vkcom-kit';
export function useConvoLeave({ modalGroupId, cb } = {}) {
    const { screenRoute, navigate } = useRouter();
    const dispatch = useDispatch();
    const [convoIdToLeave, setConvoIdToLeave] = useState(null);
    const confirmModal = useModal(modalGroupId);
    const handleConvoLeaveAction = useCallback((peerId) => {
        setConvoIdToLeave(peerId);
        confirmModal.open();
    }, [confirmModal]);
    const handleModalClose = useCallback(() => {
        setConvoIdToLeave(null);
        confirmModal.close();
    }, [confirmModal]);
    const handleModalSubmit = useCallback((isClearChat) => {
        if (!convoIdToLeave) {
            return;
        }
        dispatch({
            type: 'UserChangedConvo',
            peerId: convoIdToLeave,
            userAction: isClearChat ? 'leave_and_clear' : 'leave',
        });
        confirmModal.close();
        // Если находимся на странице чата, из которого выходим
        if (screenRoute.kind === 'ConvoRoute' &&
            screenRoute.peerId === convoIdToLeave) {
            navigate({ kind: 'MainRoute', organiser: screenRoute.organiser });
        }
        setConvoIdToLeave(null);
        cb?.();
    }, [dispatch, confirmModal, convoIdToLeave, navigate, screenRoute, cb]);
    const ConfirmModal = useMemo(() => confirmModal.isActive &&
        convoIdToLeave && (React.createElement(ConfirmConvoLeavePopup, { onClose: handleModalClose, onSubmit: handleModalSubmit, peerId: convoIdToLeave })), [
        confirmModal.isActive,
        convoIdToLeave,
        handleModalSubmit,
        handleModalClose,
    ]);
    return {
        ConvoLeaveConfirmModal: ConfirmModal,
        handleConvoLeaveAction,
    };
}
const ConfirmConvoLeavePopup = ({ peerId, onClose, onSubmit, }) => {
    const { lang } = useBrowserEnv();
    const [isClearChatChecked, setIsClearChatChecked] = useState(false);
    const handleCheckboxChange = () => {
        setIsClearChatChecked((prev) => !prev);
    };
    const handleSubmit = () => onSubmit(isClearChatChecked);
    const convo = useConvo(peerId);
    const hasPostponedMessages = convo.postponed.count > 0;
    return (React.createElement(AlertInterface, { onClose: onClose, contextClass: "MEConfig", title: hasPostponedMessages
            ? lang.use('me_leave_chat_with_pending_postponed_msgs_confirm_title')
            : lang.use('me_leave_chat_confirm_title'), actions: [
            {
                title: lang.use('me_cancel'),
                mode: 'cancel',
            },
            {
                title: lang.use('me_leave_chat_confirm_action'),
                mode: 'destructive',
                autoCloseDisabled: true,
                action: handleSubmit,
            },
        ], description: React.createElement(Flex, { direction: "column", gap: 8 },
            React.createElement("span", { style: { whiteSpace: 'break-spaces' } }, lang.use('me_leave_chat_confirm_text')),
            React.createElement(ReforgedCheckbox, { onChange: handleCheckboxChange, checked: isClearChatChecked }, lang.use('me_leave_chat_confirm_clear_chat'))) }));
};
//# sourceMappingURL=useConvoLeave.js.map