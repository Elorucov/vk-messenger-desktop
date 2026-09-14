import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Tappable } from '../../Adopted';
import { useRightMenuContext } from '../RightMenuContext';
import { RightMenuItemSpinner } from '../RightMenuItemSpinner/RightMenuItemSpinner';
import styles from './RightMenuItem.module.css';
export const RightMenuItem = ({ children, mode, before, after, badgeAfterTitle, disabled, isLoading: isItemLoading, selected, className, hideAfterByDefault, ...restProps }) => {
    const isMenuLoading = useRightMenuContext();
    const isLoading = isItemLoading || (selected && isMenuLoading);
    return (_jsxs(Tappable, { "data-testid": `rightmenuitem${selected ? '-selected' : ''}`, ...restProps, disabled: disabled || isLoading, className: classNames(styles.container, mode === 'secondary' && styles.containerSecondary, className), hoverMode: styles.containerHover, activeMode: styles.containerActive, activated: selected, children: [!!before && (_jsx("div", { "data-testid": "rightmenuitem-before", className: styles.before, children: before })), _jsx("div", { "data-testid": "rightmenuitem-in", className: styles.content, children: children }), !!badgeAfterTitle && (_jsx("div", { "data-testid": "rightmenuitem-aftertitle", className: styles.afterTitle, children: badgeAfterTitle })), !!after && (_jsx("div", { "data-testid": "rightmenuitem-after", className: classNames(styles.after, isLoading && styles.afterInactive, hideAfterByDefault && styles.afterHidden), children: after })), isLoading && (_jsx("div", { className: styles.spinner, "data-testid": "right-menu-item-spinner", children: _jsx(RightMenuItemSpinner, {}) }))] }));
};
//# sourceMappingURL=RightMenuItem.js.map