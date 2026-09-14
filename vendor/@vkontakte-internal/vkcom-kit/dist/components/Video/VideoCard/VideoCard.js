import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { RasterIcon48CheckCircleShadowLarge, RasterIcon48CircleOutlineShadowLarge, } from '@vkontakte-internal/icons-private';
import { IconButton } from '../../Adopted';
import { VideoCardInfo } from '../VideoCardInfo/VideoCardInfo';
import { VideoCardLayout } from '../VideoCardLayout/VideoCardLayout';
import { VideoCardMenu } from '../VideoCardMenu/VideoCardMenu';
import { VideoCardOverlay } from '../VideoCardOverlay/VideoCardOverlay';
import { VideoCardPreview } from '../VideoCardPreview/VideoCardPreview';
import { VideoCardRestrictionOverlay } from '../VideoCardRestrictionOverlay/VideoCardRestrictionOverlay';
import { VideoCardThumb } from '../VideoCardThumb/VideoCardThumb';
import { VideoCardControls } from './VideoCardControls/VideoCardControls';
import { VideoCardExpandingControl } from './VideoCardControls/components/VideoCardExpandingControl/VideoCardExpandingControl';
import { VideoCardIconControl } from './VideoCardControls/components/VideoCardIconControl/VideoCardIconControl';
import { useActive } from './hooks/useActive';
import styles from './VideoCard.module.css';
const VideoCardComponent = ({ video, menuItems, ownerVisibilityMode = 'visible', onMenuClick, controlItems, controls = 'hover', overlay, noAvatar, direction = 'vertical', size = 'm', stretched, noRounded, noExtendedBadge, onVideoOpen, onThumbClick, onTitleClick, onAuthorClick, videoContainerWidth, infoContainerWidth, onRestrictionButtonClick, getRef, onMenuPopoverShownChange, onMenuPopoverShownChanged, restoreMenuPopoverFocus, forceShowPlay, selected, onSelect, selectMode, isHighlighted, selectButtonAriaLabel, noPlayIcon, showMenu, getMenuRef, getPreviewThumbRef, onClickEpisode, defaultExpandedEpisodes, disabledAccordionEpisodes, defaultSelectedEpisodeIndex, thumbDataTitleEpisodes, titleEpisodes, hasVideoPlayerFullPreview, onMouseOut, onMouseOver, onClickAccordionEpisodes, focusOutlined, avatarWrapperLabel, videoCardPreviewLabel, playIconOnHover, testId, }) => {
    const { restriction, owner } = video;
    const hasOverlay = Boolean(overlay);
    const { activate, deactivate, isActive } = useActive(false);
    const isVideoCardActive = !hasOverlay && isActive;
    const isHorizontalMini = direction === 'horizontal' && size === 's';
    const isVerticalFullWidth = direction !== 'horizontal' && stretched;
    const onVideoCardThumbClick = isHorizontalMini ? onThumbClick : onVideoOpen;
    const onVideoCardTitleClick = isHorizontalMini ? onTitleClick : onVideoOpen;
    const hasEpisodes = Boolean(video.episodes?.length && titleEpisodes);
    const shouldShowControls = controls === 'always' || isVideoCardActive;
    const restSelectProps = selectMode === 'card' || selectMode === 'icon'
        ? {
            selectMode,
            onSelect,
            selectButtonAriaLabel,
        }
        : {};
    const isVideoSelectable = selectMode && size === 'm';
    const getCardInfoAction = () => {
        if (video.cardInfoAction) {
            return video.cardInfoAction;
        }
        if (onMenuClick) {
            return (_jsx(VideoCardMenu, { onMenuClick: onMenuClick, getRootRef: getMenuRef, visible: showMenu || isVideoCardActive }));
        }
        if (menuItems) {
            return (_jsx(VideoCardMenu, { items: menuItems, visible: showMenu || isVideoCardActive, onMenuPopoverShownChange: onMenuPopoverShownChange, onMenuPopoverShownChanged: onMenuPopoverShownChanged, restoreMenuPopoverFocus: restoreMenuPopoverFocus }));
        }
        return undefined;
    };
    const sharedProps = {
        video,
        overlay,
        stretched,
        noRounded,
        getRef,
        onVideoCardActivate: activate,
        onVideoCardDeactivate: deactivate,
        onMouseOver: onMouseOver,
        onMouseOut: onMouseOut,
        videoContainerWidth,
        onVideoOpen: selectMode === 'card' ? restSelectProps.onSelect : onVideoOpen,
        hasEpisodes,
        focusOutlined,
        isVideoCardActive,
        hasVideoPlayerFullPreview,
    };
    const infoProps = {
        owner,
        secondaryOwners: video.secondaryOwners,
        ownersRelationText: video.ownersRelationText,
        title: video.title,
        additionalInfo: video.additionalInfo,
        description: video.description,
        episodes: video.episodes,
        defaultExpandedEpisodes,
        disabledAccordionEpisodes,
        defaultSelectedEpisodeIndex,
        thumbDataTitleEpisodes,
        titleEpisodes,
        onClickEpisode,
        onClickAccordionEpisodes,
        hasOverlay,
        href: video.href,
        noAvatar,
        stretched: isVerticalFullWidth,
        onAuthorClick: onAuthorClick,
        action: hasOverlay ? undefined : getCardInfoAction(),
        onTitleClick: selectMode === 'card' ? onSelect : onVideoCardTitleClick,
    };
    const getProps = () => {
        if (direction === 'horizontal' && size === 's') {
            return {
                direction: 'horizontal',
                size: 's',
                isHighlighted,
            };
        }
        return { direction, size };
    };
    const disableCardLink = hasOverlay || restriction?.buttonTitle || restriction?.buttonNode;
    return (_jsx(VideoCardLayout, { ...sharedProps, ...getProps(), preview: _jsxs(_Fragment, { children: [isVideoSelectable && (_jsx("div", { className: styles.selectIconButton, children: _jsx(IconButton, { "data-testid": "video_card_select_button", size: 40, onClick: restSelectProps.onSelect, label: restSelectProps.selectButtonAriaLabel, children: selected ? (_jsx(RasterIcon48CheckCircleShadowLarge, { "data-testid": "video-card-select-icon-selected" })) : (_jsx(RasterIcon48CircleOutlineShadowLarge, { "data-testid": "video-card-select-icon-unselected" })) }) })), _jsxs(VideoCardThumb, { getRootRef: getPreviewThumbRef, focusDisabled: focusOutlined, onClick: disableCardLink
                        ? undefined
                        : selectMode === 'card'
                            ? restSelectProps.onSelect
                            : onVideoCardThumbClick, href: disableCardLink ? undefined : video.href, hasHover: hasOverlay, controls: !isHorizontalMini &&
                        !hasVideoPlayerFullPreview && (_jsx(VideoCardControls, { visible: shouldShowControls, items: hasOverlay ? undefined : controlItems, noBackground: controls === 'always' })), children: [restriction?.mode !== 'hidden' && (_jsx(VideoCardPreview, { ...video, hasVideoPlayerFullPreview: hasVideoPlayerFullPreview, focusDisabled: focusOutlined, direction: direction, size: size, active: isVideoCardActive, blurred: restriction?.mode === 'blurred', muted: restriction?.mode === 'muted', hasOverlay: hasOverlay, forceShowPlay: forceShowPlay, noPlayIcon: noPlayIcon, noExtendedBadge: noExtendedBadge, videoCardPreviewLabel: videoCardPreviewLabel, playIconOnHover: playIconOnHover })), restriction &&
                            restriction.mode !== 'muted' &&
                            !(restriction.mode === 'dark' && size === 'm') && (_jsx(VideoCardRestrictionOverlay, { title: restriction.mode !== 'blurred' || size !== 's' ? restriction.title : undefined, titleNode: restriction.titleNode, text: stretched ? restriction.text : undefined, buttonTitle: restriction.buttonTitle, buttonNode: restriction.buttonNode, onRestrictionButtonClick: onRestrictionButtonClick, mode: restriction.mode, iconType: restriction.iconType, size: size, stretched: stretched }))] }), overlay && overlay.kind === 'full' && _jsx(VideoCardOverlay, { ...overlay })] }), testId: testId || 'video_card_layout', info: video.title && (_jsx(VideoCardInfo, { ...infoProps, focusDisabled: focusOutlined, width: infoContainerWidth, direction: direction, ownerVisibilityMode: ownerVisibilityMode, size: size, overlay: overlay?.kind === 'info' && (_jsx(VideoCardOverlay, { ...overlay, textWeight: "3", textColor: "secondary", textAlign: "left" })), avatarWrapperLabel: avatarWrapperLabel })) }));
};
export const VideoCard = Object.assign(VideoCardComponent, {
    IconControl: VideoCardIconControl,
    ExpandingControl: VideoCardExpandingControl,
});
//# sourceMappingURL=VideoCard.js.map