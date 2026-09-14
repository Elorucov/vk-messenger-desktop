import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUICheckbox":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Checkbox as VKUICheckbox } from '@vkontakte/vkui';
import styles from './Checkbox.module.css';
export const Checkbox = ({ 
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-bool-props-defaults
stretched = true, className, ...restProps }) => {
    return (_jsx(VKUICheckbox, { className: classNames(!stretched && styles.rootNoStretched, className), ...restProps }));
};
//# sourceMappingURL=Checkbox.js.map