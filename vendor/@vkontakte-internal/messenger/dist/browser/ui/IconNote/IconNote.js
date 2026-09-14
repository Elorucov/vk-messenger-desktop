import React from 'react';
import './IconNote.css';
export const IconNote = ({ icon, actions, children, }) => {
    return (React.createElement("div", { className: "IconNote" },
        icon && React.createElement("div", { className: "IconNote__icon" }, icon),
        React.createElement("div", { className: "IconNote__content" }, children),
        actions && React.createElement("div", { className: "IconNote__actions" }, actions)));
};
//# sourceMappingURL=IconNote.js.map