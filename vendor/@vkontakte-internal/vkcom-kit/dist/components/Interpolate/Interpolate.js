import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { cloneElement, createElement, Fragment, isValidElement } from 'react';
import { Link } from '../Adopted';
export const DEFAULT_ALLOWED_HTML = {
    a: ['href', 'target', 'rel'],
    br: true,
    b: true,
    i: true,
    span: true,
};
const COMPONENTS_BY_TAG = {
    a: Link,
};
const getPropsFromAttributesString = (attributesString, allowedProps) => {
    if (!attributesString || !Array.isArray(allowedProps) || !allowedProps.length) {
        return {};
    }
    const joinedAllowedProps = allowedProps.join('|');
    const stringProp = `(?<propname>${joinedAllowedProps})=(?<quote>["'])(?<propvalue>.*?)(?<!\\\\)\\k<quote>`;
    const booleanProp = `(?<propnamebool>${joinedAllowedProps})`;
    return Array.from(attributesString.matchAll(new RegExp(`${stringProp}|${booleanProp}`, 'g'))).reduce((res, match) => {
        const propName = match.groups?.propname || match.groups?.propnamebool;
        const propValue = match.groups?.propvalue || true;
        if (propName) {
            res[propName] = propValue;
        }
        return res;
    }, {});
};
const getRegExp = (keys) => {
    const joinedKeys = keys.join('|');
    const htmlWithChildren = `<(?<keyhtml>${joinedKeys})(?<propshtml> .*?)?>(?<childrenhtml>.*?)<\/\\k<keyhtml>>`;
    const i18nWithChildren = `\{(?<keyi18n>${joinedKeys})}(?<childreni18n>.*?)\{\/\\k<keyi18n>}`;
    const htmlSelfClosing = `<(?<keyhtmlself>${joinedKeys})(?<propshtmlself> .*?)?\/?>`;
    const i18nSelfClosing = `\{(?<keyi18nself>${joinedKeys})}`;
    return new RegExp(`${htmlWithChildren}|${i18nWithChildren}|${htmlSelfClosing}|${i18nSelfClosing}`, 'g');
};
const joinReactNodes = (nodes) => nodes.reduce((res, item) => {
    if (!res && res !== 0) {
        return item;
    }
    if (!item && item !== 0) {
        return res;
    }
    if (typeof res !== 'object' && typeof item !== 'object') {
        return `${res}${item}`;
    }
    if (!Array.isArray(res)) {
        return [res, item];
    }
    if (typeof res[res.length - 1] !== 'object' && typeof item !== 'object') {
        res[res.length - 1] = `${res[res.length - 1]}${item}`;
        return res;
    }
    res.push(item);
    return res;
});
export const interpolateMessage = (message, values = {}, additionalAllowedHTML = {}) => {
    if (!message) {
        return message;
    }
    const allowedHTML = { ...DEFAULT_ALLOWED_HTML, ...additionalAllowedHTML };
    const result = [];
    const keys = Object.keys(values).concat(Object.keys(allowedHTML).filter((key) => allowedHTML[key]));
    if (!keys.length) {
        return message;
    }
    const regExp = getRegExp(keys);
    let lastIndex = 0;
    for (const match of message.matchAll(regExp)) {
        const matchedString = match[0];
        const key = match.groups?.keyhtml ||
            match.groups?.keyi18n ||
            match.groups?.keyhtmlself ||
            match.groups?.keyi18nself ||
            '';
        const attributesString = match.groups?.propshtml || match.groups?.propshtmlself;
        const children = interpolateMessage(match.groups?.childrenhtml || match.groups?.childreni18n, values, allowedHTML);
        const props = getPropsFromAttributesString(attributesString, allowedHTML[key]);
        const index = match.index;
        const value = values[key];
        const element = typeof value === 'function'
            ? value({ key: index, ...props, children })
            : isValidElement(value)
                ? cloneElement(value, { key: index, ...value.props, ...props }, children)
                : !values.hasOwnProperty(key) && allowedHTML.hasOwnProperty(key)
                    ? createElement(COMPONENTS_BY_TAG[key] || key, { key: index, ...props }, children)
                    : value;
        result.push(message.slice(lastIndex, index), Array.isArray(element) ? _jsx(Fragment, { children: element }, index) : element);
        lastIndex = index + matchedString.length;
    }
    if (lastIndex === 0) {
        return message;
    }
    result.push(message.slice(lastIndex));
    return joinReactNodes(result);
};
export const Interpolate = ({ children, values, allowedHTML }) => (_jsx(_Fragment, { children: interpolateMessage(children, values, allowedHTML) }));
//# sourceMappingURL=Interpolate.js.map