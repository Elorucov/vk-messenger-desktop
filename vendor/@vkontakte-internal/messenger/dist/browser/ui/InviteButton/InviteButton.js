import React from 'react';
import { Icon24PhoneAddOutline } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import './InviteButton.css';
export const InviteButton = ({ children, className, buttonClassName, onClick, icon = React.createElement(Icon24PhoneAddOutline, null), }) => {
    return (React.createElement("button", { className: classNames('InviteButton', className), type: "button", onClick: onClick },
        React.createElement("span", { className: classNames('InviteButton__icon', buttonClassName), "aria-hidden": true }, icon),
        React.createElement("span", { className: "InviteButton__label" }, children)));
};
//# sourceMappingURL=InviteButton.js.map