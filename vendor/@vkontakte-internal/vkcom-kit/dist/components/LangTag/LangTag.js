import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from 'react';
import { InnerHTML } from '../InnerHTML/InnerHTML';
export const LangTag = ({ tag, children, Component = 'span', enableInnerHTML, ...restProps }) => {
    const [start, rest] = children.split(`{${tag}}`, 2);
    if (!rest) {
        return children;
    }
    const [content, end] = rest.split(`{/${tag}}`, 2);
    if (end === undefined) {
        return children;
    }
    const Wrapper = enableInnerHTML ? InnerHTML : Fragment;
    return (_jsxs(_Fragment, { children: [_jsx(Wrapper, { children: start }), _jsx(Component, { ...restProps, children: _jsx(Wrapper, { children: content }) }), _jsx(Wrapper, { children: end })] }));
};
//# sourceMappingURL=LangTag.js.map