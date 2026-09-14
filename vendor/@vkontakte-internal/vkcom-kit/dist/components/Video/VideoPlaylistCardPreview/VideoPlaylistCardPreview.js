import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon24Play":["@vkontakte/icons",{"className":1}]} */
import { Icon24DotsVertical, Icon24Play } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { Icon16NewComposite, RasterIcon48CheckCircleShadowLarge, RasterIcon48CircleOutlineShadowLarge, } from '@vkontakte-internal/icons-private';
import { getColorClass } from '../../../utils/getColorClass/getColorClass';
import { AspectRatio, IconButton, Paragraph } from '../../Adopted';
import { Overlay } from '../../Overlay/Overlay';
import { getIconType } from '../VideoCard/utils/getIconType';
import { VideoCardOverlay } from '../VideoCardOverlay/VideoCardOverlay';
import { VideoCardIcon } from '../VideoCardPreview/VideoCardIcon/VideoCardIcon';
import { VideoCardPreviewImage } from '../VideoCardPreviewImage/VideoCardPreviewImage';
import { VideoCardThumb } from '../VideoCardThumb/VideoCardThumb';
import { VideoPlaylistCardCounter } from '../VideoPlaylistCardCounter/VideoPlaylistCardCounter';
import { HideOutlineIcon } from './HideOutlineIcon';
import styles from './VideoPlaylistCardPreview.module.css';
export const VideoPlaylistCardPreview = ({ thumbSrc, title, count, onClick, direction = 'vertical', overlay, isBlurred, isPrivacyLocked, withBadge, hoverText, hoverIcon: HoverIcon, className, href, onSelect, isSelected, selectMode, }) => {
    const isPlaylistSelectable = selectMode && direction === 'vertical';
    return (_jsxs("div", { className: styles.previewWrapper, children: [isPlaylistSelectable && (_jsx("div", { className: styles.selectIconButton, children: _jsx(IconButton, { size: 40, onClick: onSelect, children: isSelected ? _jsx(RasterIcon48CheckCircleShadowLarge, {}) : _jsx(RasterIcon48CircleOutlineShadowLarge, {}) }) })), _jsx(Overlay, { Component: AspectRatio, className: classNames(styles.preview, className, direction === 'horizontal' && styles.previewHorizontal), mode: "after", ratio: 16 / 9, children: _jsxs(VideoCardThumb, { onClick: onClick, href: href, children: [_jsx(VideoCardPreviewImage, { src: thumbSrc, alt: title, blurred: isBlurred, children: _jsx(VideoPlaylistCardCounter, { count: count, direction: direction }) }), !overlay && isBlurred && (_jsx("div", { className: classNames(styles.blurredIcon, direction === 'vertical' && styles.blurredIconHidden), children: _jsx(HideOutlineIcon, { direction: direction }) })), _jsx(VideoCardIcon, { type: getIconType({ isPrivacyLocked }), className: styles.privacyIcon }), !overlay && onClick && hoverText && direction === 'vertical' && (_jsxs(Overlay, { className: styles.hoverOverlay, children: [_jsx(Overlay, { Component: Icon24DotsVertical, placement: "top-right", offset: 8 }), HoverIcon ? (_jsx(HoverIcon, { className: styles.hoverOverlayIcon })) : (_jsx(Icon24Play, { className: styles.hoverOverlayIcon })), _jsx(Paragraph, { weight: "2", children: hoverText })] })), overlay && _jsx(VideoCardOverlay, { ...overlay })] }) }), withBadge && (_jsx(Overlay, { placement: "top-right", offset: [-5, -6], children: _jsx(Icon16NewComposite, { className: getColorClass('color_icon_contrast_themed') }) }))] }));
};
//# sourceMappingURL=VideoPlaylistCardPreview.js.map