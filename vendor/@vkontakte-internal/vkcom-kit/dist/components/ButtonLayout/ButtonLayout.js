import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Div":["Adopted",{"className":1}],"Footnote":["Adopted",{"className":2}]} */
import { classNames } from '@vkontakte/vkjs';
import { ButtonGroup, Div, Footnote } from '../Adopted';
import styles from './ButtonLayout.module.css';
export const ButtonLayout = ({ className, children, before, mode, stretched, after, ...restProps }) => {
    return (_jsxs(Div, { ...restProps, className: classNames(styles.root, className), children: [Boolean(before) && _jsx(Footnote, { className: styles.before, children: before }), _jsx(ButtonGroup, { gap: "s", align: "center", mode: mode, stretched: stretched, children: children }), Boolean(after) && _jsx(Footnote, { className: styles.after, children: after })] }));
};
//# sourceMappingURL=ButtonLayout.js.map