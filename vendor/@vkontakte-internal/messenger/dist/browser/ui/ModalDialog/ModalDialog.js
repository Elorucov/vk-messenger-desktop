import '../../ui/ModalDialog/ModalDialog.css';
import React, { useId } from 'react';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
export const ModalDialog = ({ onClose, closeLabel, title, content, buttons, hasClearBackdrop = false, contextClass, portalTarget, }) => {
    const modalTitleId = useId();
    return (React.createElement(ModalView, { onEscape: onClose, contextClass: contextClass, portalTarget: portalTarget },
        React.createElement(ModalBackdrop, { onClick: onClose, isClear: hasClearBackdrop },
            React.createElement(ModalPanel, { className: "RE_ModalDialog__panel", ariaLabelledby: modalTitleId },
                React.createElement(ModalHeader, { closeLabel: closeLabel, onClose: onClose, title: title, titleId: modalTitleId }),
                React.createElement(ModalBody, null, content),
                React.createElement(ModalFooter, { buttons: buttons })))));
};
//# sourceMappingURL=ModalDialog.js.map