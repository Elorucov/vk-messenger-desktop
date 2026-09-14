import { Icon24Add } from '@vkontakte/icons';
import React from 'react';
import './FolderAddButton.css';
import { FieldGroupItem } from '../../ui/FieldGroup/FieldGroup';
import { Avatar } from '@vkontakte/vkui';
export const FolderAddButton = ({ children, icon = React.createElement(Icon24Add, { fill: "var(--vkui--color_icon_accent)" }), onClick, }) => {
    return (React.createElement(FieldGroupItem, { hasActive: true, hasHover: true, before: icon && (React.createElement(Avatar, { size: 40, noBorder: true, fallbackIcon: icon, "aria-hidden": "true" })), onClick: onClick },
        React.createElement("span", { className: "FolderAddButton__text" }, children)));
};
//# sourceMappingURL=FolderAddButton.js.map