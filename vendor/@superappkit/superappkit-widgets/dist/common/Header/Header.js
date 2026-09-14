import * as React from 'react';
import { Chevron24 } from '../../icons/chevron_24';
import { ActionTappable } from '../Action/ActionTappable';
// @elephizeTarget
export const WidgetHeaderImage = ({ icon, size }) => {
    return (React.createElement("img", { className: "SAKWidget__headerImage", src: icon, width: size, height: size }));
};
// @elephizeTarget
export const WidgetHeaderIcon = () => {
    return (React.createElement("div", { className: "SAKWidget__headerIcon" },
        React.createElement(Chevron24, { fill: "currentColor" })));
};
// @elephizeTarget
export const WidgetHeader = ({ label, icon, size, action }) => {
    return (React.createElement(ActionTappable, { action: action, className: "SAKWidget__header" },
        icon && React.createElement(WidgetHeaderImage, { icon: icon, size: size }),
        React.createElement("div", { className: "SAKWidget__headerTitle" }, label),
        React.createElement(WidgetHeaderIcon, null)));
};
//# sourceMappingURL=Header.js.map