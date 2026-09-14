import '../../ui/ActionsMenu/ActionsMenu.css';
import React, { useMemo, useState, forwardRef, } from 'react';
import cx from 'classnames';
import { Icon16Chevron, Icon24ChevronDown, Icon24ChevronUp, } from '@vkontakte/icons';
import { useFocusState } from 'react-focus-lock';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { useCombinedRefs, useBrowserEnv } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { VisuallyHidden } from '@vkontakte-internal/vkcom-kit';
const HOVER_SUBMENU_OPEN_DELAY = 300;
export const ActionsMenu = ({ className, children, closeButton = true, ...attributes }) => {
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    return (React.createElement("ul", { role: "menu", "aria-orientation": "vertical", ...attributes, className: cx('ActionsMenu', { 'ActionsMenu--mobile': isMobileLayout }, className) },
        children,
        closeButton && (React.createElement(VisuallyHidden, null,
            React.createElement("button", { type: "button", "aria-label": lang.use('me_close'), role: "menuitem" }, lang.use('me_close'))))));
};
export const ActionsMenuAction = forwardRef(function ActionsMenuAction({ disabled, leftIcon, rightIcon, title, subtitle, type = 'secondary', size = 'regular', isActive = false, isLoading, className, onPointerMove, onPointerLeave, onFocus, titleClassName, ...attributes }, ref) {
    const { active: isFocused, ref: focusRef, onFocus: onFocusStateChange, } = useFocusState();
    const $ref = useCombinedRefs(ref, focusRef);
    const handlePointerMove = (event) => {
        if (!disabled &&
            !event.defaultPrevented &&
            event.pointerType === 'mouse' &&
            !isFocused) {
            event.currentTarget.focus?.({ preventScroll: true });
        }
        onPointerMove?.(event);
    };
    const handlePointerLeave = (event) => {
        if (!disabled &&
            !event.defaultPrevented &&
            event.pointerType === 'mouse' &&
            isFocused) {
            event.currentTarget.blur?.();
        }
        onPointerLeave?.(event);
    };
    const handleFocus = (event) => {
        if (!disabled && !event.defaultPrevented) {
            onFocusStateChange(event);
        }
        onFocus?.(event);
    };
    return (React.createElement("button", { role: "menuitem", ...attributes, ref: $ref, disabled: disabled, className: cx('ActionsMenuAction', type && `ActionsMenuAction--${type}`, isLoading && 'ActionsMenuAction--loading', isFocused && `ActionsMenuAction--focused`, isActive && `ActionsMenuAction--active`, `ActionsMenuAction--size-${size}`, className), onPointerMove: handlePointerMove, onPointerLeave: handlePointerLeave, onFocus: handleFocus },
        leftIcon && React.createElement("i", { className: "ActionsMenuAction__icon" }, leftIcon),
        React.createElement("span", { className: cx('ActionsMenuAction__title', titleClassName) },
            title,
            subtitle && (React.createElement("span", { className: "ActionsMenuAction__subtitle" }, subtitle))),
        rightIcon && React.createElement("i", { className: "ActionsMenuAction__icon" }, rightIcon)));
});
export const ActionsMenuDropdownAction = ({ children, icon, openType, hideOnClick = true, position, align, actionsMenuClassName, enableFocusTrap, ...actionProps }) => {
    const [isOpened, setIsOpened] = useState(false);
    const { isMobileLayout } = useLayoutData();
    const placement = useMemo(() => {
        const dropdownPlacement = isMobileLayout
            ? { position: 'top', align: 'right' }
            : { position: 'right', align: 'left' };
        if (position) {
            dropdownPlacement.position = position;
        }
        if (align) {
            dropdownPlacement.align = align;
        }
        return dropdownPlacement;
    }, [position, align, isMobileLayout]);
    const getActionIcon = () => {
        if (!isMobileLayout) {
            return React.createElement(Icon16Chevron, null);
        }
        if (isOpened) {
            return React.createElement(Icon24ChevronUp, null);
        }
        return React.createElement(Icon24ChevronDown, null);
    };
    return (React.createElement(Dropdown, { enableFocusTrap: enableFocusTrap, content: React.createElement(ActionsMenu, { id: actionProps['aria-controls'], className: cx(actionsMenuClassName, 'ActionsMenu--dropdown') }, children), ...(openType === 'click'
            ? { openType: 'click' }
            : {
                openType: 'hover',
                hideDelay: 0,
                delay: HOVER_SUBMENU_OPEN_DELAY,
            }), ...placement, classNames: {
            trigger: 'ActionsMenu--dropdown-trigger',
        }, open: isOpened, onOpen: () => setIsOpened(true), onClose: () => setIsOpened(false), hideOnClick: hideOnClick, canOpen: !actionProps.disabled },
        React.createElement(ActionsMenuAction, { "aria-haspopup": "menu", ...actionProps, "aria-expanded": isOpened, isActive: isOpened, leftIcon: icon, rightIcon: getActionIcon() })));
};
export const ActionsMenuSeparator = ({ className }) => {
    return (React.createElement("div", { role: "separator", "aria-orientation": "horizontal", className: cx('ActionsMenuAction__separator', className) }));
};
export const ActionsMenuText = ({ text }) => {
    const { isMobileLayout } = useLayoutData();
    return (React.createElement("div", { className: cx('ActionsMenuText', {
            'ActionsMenuText--withBreaks': !isMobileLayout,
        }) }, text));
};
//# sourceMappingURL=ActionsMenu.js.map