import * as React from 'react';
// @elephizeTarget
const ChevronLeft24 = ({ fill }) => {
    return React.createElement("svg", { width: "16px", height: "24px", viewBox: "0 0 24 24" },
        React.createElement("path", { d: "m15.8839 18.1161c.4881.4882.4881 1.2796 0 1.7678-.4882.4881-1.2796.4881-1.7678 0l-6.99998-7c-.48816-.4882-.48816-1.2796 0-1.7678l6.99998-6.99998c.4882-.48816 1.2796-.48816 1.7678 0 .4881.48815.4881 1.27961 0 1.76776l-6.11613 6.11612z", fill: fill }));
};
// @elephizeTarget
export const ChevronRight24 = ({ fill }) => {
    return React.createElement("svg", { width: "16px", height: "24px", viewBox: "0 0 24 24" },
        React.createElement("path", { d: "m14.2322 12-6.11608-6.11612c-.48816-.48815-.48816-1.27961 0-1.76776.48815-.48816 1.27961-.48816 1.76776 0l7.00002 6.99998c.4881.4882.4881 1.2796 0 1.7678l-7.00002 7c-.48815.4881-1.27961.4881-1.76776 0-.48816-.4882-.48816-1.2796 0-1.7678z", fill: fill }));
};
// @elephizeTarget
export const ScrollBoxVkcom = ({ children, className }) => {
    const classNames = ['SAKWidget__scrollBox', className];
    return (React.createElement("div", { className: classNames.join(' ') },
        React.createElement("div", { className: "SAKWidget__scrollButton SAKWidget__scrollButton--left" },
            React.createElement(ChevronLeft24, null)),
        React.createElement("div", { className: "SAKWidget__scrollButton SAKWidget__scrollButton--right" },
            React.createElement(ChevronRight24, null)),
        children));
};
//# sourceMappingURL=ScrollBoxVkcom.js.map