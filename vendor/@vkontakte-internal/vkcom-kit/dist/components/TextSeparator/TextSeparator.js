import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Separator, Text } from '../Adopted';
import { TextClamp } from '../TextClamp/TextClamp';
import styles from './TextSeparator.module.css';
export const TextSeparator = ({ children, ...restProps }) => {
    if (!children) {
        return _jsx(Separator, { ...restProps });
    }
    return (_jsxs("div", { className: styles.container, ...restProps, children: [_jsx(Separator, { className: styles.separator }), _jsx(TextClamp, { Component: Text, className: styles.text, lines: 1, children: children }), _jsx(Separator, { className: styles.separator })] }));
};
//# sourceMappingURL=TextSeparator.js.map