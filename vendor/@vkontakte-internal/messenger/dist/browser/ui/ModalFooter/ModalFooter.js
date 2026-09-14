import '../../ui/ModalFooter/ModalFooter.css';
import React from 'react';
export const ModalFooter = ({ buttons, hint, children, }) => {
    return (React.createElement("footer", { className: "RE_ModalFooter" },
        hint && React.createElement("div", { className: "RE_ModalFooter__hint" }, hint),
        children && React.createElement("div", { className: "RE_ModalFooter__content" }, children),
        buttons && React.createElement("div", { className: "RE_ModalFooter__actions" }, buttons)));
};
//# sourceMappingURL=ModalFooter.js.map