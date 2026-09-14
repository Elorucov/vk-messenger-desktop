import '../../ui/ModalInterface/ModalInterface.css';
import React, { useId } from 'react';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
export const ModalInterface = ({ onClose, closeLabel, onBack, backLabel, title, contextClass, panelClass, headerClass, hasClearBackdrop, isHidden, portalTarget, buttons, withCustomLayout, children, footerHint, isDarkBody, stickersPopupRootContainerId, withFocusTrap = false, }) => {
    const modalTitleId = useId();
    return (React.createElement(ModalView, { onEscape: onClose, contextClass: contextClass, portalTarget: portalTarget, isHidden: isHidden, withFocusTrap: withFocusTrap },
        React.createElement(ModalBackdrop, { onClick: onClose, isClear: hasClearBackdrop, stickersPopupRootContainerId: stickersPopupRootContainerId },
            React.createElement(ModalPanel, { className: panelClass, ariaLabelledby: modalTitleId },
                React.createElement(ModalHeader, { className: headerClass, closeLabel: closeLabel, onClose: onClose, backLabel: backLabel, onBack: onBack, title: title, titleId: modalTitleId }),
                React.createElement(ModalBody, { withCustomLayout: withCustomLayout, isDark: isDarkBody }, children),
                buttons && React.createElement(ModalFooter, { buttons: buttons, hint: footerHint })))));
};
//# sourceMappingURL=ModalInterface.js.map