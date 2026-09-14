import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}],"Subhead":["@vkontakte/vkui",{"dangerouslySetInnerHTML":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Spacing, Subhead } from '@vkontakte/vkui';
import styles from './Overlay.module.css';
export function Overlay({ icon, description, className }) {
    return (_jsxs("div", { className: classNames(styles.overlay, className), children: [icon, description && (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: 2 }), _jsx(Subhead, { dangerouslySetInnerHTML: { __html: description }, useAccentWeight: true })] }))] }));
}
//# sourceMappingURL=Overlay.js.map