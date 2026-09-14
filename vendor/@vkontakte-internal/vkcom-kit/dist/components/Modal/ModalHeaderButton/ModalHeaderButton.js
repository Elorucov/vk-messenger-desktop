import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Tappable } from '../../Adopted';
import styles from './ModalHeaderButton.module.css';
export const ModalHeaderButton = ({ children, className, ...restProps }) => {
    return (_jsx(Tappable, { ...restProps, className: classNames(styles.button, className), activeMode: "opacity", hoverMode: "opacity", children: children }));
};
//# sourceMappingURL=ModalHeaderButton.js.map