import { DeferredRendering } from '../../ui/DeferredRendering/DeferredRendering';
import '../../ui/ListHeader/ListHeader.css';
import React from 'react';
export const ListHeader = ({ title, before, after, }) => {
    return (React.createElement("div", { className: "vkmListHeader" },
        React.createElement("div", { className: "vkmListHeader__before" }, before),
        React.createElement("div", { className: "vkmListHeader__title" }, title),
        React.createElement(DeferredRendering, null,
            React.createElement("div", { className: "vkmListHeader__after" }, after))));
};
//# sourceMappingURL=ListHeader.js.map