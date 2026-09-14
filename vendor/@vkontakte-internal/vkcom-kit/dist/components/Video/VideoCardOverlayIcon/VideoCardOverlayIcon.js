import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './VideoCardOverlayIcon.module.css';
const typeModifiersMap = {
    loading: styles.overlayIconLoading,
    muted: styles.overlayIconMuted,
};
const sizeClassNameMap = {
    s: styles.overlayIconSizeS,
    m: styles.overlayIconSizeM,
};
const hoverModeMap = {
    regular: styles.overlayIconHoverRegular,
    dark: styles.overlayIconHoverDark,
};
export const VideoCardOverlayIcon = ({ children, type, size = 's', hovered, hoverMode = 'regular', playIconOnHover, }) => (_jsx("div", { className: classNames(styles.overlayIcon, sizeClassNameMap[size], hoverModeMap[hoverMode], type && typeModifiersMap[type], hovered && styles.overlayIconHovered, playIconOnHover && styles.overlayIconShowOnHover), children: children }));
//# sourceMappingURL=VideoCardOverlayIcon.js.map