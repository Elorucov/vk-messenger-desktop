import React from 'react';
import cx from 'classnames';
import '../../ui/ActionCell/ActionCell.css';
/**
 * Кнопка действия со значком и текстом
 */
export const ActionCell = ({ icon, children, className, ...attrs }) => {
    return (React.createElement("button", { ...attrs, className: cx('ActionCell', className) },
        React.createElement("div", { className: "ActionCell__icon" }, icon),
        React.createElement("div", { className: "ActionCell__name" }, children)));
};
//# sourceMappingURL=ActionCell.js.map