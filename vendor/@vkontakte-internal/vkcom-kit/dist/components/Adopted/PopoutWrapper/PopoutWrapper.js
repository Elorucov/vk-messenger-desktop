import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIPopoutWrapper":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { PopoutWrapper as VKUIPopoutWrapper, } from '@vkontakte/vkui';
import styles from './PopoutWrapper.module.css';
export const PopoutWrapper = ({ noBackground, className, ...restProps }) => {
    return (_jsx(VKUIPopoutWrapper, { className: classNames(!noBackground && styles.masked, className), noBackground: noBackground, ...restProps }));
};
//# sourceMappingURL=PopoutWrapper.js.map