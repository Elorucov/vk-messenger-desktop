var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from 'react';
import { ActionButtonVkui } from './ActionVkui';
import { ActionVkcom } from './ActionVkcom';
// @elephizeTarget
export const ActionButton = (_a) => {
    var { children } = _a, restProps = __rest(_a, ["children"]);
    return window._elephizeIsServer ?
        React.createElement(ActionVkcom, Object.assign({}, restProps), children) :
        React.createElement(ActionButtonVkui, Object.assign({}, restProps), children);
};
//# sourceMappingURL=ActionButton.js.map