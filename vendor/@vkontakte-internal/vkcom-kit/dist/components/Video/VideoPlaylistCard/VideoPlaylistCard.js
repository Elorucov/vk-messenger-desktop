import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon24CheckCircleFilledBlue, Icon24CheckCircleOff } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { Flex, Spacing } from '../../Adopted';
import { useActive } from '../VideoCard/hooks/useActive';
import { VideoCardInfo } from '../VideoCardInfo/VideoCardInfo';
import { VideoCardMenu } from '../VideoCardMenu/VideoCardMenu';
import { VideoPlaylistCardPreview, } from '../VideoPlaylistCardPreview/VideoPlaylistCardPreview';
import styles from './VideoPlaylistCard.module.css';
export const VideoPlaylistCard = ({ direction = 'vertical', item, menuItems, onMenuClick, action, overlay, withBadge, noAvatar, ownerVisibilityMode, previewWidth, hoverText, hoverIcon, onTitleClick, onAuthorClick, isSelected, titleHref, avatarWrapperLabel, ...restProps }) => {
    const { href, owner, title, additionalInfo, thumbSrc, count, isPrivacyLocked } = item;
    const { activate, deactivate, isActive } = useActive(false);
    const isHorizontal = direction === 'horizontal';
    const isCustomWidth = previewWidth && !isHorizontal;
    const isMenuVisible = isActive && !overlay;
    const isHorizontalPlaylistSelectable = restProps.selectMode && direction === 'horizontal';
    const menu = menuItems || onMenuClick ? (_jsx(VideoCardMenu, { items: menuItems, onMenuClick: onMenuClick, visible: isMenuVisible })) : undefined;
    return (
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    _jsxs("div", { className: classNames(styles.cardWrapper, isHorizontal && styles.cardWrapperHorizontal), style: { width: isCustomWidth ? previewWidth : undefined }, role: "button", tabIndex: 0, onMouseOver: activate, onFocus: activate, onMouseLeave: deactivate, onBlur: deactivate, children: [_jsx(VideoPlaylistCardPreview, { className: classNames(isHorizontal && styles.cardPreviewHorizontal), isBlurred: item.isThumbBlurred, count: count, title: title, thumbSrc: thumbSrc, href: href, isActive: isActive, overlay: overlay, hoverText: hoverText, hoverIcon: hoverIcon, withBadge: withBadge, isPrivacyLocked: isPrivacyLocked, isSelected: isSelected, direction: direction, ...restProps }), _jsx(VideoCardInfo, { className: classNames(styles.cardInfo, isHorizontal && styles.cardInfoHorizontal), href: titleHref ?? href, direction: direction, owner: owner, additionalInfo: additionalInfo, title: title, action: action || menu, hasOverlay: Boolean(overlay), noAvatar: noAvatar, ownerVisibilityMode: ownerVisibilityMode, onTitleClick: restProps.selectMode === 'card' ? restProps.onSelect : onTitleClick, onAuthorClick: onAuthorClick, avatarWrapperLabel: avatarWrapperLabel }), isHorizontalPlaylistSelectable && (_jsxs(_Fragment, { children: [_jsx(Spacing, { mode: "vertical", size: 8 }), _jsx(Flex, { align: "center", justify: "center", children: isSelected ? _jsx(Icon24CheckCircleFilledBlue, {}) : _jsx(Icon24CheckCircleOff, {}) })] }))] }));
};
//# sourceMappingURL=VideoPlaylistCard.js.map