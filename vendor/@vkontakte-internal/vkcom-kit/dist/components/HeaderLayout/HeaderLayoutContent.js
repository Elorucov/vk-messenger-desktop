import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './HeaderLayoutContent.module.css';
const alignMap = {
    center: undefined,
    top: styles.rootAlignTop,
    bottom: styles.rootAlignBottom,
};
export const HeaderLayoutContent = ({ children, className, align = 'center', ...restProps }) => {
    return (_jsxs("div", { ...restProps, className: classNames(styles.root, alignMap[align], className), children: [_jsx("div", { className: styles.top }), children, _jsx("div", { className: styles.bottom })] }));
};
//# sourceMappingURL=HeaderLayoutContent.js.map