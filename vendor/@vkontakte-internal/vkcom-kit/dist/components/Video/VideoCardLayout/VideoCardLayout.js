import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"ContainerComponent":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { useCallback } from 'react';
import { AspectRatio, Tappable } from '../../Adopted';
import { Overlay } from '../../Overlay/Overlay';
import styles from './VideoCardLayout.module.css';
const MAX_RATIO = 16 / 9;
const MIN_RATIO = 3 / 4;
const viewDirectionModifiersMap = {
    vertical: undefined,
    horizontal: styles.cardHorizontal,
};
const sizeModifiersMap = {
    m: undefined,
    s: styles.cardMini,
    xs: undefined,
};
const DEFAULT_WIDTH = 260;
export const VideoCardLayout = ({ video, overlay, direction = 'vertical', size = 'm', stretched, noRounded, onVideoOpen, videoContainerWidth, getRef, preview, info, onVideoCardActivate, onVideoCardDeactivate, onMouseOver, onMouseOut, isVideoCardActive, hasVideoPlayerFullPreview, isHighlighted, hasEpisodes, focusOutlined, testId, }) => {
    const withOverlay = Boolean(overlay);
    const isHorizontalMini = direction === 'horizontal' && size === 's';
    const isVerticalFullWidth = direction !== 'horizontal' && stretched;
    const ContainerComponent = isHorizontalMini ? Tappable : 'div';
    const tappableProps = isHorizontalMini
        ? {
            hoverMode: styles.cardHorizontalMiniHover,
            activeMode: styles.cardHorizontalMiniActive,
            hasHover: !isHighlighted,
        }
        : {};
    const videoContainerStyle = {
        width: direction === 'horizontal' && !videoContainerWidth ? DEFAULT_WIDTH : videoContainerWidth,
    };
    const ratio = isVerticalFullWidth && video?.width && video.height
        ? Math.max(MIN_RATIO, Math.min(video.width / video.height, MAX_RATIO))
        : MAX_RATIO;
    const handleMouseOver = useCallback((e) => {
        onMouseOver?.(e);
        onVideoCardActivate?.();
    }, [onMouseOver, onVideoCardActivate]);
    const handleMouseOut = useCallback((e) => {
        onMouseOut?.(e);
        onVideoCardDeactivate?.();
    }, [onMouseOut, onVideoCardDeactivate]);
    return (
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    _jsxs(ContainerComponent, { className: classNames(styles.card, viewDirectionModifiersMap[direction], sizeModifiersMap[size], noRounded && styles.cardNoRounded, isHorizontalMini && isHighlighted && styles.cardHorizontalMiniHover, focusOutlined && styles.focusOutlined), role: "presentation", onMouseOver: handleMouseOver, onFocus: onVideoCardActivate, onMouseLeave: handleMouseOut, onBlur: onVideoCardDeactivate, onClick: withOverlay || !isHorizontalMini ? undefined : onVideoOpen, "data-testid": testId, ...tappableProps, children: [_jsx(Overlay, { Component: AspectRatio, className: classNames(styles.videoContainer, (isVerticalFullWidth || (isVideoCardActive && hasVideoPlayerFullPreview)) &&
                    styles.videoContainerFullWidth, !info && styles.videoContainerWithoutInfo, hasEpisodes && direction === 'horizontal' && styles.videoContainerWithEpisodes, isVideoCardActive && hasVideoPlayerFullPreview && styles.videoContainerOverflow), style: videoContainerStyle, getRootRef: getRef, mode: "after", ratio: ratio, children: preview }), info] }));
};
//# sourceMappingURL=VideoCardLayout.js.map