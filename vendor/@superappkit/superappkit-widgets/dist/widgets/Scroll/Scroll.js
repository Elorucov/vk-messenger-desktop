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
import { ScrollView } from './ScrollView';
// @elephizeTarget
export const Scroll = (_a) => {
    var props = __rest(_a, []);
    return window._elephizeIsServer ?
        React.createElement(ScrollView, Object.assign({}, props)) :
        React.createElement(ScrollView, Object.assign({}, props));
};
//# sourceMappingURL=Scroll.js.map