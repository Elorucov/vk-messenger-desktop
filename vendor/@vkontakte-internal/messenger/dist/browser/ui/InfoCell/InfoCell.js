import React from 'react';
import cx from 'classnames';
import '../../ui/InfoCell/InfoCell.css';
export const InfoCell = ({ left, right, children, className, onClick, ...attributes }) => {
    return (React.createElement("div", { ...attributes, className: cx('InfoCell', { 'InfoCell--clickable': Boolean(onClick) }, className), onClick: onClick, role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : -1 },
        React.createElement("div", { className: "InfoCell__left" }, left),
        React.createElement("div", { className: "InfoCell__content" }, children),
        right && React.createElement("div", { className: "InfoCell__right" }, right)));
};
//# sourceMappingURL=InfoCell.js.map