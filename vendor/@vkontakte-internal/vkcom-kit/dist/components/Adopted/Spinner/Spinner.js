import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUISpinner":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Spinner as VKUISpinner } from '@vkontakte/vkui';
import styles from './Spinner.module.css';
const SizeMap = {
    s: 's',
    m: 'm',
    l: 'l',
    xl: 'xl',
    small: 's',
    regular: 'm',
    medium: 'l',
    large: 'xl',
};
export const Spinner = ({ 
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-bool-props-defaults
stretched = true, size = 'm', className, ...restProps }) => {
    return (_jsx(VKUISpinner, { size: SizeMap[size], className: classNames(className, !stretched && styles.rootNoStretched), ...restProps }));
};
//# sourceMappingURL=Spinner.js.map