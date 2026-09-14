import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Tappable } from '../Adopted';
import styles from './Bullets.module.css';
/** Компонент отображающий точки навигации. */
export const Bullets = ({ amount, current, onChange, className, bulletClassName, formatAriaLabel, ...restProps }) => {
    if (!amount) {
        return null;
    }
    return (_jsx("div", { className: classNames(styles.container, className), ...restProps, children: Array.from({ length: amount }, (_, index) => (_jsx(Tappable, { hasActive: false, hoverMode: styles.bulletHover, className: classNames(styles.bullet, bulletClassName, index === current && styles.bulletSelected), onClick: () => onChange(index), onFocus: () => onChange(index), "data-testid": `bullet-${index}`, "aria-label": formatAriaLabel(index + 1) }, index))) }));
};
//# sourceMappingURL=Bullets.js.map