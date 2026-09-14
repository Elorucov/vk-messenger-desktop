import '../../ui/ChatInvitationLinkResetModal/ChatInvitationLinkResetModal.css';
import React, { forwardRef, useState, useImperativeHandle, useId } from 'react';
import { Button } from '@vkontakte/vkui';
import { Icon20CheckCircleOutline } from '@vkontakte/icons';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalView } from '../../ui/ModalView/ModalView';
/**
 * Модальное окно, позволяющее аннулировать ссылку-приглашение в чат.
 */
export const ChatInvitationLinkResetModal = forwardRef(function ChatInvitationLinkResetModal({ peerId }, ref) {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const modalTitleId = useId();
    const [open, setOpen] = useState(false);
    useImperativeHandle(ref, () => ({
        open: () => setOpen(true),
        close: () => setOpen(false),
    }), []);
    if (!open)
        return null;
    const resetLink = () => {
        setOpen(false);
        snackbar({
            message: lang.use('me_invite_link_reseted_notification'),
            before: (React.createElement(Icon20CheckCircleOutline, { fill: "var(--vkui--color_icon_accent)" })),
        });
        dispatch({
            type: 'UserResetChatInvitationLink',
            peerId,
        });
    };
    return (React.createElement(ModalView, { onEscape: () => setOpen(false), contextClass: "MEConfig" },
        React.createElement(ModalBackdrop, null,
            React.createElement(ModalPanel, { ariaLabelledby: modalTitleId },
                React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: () => setOpen(false), title: lang.use('me_convo_profile_chat_link'), titleId: modalTitleId }),
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement("div", { className: "ChatInvitationLinkResetModal__warning" }, lang.use('me_invite_link_reset_warning'))),
                React.createElement(ModalFooter, { buttons: [
                        React.createElement(Button, { mode: "tertiary", key: "cancel", onClick: () => setOpen(false) }, lang.use('me_cancel')),
                        React.createElement(Button, { mode: "primary", key: "submit", onClick: resetLink }, lang.use('me_invite_link_reset_button')),
                    ] })))));
});
//# sourceMappingURL=ChatInvitationLinkResetModal.js.map