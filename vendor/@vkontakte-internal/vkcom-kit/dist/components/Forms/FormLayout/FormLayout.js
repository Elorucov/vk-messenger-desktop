import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useMemo } from 'react';
import { FormLayoutContextProvider } from './FormLayoutContext';
import styles from './FormLayout.module.css';
const preventDefault = (e) => e.preventDefault();
export function FormLayout({ mode, topWidth, topAlign, className, Component = 'form', onSubmit = preventDefault, getRootRef, children, ...restProps }) {
    const context = useMemo(() => {
        return { mode, topWidth, topAlign };
    }, [mode, topWidth, topAlign]);
    return (_jsx(FormLayoutContextProvider, { value: context, children: _jsxs(Component, { className: classNames(styles.root, className), onSubmit: onSubmit, ref: getRootRef, ...restProps, children: [children, Component === 'form' && (
                // eslint-disable-next-line jsx-a11y/control-has-associated-label
                _jsx("input", { type: "submit", className: styles.submit, value: "" }))] }) }));
}
//# sourceMappingURL=FormLayout.js.map