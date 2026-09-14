import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon24MoreHorizontal":["@vkontakte/icons",{"className":2}]} */
import { Icon24MoreHorizontal } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { Fragment } from 'react';
import { IconButton, OnboardingTooltipContainer, Tooltip } from '../../Adopted';
import { DropdownActionSheet } from '../../DropdownActionSheet/DropdownActionSheet';
import styles from './VideoCardMenu.module.css';
export const VideoCardMenu = ({ getRootRef, visible, onMenuClick, items = [], className, placement = 'bottom-end', onMenuPopoverShownChange, onMenuPopoverShownChanged, restoreMenuPopoverFocus, menuButtonLabel, }) => {
    if (onMenuClick) {
        return (_jsx(IconButton, { getRootRef: getRootRef, onClick: onMenuClick, noPadding: true, "data-testid": "video_card_more", hasHover: false, hasActive: false, label: menuButtonLabel, children: _jsx(Icon24MoreHorizontal, { className: classNames(styles.icon, className, visible && styles.iconVisible) }) }));
    }
    const content = items.map(({ separatedBefore, tooltip, ...menuItemProps }, index) => {
        return (_jsxs(Fragment, { children: [separatedBefore && _jsx(DropdownActionSheet.Separator, {}), tooltip ? (_jsx(Tooltip, { description: tooltip, placement: "top", appearance: "inversion", children: _jsx(DropdownActionSheet.Item, { ...menuItemProps }) })) : (_jsx(DropdownActionSheet.Item, { ...menuItemProps }))] }, index));
    });
    const handleIconClick = (event) => {
        event.stopPropagation();
        event.preventDefault();
    };
    if (!content.length) {
        return null;
    }
    return (_jsx(DropdownActionSheet, { trigger: "hover", placement: placement, onShownChange: onMenuPopoverShownChange, onShownChanged: onMenuPopoverShownChanged, restoreFocus: restoreMenuPopoverFocus ?? false, content: _jsx(OnboardingTooltipContainer, { children: content }), children: _jsx(Icon24MoreHorizontal, { onClick: handleIconClick, "data-testid": "video_card_more", className: classNames(styles.icon, className, visible && styles.iconVisible) }) }));
};
//# sourceMappingURL=VideoCardMenu.js.map