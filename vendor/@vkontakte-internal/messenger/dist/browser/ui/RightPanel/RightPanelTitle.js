import React from 'react';
import cx from 'classnames';
import '../../ui/RightPanel/RightPanelTitle.css';
export const RightPanelTitle = ({ id, children, left, className, }) => {
    return (React.createElement("header", { className: cx('RightPanelTitle', className) },
        left && React.createElement("div", { className: "RightPanelTitle__left" }, left),
        React.createElement("h3", { className: "RightPanelTitle__content", id: id }, children)));
};
//# sourceMappingURL=RightPanelTitle.js.map