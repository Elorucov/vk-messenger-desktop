import '../../ui/ModalInterface/ModalInterface.css';
import React from 'react';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon20Cancel } from '@vkontakte/icons';
import './ModalWindow.css';
export const ModalWindow = ({ onClose, closeLabel, title, contextClass, panelClass, hasClearBackdrop, portalTarget, withCustomLayout, children, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalView, { onEscape: onClose, contextClass: contextClass, portalTarget: portalTarget },
        React.createElement(ModalBackdrop, { onClick: onClose, isClear: hasClearBackdrop },
            React.createElement("section", { className: "ModalWindow", "aria-label": title },
                React.createElement("button", { className: "ModalWindow__close", type: "button", "aria-label": closeLabel ?? lang.use('me_close'), onClick: onClose },
                    React.createElement("span", { className: "ModalWindow__closeInner" },
                        React.createElement(Icon20Cancel, null))),
                React.createElement(ModalPanel, { className: panelClass },
                    React.createElement(ModalBody, { withCustomLayout: withCustomLayout }, children))))));
};
//# sourceMappingURL=ModalWindow.js.map