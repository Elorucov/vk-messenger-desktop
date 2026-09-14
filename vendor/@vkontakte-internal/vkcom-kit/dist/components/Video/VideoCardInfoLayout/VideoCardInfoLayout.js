import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { isInteractive } from '../../../utils/isInteractive';
import { Caption, Footnote, Spacing, Subhead } from '../../Adopted';
import { TextClamp } from '../../TextClamp/TextClamp';
import { VideoCardEpisodes } from '../VideoCardEpisodes/VideoCardEpisodes';
import styles from './VideoCardInfoLayout.module.css';
export const VideoCardInfoLayout = ({ owner, title, additionalInfo, description, action, titleLines = 2, hasOverlay, stretched, onAuthorClick, noAvatar, ownerVisibilityMode = 'visible', onTitleClick, href, direction = 'vertical', size = 'm', className, overlay, avatar, ownerComponent, width, episodes, onClickEpisode: handleClickEpisode, defaultExpandedEpisodes, defaultSelectedEpisodeIndex, thumbDataTitleEpisodes, titleEpisodes, disabledAccordionEpisodes, onClickAccordionEpisodes: handleClickAccordionEpisodes, focusDisabled, avatarWrapperLabel, }) => {
    const isInteractiveItem = isInteractive({ href, onClick: onTitleClick });
    const isHorizontal = direction === 'horizontal';
    const isHorizontalBig = isHorizontal && size === 'm';
    const isHorizontalMini = isHorizontal && size === 's';
    const isVertical = direction === 'vertical';
    const ownerHref = owner?.href && !hasOverlay ? owner.href : undefined;
    const TitleComponent = isHorizontalMini ? Footnote : Subhead;
    const InfoComponent = isHorizontalMini ? Caption : Footnote;
    const AvatarComponent = ownerHref ? 'a' : 'div';
    const hasEpisodes = !!(episodes?.length && titleEpisodes);
    const containerStyles = width
        ? {
            width,
        }
        : {};
    let ownerView;
    switch (ownerVisibilityMode) {
        case 'visible':
            ownerView = ownerComponent;
            break;
        case 'hidden':
            ownerView = _jsx(Spacing, { size: 4 });
            break;
        case 'hiddenWithoutSpacing':
            ownerView = null;
    }
    return (_jsx("div", { style: containerStyles, className: classNames(styles.container, className, 
        // Если оверлей присутствует, но он не прокинут внутрь компонента
        hasOverlay && !overlay && styles.containerOverlayed, isHorizontal && styles.containerHorizontal, isHorizontalBig && styles.containerHorizontalBig, stretched && styles.containerFullWidth, hasEpisodes && isVertical && styles.containerWithEpisodes), children: overlay || (_jsxs(_Fragment, { children: [!noAvatar && isVertical && (
                // Аватар автора
                _jsx(AvatarComponent, { "aria-label": avatarWrapperLabel, className: styles.avatar, href: ownerHref, onClick: onAuthorClick, "data-testid": "video_card_author", children: avatar })), _jsxs("div", { className: classNames(styles.content, hasEpisodes && isVertical && styles.contentWithEpisodes), children: [_jsxs("div", { "data-testid": "video_card_title", className: classNames(styles.info, action && styles.infoWithAction), children: [_jsx(TextClamp, { TypographyComponent: TitleComponent, lines: titleLines, weight: "2", href: hasOverlay ? undefined : href, tabIndex: focusDisabled ? -1 : 0, Component: !hasOverlay && isInteractiveItem ? 'a' : undefined, className: classNames(styles.title, href && styles.titleLink), onClick: hasOverlay ? undefined : onTitleClick, title: title, children: title }), !!action && _jsx("div", { className: styles.action, children: action })] }), ownerView, !!additionalInfo && (_jsx(TextClamp, { TypographyComponent: InfoComponent, lines: isHorizontalBig ? 2 : 1, className: styles.additionalInfo, "data-testid": "video_card_additional_info", children: additionalInfo })), !!description && isHorizontalBig && (_jsx(TextClamp, { TypographyComponent: Footnote, lines: 3, className: styles.description, children: description })), hasEpisodes && isHorizontal && (_jsx(VideoCardEpisodes, { title: titleEpisodes, onClickEpisode: handleClickEpisode, defaultExpanded: defaultExpandedEpisodes, defaultSelectedEpisodeIndex: defaultSelectedEpisodeIndex, thumbDataTitle: thumbDataTitleEpisodes, episodes: episodes, disabledAccordion: disabledAccordionEpisodes, onClickAccordion: handleClickAccordionEpisodes }))] }), hasEpisodes && isVertical && (_jsx(VideoCardEpisodes, { title: titleEpisodes, onClickEpisode: handleClickEpisode, defaultExpanded: defaultExpandedEpisodes, defaultSelectedEpisodeIndex: defaultSelectedEpisodeIndex, thumbDataTitle: thumbDataTitleEpisodes, episodes: episodes, disabledAccordion: disabledAccordionEpisodes, onClickAccordion: handleClickAccordionEpisodes }))] })) }));
};
//# sourceMappingURL=VideoCardInfoLayout.js.map