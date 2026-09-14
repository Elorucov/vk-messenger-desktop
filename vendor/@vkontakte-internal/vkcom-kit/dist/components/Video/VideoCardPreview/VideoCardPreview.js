import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Flex":["Adopted",{"className":1}]} */
import { Icon12ClockOutline, Icon24Mute, Icon28Play, Icon32Play, Icon36Play } from '@vkontakte/icons';
import { useMemo, useState } from 'react';
import { getColorClass } from '../../../utils/getColorClass/getColorClass';
import { ContentBadge, Flex, Spinner } from '../../Adopted';
import { useActive } from '../VideoCard/hooks/useActive';
import { getIconType } from '../VideoCard/utils/getIconType';
import { VideoCardOverlayIcon, } from '../VideoCardOverlayIcon/VideoCardOverlayIcon';
import { VideoCardPreviewImage } from '../VideoCardPreviewImage/VideoCardPreviewImage';
import { VideoCardBadge } from './VideoCardBadge/VideoCardBadge';
import { VideoCardIcon } from './VideoCardIcon/VideoCardIcon';
import { VideoCardPreviewContainer } from './VideoCardPreviewContainer/VideoCardPreviewContainer';
import { VideoCardTrailerPlayer } from './VideoCardTrailerPlayer/VideoCardTrailerPlayer';
import { VideoCardViewedDuration } from './VideoCardViewedDuration/VideoCardViewedDuration';
import { getExtendedBadgeText } from './utils/getExtendedBadgeText';
import styles from './VideoCardPreview.module.css';
const iconPlayMap = {
    s: () => _jsx(Icon28Play, {}),
    m: () => _jsx(Icon32Play, {}),
    l: () => _jsx(Icon36Play, {}),
};
export const VideoCardPreview = ({ isPrivacyLocked, privacyLockReason, title, badgeMarks, trailerSrc, thumbSrc, duration, viewedDuration, active, isLive, isUpcoming, badgeText, blurred, hasOverlay, isProcessing, muted, loading, direction, size, blurSize = 's', playIconSize = 'l', playOverlaySize = 's', durationBadgeSize = 's', playOverlayHovered, playOverlayHoverMode, publishDate, forceShowPlay, isInteractive, noPlayIcon, noExtendedBadge, focusDisabled, hasVideoPlayerFullPreview, videoCardPreviewLabel, playIconOnHover, contentType, }) => {
    const { activate, deactivate, isActive } = useActive(false);
    const [isPlayerLoadedData, setIsPlayerLoadedData] = useState(false);
    const isHorizontalMini = direction === 'horizontal' && size === 's';
    const hasTrailer = Boolean(trailerSrc && !isHorizontalMini && !blurred);
    const hideBadgeMarks = active && (forceShowPlay || hasTrailer);
    const iconType = getIconType({ isProcessing, isPrivacyLocked });
    const hasPublishDate = publishDate && !isHorizontalMini && !blurred;
    const badgeType = isLive && !isUpcoming ? 'live' : isUpcoming ? 'upcoming' : undefined;
    const extendedBadgeText = useMemo(() => getExtendedBadgeText({
        size,
        isInteractive,
        isUpcoming,
        badgeText,
        duration,
        noExtendedBadge,
    }), [size, isInteractive, isUpcoming, badgeText, duration, noExtendedBadge]);
    const IconPlay = iconPlayMap[playIconSize];
    const handlePlayerLoadedData = () => {
        setIsPlayerLoadedData(true);
    };
    const renderPreviewImageContent = () => {
        if (loading) {
            return (_jsx(VideoCardOverlayIcon, { type: "loading", children: _jsx(Spinner, { size: "regular", className: getColorClass('color_icon_contrast') }) }));
        }
        if (muted && !blurred && !active) {
            return (_jsx(VideoCardOverlayIcon, { type: "muted", children: _jsx(Icon24Mute, {}) }));
        }
        if (playIconOnHover) {
            return (_jsx(VideoCardOverlayIcon, { size: playOverlaySize, hovered: playOverlayHovered, hoverMode: playOverlayHoverMode, playIconOnHover: playIconOnHover, children: _jsx(IconPlay, {}) }));
        }
        if (!noPlayIcon &&
            !hasVideoPlayerFullPreview &&
            !isHorizontalMini &&
            !blurred &&
            !hasOverlay &&
            (forceShowPlay || !hasTrailer)) {
            return (_jsx(VideoCardOverlayIcon, { size: playOverlaySize, hovered: playOverlayHovered, hoverMode: playOverlayHoverMode, children: _jsx(IconPlay, {}) }));
        }
        return null;
    };
    return (_jsxs(VideoCardPreviewContainer, { activate: activate, deactivate: deactivate, focusDisabled: focusDisabled, hasOverlay: hasOverlay, videoCardPreviewLabel: videoCardPreviewLabel, children: [_jsx(VideoCardPreviewImage, { hasImageHidden: isActive && isPlayerLoadedData, src: thumbSrc, alt: title, blurred: blurred, blurSize: blurSize, children: renderPreviewImageContent() }), !hasVideoPlayerFullPreview && trailerSrc && hasTrailer && (_jsx(VideoCardTrailerPlayer, { active: active, src: trailerSrc, alt: title, onLoadedData: active ? handlePlayerLoadedData : undefined })), badgeMarks && !hideBadgeMarks && (_jsx(Flex, { gap: 4, className: styles.top, children: badgeMarks.map((mark) => (_jsx(ContentBadge, { appearance: "overlay", size: "s", mode: "primary", children: mark.title }, mark.title))) })), _jsxs("div", { className: styles.footer, children: [_jsx(VideoCardIcon, { type: iconType, tooltipText: privacyLockReason, className: styles.privacyIcon }), hasPublishDate && (_jsxs(ContentBadge, { appearance: "overlay", children: [_jsx(ContentBadge.IconSlot, { children: _jsx(Icon12ClockOutline, {}) }), publishDate] }))] }), _jsx(VideoCardViewedDuration, { shown: !hasTrailer || !active, duration: duration, viewedDuration: viewedDuration }), _jsx(VideoCardBadge, { type: badgeType, text: extendedBadgeText, interactive: isInteractive, contentType: contentType, durationBadgeSize: durationBadgeSize })] }));
};
//# sourceMappingURL=VideoCardPreview.js.map