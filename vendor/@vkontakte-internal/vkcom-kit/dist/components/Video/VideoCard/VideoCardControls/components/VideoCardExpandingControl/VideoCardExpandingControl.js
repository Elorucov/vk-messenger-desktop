import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["Adopted",{"className":1}],"Text":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Tappable, Text } from '../../../../../Adopted';
import styles from './VideoCardExpandingControl.module.css';
export const VideoCardExpandingControl = ({ icon, text, expanded, ...restProps }) => {
    return (_jsx(Tappable, { className: styles.tappable, hasHover: false, ...restProps, children: _jsxs("div", { className: classNames(styles.container, expanded && styles.containerExpanded), children: [icon, text && (_jsx(Text, { weight: "2", className: styles.label, children: text }))] }) }));
};
//# sourceMappingURL=VideoCardExpandingControl.js.map