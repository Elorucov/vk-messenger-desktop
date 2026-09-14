import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { getOwnerAvatar } from '../../../utils/getOwnerAvatar';
import { Caption, Footnote } from '../../Adopted';
import { RichAvatar } from '../../RichAvatar/RichAvatar';
import { VideoCardInfoLayout, } from '../VideoCardInfoLayout/VideoCardInfoLayout';
import { VideoCardOwners } from '../VideoCardOwners/VideoCardOwners';
import styles from './VideoCardInfo.module.css';
const VIDEO_CARD_AVATAR_SIZE = 36;
export const VideoCardInfo = ({ owner, title, additionalInfo, description, action, titleLines, hasOverlay, stretched, onAuthorClick, noAvatar, ownerVisibilityMode = 'visible', onTitleClick, href, direction = 'vertical', size = 'm', className, overlay, secondaryOwners, ownersRelationText, width, episodes, onClickEpisode, defaultExpandedEpisodes, defaultSelectedEpisodeIndex, thumbDataTitleEpisodes, titleEpisodes, disabledAccordionEpisodes, onClickAccordionEpisodes, focusDisabled, avatarWrapperLabel, }) => {
    const isHorizontal = direction === 'horizontal';
    const isHorizontalMini = isHorizontal && size === 's';
    const InfoComponent = isHorizontalMini ? Caption : Footnote;
    return (_jsx(VideoCardInfoLayout, { owner: owner, title: title, href: href, action: action, titleLines: titleLines, additionalInfo: additionalInfo, description: description, hasOverlay: hasOverlay, stretched: stretched, onAuthorClick: onAuthorClick, noAvatar: noAvatar, ownerVisibilityMode: ownerVisibilityMode, onTitleClick: onTitleClick, onClickEpisode: onClickEpisode, direction: direction, size: size, overlay: overlay, className: className, episodes: episodes, defaultExpandedEpisodes: defaultExpandedEpisodes, defaultSelectedEpisodeIndex: defaultSelectedEpisodeIndex, thumbDataTitleEpisodes: thumbDataTitleEpisodes, titleEpisodes: titleEpisodes, disabledAccordionEpisodes: disabledAccordionEpisodes, onClickAccordionEpisodes: onClickAccordionEpisodes, avatar: _jsx(RichAvatar, { size: VIDEO_CARD_AVATAR_SIZE, alt: owner.name, src: getOwnerAvatar(owner), nft: owner.is_nft || false }), ownerComponent: _jsx(VideoCardOwners, { owner: owner, secondaryOwners: secondaryOwners, ownersRelationText: ownersRelationText, hasOverlay: hasOverlay, lines: 1, onClick: onAuthorClick, Component: InfoComponent, className: classNames(stretched && styles.inlineInfo) }), width: width, focusDisabled: focusDisabled, avatarWrapperLabel: avatarWrapperLabel }));
};
//# sourceMappingURL=VideoCardInfo.js.map