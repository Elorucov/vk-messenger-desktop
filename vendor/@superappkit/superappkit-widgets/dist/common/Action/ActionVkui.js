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
import { Tappable } from '@vkontakte/vkui';
const { useContext } = React;
// TODO: decide if meta is needed in this method
const defaultFormatLink = (action) => {
    return {
        // target: '_blank',
        href: action.url,
        // rel: 'nofollow noopener',
    };
};
const defaultAction = (action, meta) => {
    void action;
    void meta;
};
function mapProps(action, onFormatLink) {
    if (action.type !== 'open_url') {
        return [false, {}];
    }
    return [true, onFormatLink(action)];
}
export const ActionContext = React.createContext({
    meta: {
        groups: [],
        profiles: [],
        games: [],
        mini_apps: [],
    },
});
export function ActionVkui({ action, children }) {
    if (!action) {
        action = { type: '' };
    }
    const { onAction, onFormatLink, meta } = useContext(ActionContext);
    let onClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (action) {
            (onAction || defaultAction)(action, meta);
        }
    };
    let [hasLink, linkProps] = mapProps(action, onFormatLink || defaultFormatLink);
    if (typeof children === 'function') {
        return children({
            onClick: onClick,
            linkProps: linkProps,
            hasLink: hasLink,
        });
    }
    return React.createElement(React.Fragment, null, children);
}
export function ActionTappableVkui(_a) {
    var { action, children, className } = _a, restProps = __rest(_a, ["action", "children", "className"]);
    const classNames = ['SAKWidget__tappable'];
    if (className) {
        classNames.push(className);
    }
    // @ts-ignore
    return React.createElement(ActionVkui, { action: action }, ({ onClick, hasLink, linkProps }) => {
        return React.createElement(Tappable, Object.assign({ hasHover: !!action, hasActive: !!action, className: classNames.join(' ') }, linkProps, { onClick: onClick, Component: hasLink ? 'a' : 'div' }, restProps), children);
    });
}
export function ActionButtonVkui(_a) {
    var { action, children, className } = _a, restProps = __rest(_a, ["action", "children", "className"]);
    const classNames = ['SAKWidget__tappable'];
    if (className) {
        classNames.push(className);
    }
    // @ts-ignore
    return React.createElement(ActionVkui, { action: action }, ({ onClick, hasLink, linkProps }) => {
        return React.createElement(Tappable, Object.assign({ className: classNames.join(' ') }, linkProps, { onClick: onClick, Component: hasLink ? 'a' : 'button', type: !hasLink ? 'button' : undefined }, restProps), children);
    });
}
//# sourceMappingURL=ActionVkui.js.map