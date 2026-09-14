import React from 'react';
import cx from 'classnames';
import '../../ui/RightPanel/RightPanelIconButton.css';
export const RightPanelIconButton = ({ children, className, side, ...attributes }) => {
    return (React.createElement("button", { ...attributes, className: cx('RightPanelControl', `RightPanelControl--${side}`, className) }, children));
};
//# sourceMappingURL=RightPanelIconButton.js.map