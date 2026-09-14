import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { getColorClass } from '../../../utils/getColorClass/getColorClass';
import styles from './FormItemLabel.module.css';
const modeModifiersMap = {
    primary: getColorClass('color_text_primary'),
    secondary: undefined,
};
export function FormItemLabel({ mode = 'secondary', aside, required, children, }) {
    return (_jsxs("div", { className: styles.root, children: [_jsx("div", { className: classNames(styles.main, modeModifiersMap[mode], required && styles.mainRequired), children: children }), !!aside && _jsx("div", { className: styles.aside, children: aside })] }));
}
//# sourceMappingURL=FormItemLabel.js.map