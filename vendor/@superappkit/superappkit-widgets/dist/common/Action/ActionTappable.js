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
import { ActionTappableVkui } from './ActionVkui';
import { ActionVkcom } from './ActionVkcom';
// @elephizeTarget
export const ActionTappable = (_a) => {
    var { children } = _a, restProps = __rest(_a, ["children"]);
    return window._elephizeIsServer ?
        React.createElement(ActionVkcom, Object.assign({}, restProps), children) :
        React.createElement(ActionTappableVkui, Object.assign({}, restProps), children);
};
//# sourceMappingURL=ActionTappable.js.map