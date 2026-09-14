import '../../ui/ConfirmationModal/ConfirmationModal.css';
import React from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useBrowserEnv } from '../../hooks/misc';
import { Button } from '@vkontakte/vkui';
export const ConfirmationModal = ({ onClose, onConfirm, title, text, confirmText, closeText, panelClass, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalInterface, { withCustomLayout: true, onClose: onClose, closeLabel: lang.use('me_close'), title: title, buttons: React.createElement(React.Fragment, null,
            React.createElement(Button, { mode: "secondary", size: "m", onClick: onClose }, closeText ?? lang.use('me_cancel')),
            React.createElement(Button, { mode: "primary", size: "m", onClick: onConfirm }, confirmText)), panelClass: panelClass },
        React.createElement("div", { className: "ConfirmationModal__body" },
            React.createElement("span", null, text))));
};
//# sourceMappingURL=ConfirmationModal.js.map