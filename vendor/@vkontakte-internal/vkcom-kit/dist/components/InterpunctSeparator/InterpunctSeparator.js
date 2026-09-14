import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './InterpunctSeparator.module.css';
export const InterpunctSeparator = ({ className, style, spacing = 6, }) => {
    return (_jsx("span", { "aria-hidden": true, className: classNames(styles.container, className), style: {
            ...style,
            marginLeft: spacing,
            marginRight: spacing,
        }, children: "\u00B7" }));
};
//# sourceMappingURL=InterpunctSeparator.js.map