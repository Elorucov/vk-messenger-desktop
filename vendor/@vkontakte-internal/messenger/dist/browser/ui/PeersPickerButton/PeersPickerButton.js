import React from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import './PeersPickerButton.css';
export const PeersPickerButton = ({ children, icon, className, onClick, }) => {
    return (React.createElement("button", { className: cx('PeersPickerButton', className), onClick: onClick },
        icon && React.createElement("span", { className: "PeersPickerButton__icon" }, icon),
        React.createElement("span", { className: "PeersPickerButton__content" }, children)));
};
//# sourceMappingURL=PeersPickerButton.js.map