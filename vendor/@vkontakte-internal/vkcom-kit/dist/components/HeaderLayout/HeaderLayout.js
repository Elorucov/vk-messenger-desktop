import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { HeaderLayoutContent } from './HeaderLayoutContent';
import styles from './HeaderLayout.module.css';
const HeaderLayoutComponent = ({ children, aside, className, ...restProps }) => {
    return (_jsxs("div", { "data-testid": "headerlayout", ...restProps, className: classNames(styles.container, className, 'vkuiInternalHeaderLayout'), children: [_jsx("div", { className: classNames(styles.main, 'vkuiInternalTabsWithCustomSpacing'), children: _jsx("div", { "data-testid": "headerlayout-in", className: styles.mainIn, children: children }) }), !!aside && (_jsx("div", { "data-testid": "headerlayout-aside", className: styles.aside, children: aside }))] }));
};
export const HeaderLayout = Object.assign(HeaderLayoutComponent, { Content: HeaderLayoutContent });
//# sourceMappingURL=HeaderLayout.js.map