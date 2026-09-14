import * as React from 'react';
import { ScrollBoxVkui } from './ScrollBoxVkui';
import { ScrollBoxVkcom } from './ScrollBoxVkcom';
// @elephizeTarget
export const ScrollBox = ({ children, className }) => {
    return window._elephizeIsServer ?
        React.createElement(ScrollBoxVkcom, { className: className }, children) :
        React.createElement(ScrollBoxVkui, { className: className }, children);
};
// @elephizeTarget
export const ScrollBoxInner = ({ children }) => {
    return (React.createElement("div", { className: "SAKWidget__scrollBoxInner" }, children));
};
//# sourceMappingURL=ScrollBox.js.map