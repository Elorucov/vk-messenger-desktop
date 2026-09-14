import React, { useCallback, useId } from 'react';
import { Button } from '@vkontakte/vkui';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
export const ConfirmPinMessageModal = ({ peerId, message, handleModalClose, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const modalTitleId = useId();
    const handleModalSubmit = useCallback(() => {
        dispatch({
            type: 'UserPinMessage',
            cmid: message.cmid,
            peerId,
            userAction: 'pin_message_for_all',
        });
        handleModalClose();
    }, [dispatch, message, peerId, handleModalClose]);
    return (React.createElement(ModalView, { onEscape: handleModalClose, contextClass: "MEConfig" },
        React.createElement(ModalBackdrop, { onClick: handleModalClose },
            React.createElement(ModalPanel, { ariaLabelledby: modalTitleId },
                React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: handleModalClose, title: lang.use('me_message_confirm_pin_modal_title'), titleId: modalTitleId }),
                React.createElement(ModalBody, null,
                    React.createElement(FormattedLangKey, { values: { bold: (text) => React.createElement("b", null, text) }, langkey: "me_message_confirm_pin_modal_text" })),
                React.createElement(ModalFooter, { buttons: [
                        React.createElement(Button, { mode: "tertiary", key: "cancel", onClick: handleModalClose }, lang.use('me_cancel')),
                        React.createElement(Button, { mode: "primary", key: "submit", onClick: handleModalSubmit }, lang.use('me_message_confirm_pin_modal_submit')),
                    ] })))));
};
//# sourceMappingURL=ConfirmPinMessageModal.js.map