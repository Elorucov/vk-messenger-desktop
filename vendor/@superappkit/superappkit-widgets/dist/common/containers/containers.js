import * as React from 'react';
import { cx, mapToDataAttributes } from '../helpers';
import { ActionTappable } from '../Action/ActionTappable';
import { stringifyJSON } from '../../isomorphic';
// TODO: WidgetContent возможно не нужен
// @elephizeTarget
export const WidgetContent = ({ children, direction, className }) => {
    direction = direction || 'row';
    return (React.createElement("div", { className: cx(['SAKWidget__content', `SAKWidget__content--${direction}`, className]) }, children));
};
// @elephizeTarget
export const WidgetContainer = ({ children, action, className, translucent, meta }) => {
    const classNames = ['SAKWidget__container', className];
    if (translucent) {
        classNames.push('SAKWidget__container--translucent');
    }
    const metaProps = window._elephizeIsServer ?
        mapToDataAttributes({ meta: stringifyJSON(meta) }) :
        {};
    /* TODO: decide what to do with action here */
    return React.createElement("div", Object.assign({ className: cx(classNames) }, metaProps), children);
    return React.createElement("div", { className: cx(classNames) },
        React.createElement(ActionTappable, { action: action, className: "SAKWidget__containerTappable" }, children));
};
// @elephizeTarget
export const WidgetSpace = () => {
    return React.createElement("div", { className: "SAKWidget__space" });
};
//# sourceMappingURL=containers.js.map