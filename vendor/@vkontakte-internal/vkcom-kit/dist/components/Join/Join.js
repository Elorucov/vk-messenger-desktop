import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Children, Fragment, isValidElement, } from 'react';
export const Join = ({ separator, children }) => {
    return (_jsx(_Fragment, { children: Children.toArray(isValidElement(children) && children.type === Fragment ? children.props.children : children)
            .filter(Boolean)
            .flatMap((child, index) => [index > 0 && _jsx(Fragment, { children: separator }, `s${index}`), child]) }));
};
//# sourceMappingURL=Join.js.map