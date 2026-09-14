import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon20LiveBadge":["@vkontakte-internal/icons-private",{"className":1}],"IconLiveText20h":["@vkontakte-internal/icons-private",{"className":1}],"Footnote":["Adopted",{"className":1}],"Icon12HandPointUp":["@vkontakte/icons",{"className":1}]} */
import { Icon12HandPointUp, Icon12MusicNote } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { Icon20LiveBadge, IconLiveText20h } from '@vkontakte-internal/icons-private';
import { useAppearanceDetector } from '../../../../hooks/useAppearanceDetector/useAppearanceDetector';
import { AppearanceProvider, Footnote } from '../../../Adopted';
import styles from './VideoCardBadge.module.css';
const durationBadgeClassNameMap = {
    s: styles.durationBadgeSizeS,
    m: styles.durationBadgeSizeM,
};
const contentTypeClassNameMap = {
    'music-video': styles.musicVideoBadge,
};
export const VideoCardBadge = ({ type, text, interactive, className, durationBadgeSize = 's', contentType, }) => {
    const appearance = useAppearanceDetector();
    const contentTypeStyle = contentType && contentTypeClassNameMap[contentType];
    const musicVideo = contentType === 'music-video';
    if (type === 'live') {
        return _jsx(Icon20LiveBadge, { className: styles.badge });
    }
    if (type === 'upcoming') {
        return (_jsx(IconLiveText20h, { className: classNames(styles.upcomingLiveBadge, styles.badge, styles.durationBadge) }));
    }
    if (!text) {
        return null;
    }
    return (_jsx(AppearanceProvider, { value: interactive ? 'dark' : appearance, children: _jsxs(Footnote, { weight: "2", className: classNames(styles.badge, styles.durationBadge, durationBadgeClassNameMap[durationBadgeSize], interactive && styles.interactiveBadge, contentTypeStyle, className), "data-testid": "video_card_duration", children: [interactive && _jsx(Icon12HandPointUp, { className: styles.interactiveBadgeIcon }), musicVideo && _jsx(Icon12MusicNote, {}), text] }) }));
};
//# sourceMappingURL=VideoCardBadge.js.map