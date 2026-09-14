import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Subhead":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Spacing, Subhead } from '../../../Adopted';
import { Join } from '../../../Join/Join';
import styles from './FormItemLabeledContent.module.css';
export const FormItemLabeledContent = ({ before, after, noPadding, children, ...restProps }) => {
    return (_jsx("div", { className: classNames(styles.root, noPadding && styles.rootNoPadding), ...restProps, children: _jsxs(Join, { separator: _jsx(Spacing, { size: 4, mode: "vertical" }), children: [Boolean(before) && _jsx("div", { className: styles.before, children: before }), _jsx(Subhead, { Component: "div", className: styles.in, children: children }), Boolean(after) && _jsx("div", { className: styles.after, children: after })] }) }));
};
//# sourceMappingURL=FormItemLabeledContent.js.map