import React from 'react';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { PhoneInvite, } from '../../ui/PhoneInvite/PhoneInvite';
import './PhoneInviteModal.css';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon20Cancel } from '@vkontakte/icons';
export const PhoneInviteModal = ({ onClose, ...props }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalView, { contextClass: "MEConfig", onEscape: onClose },
        React.createElement(ModalBackdrop, { onClick: onClose },
            React.createElement(ModalPanel, { className: "PhoneInviteModal__panel" },
                React.createElement("button", { className: "PhoneInviteModal__close", type: "button", "aria-label": lang.use('me_close'), onClick: onClose },
                    React.createElement("span", { className: "PhoneInviteModal__closeInner" },
                        React.createElement(Icon20Cancel, null))),
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement("div", { className: "PhoneInviteModal" },
                        React.createElement(PhoneInvite, { ...props })))))));
};
//# sourceMappingURL=PhoneInviteModal.js.map