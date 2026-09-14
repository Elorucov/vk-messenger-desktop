import React from 'react';
import cx from 'classnames';
import './FolderListRow.css';
import { Icon24CheckCircleOff, Icon24CheckCircleOn } from '@vkontakte/icons';
export const FolderListRow = ({ title, subtitle, avatar, onClick, before, after, showCheckbox, checkbox = false, }) => {
    const Tag = onClick ? 'button' : 'div';
    return (React.createElement(Tag, { className: cx('FolderListRow', {
            'FolderListRow--clickable': Boolean(onClick),
        }), onClick: onClick },
        before && React.createElement("span", { className: "FolderListRow__before" }, before),
        showCheckbox && (React.createElement("span", { className: cx('FolderListRow__checkbox', {
                'FolderListRow__checkbox--active': checkbox,
            }) }, checkbox ? React.createElement(Icon24CheckCircleOn, null) : React.createElement(Icon24CheckCircleOff, null))),
        avatar && React.createElement("span", { className: "FolderListRow__avatar" }, avatar),
        React.createElement("span", { className: "FolderListRow__content" },
            React.createElement("span", { className: "FolderListRow__title" }, title),
            subtitle && (React.createElement("span", { className: "FolderListRow__sub-title" }, subtitle))),
        after && React.createElement("span", { className: "FolderListRow__after" }, after)));
};
//# sourceMappingURL=FolderListRow.js.map