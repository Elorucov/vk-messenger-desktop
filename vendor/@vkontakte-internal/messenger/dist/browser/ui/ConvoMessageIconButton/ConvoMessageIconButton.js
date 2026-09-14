import React from 'react';
import cx from 'classnames';
import './ConvoMessageIconButton.css';
export const ConvoMessageIconButton = ({ icon, onClick, className, ...restProps }) => {
    return (React.createElement("button", { className: cx('ConvoMessageIconButton', className), onClick: onClick, ...restProps }, icon));
};
//# sourceMappingURL=ConvoMessageIconButton.js.map