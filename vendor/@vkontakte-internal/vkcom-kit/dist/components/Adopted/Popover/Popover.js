import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"PopoverNative":["@vkontakte/vkui",{"style":1,"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Popover as PopoverNative } from '@vkontakte/vkui';
import styles from './Popover.module.css';
export const Popover = ({ width, maxWidth, noTopRounded, style, className, ...restProps }) => {
    return (_jsx(PopoverNative, { className: classNames(noTopRounded && styles.rootNoTopRounded, className), style: { minWidth: width ?? style?.width, maxWidth: maxWidth ?? style?.maxWidth, ...style }, ...restProps }));
};
//# sourceMappingURL=Popover.js.map