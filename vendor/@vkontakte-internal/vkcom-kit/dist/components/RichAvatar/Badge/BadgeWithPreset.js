import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Avatar.BadgeWithPreset":["Adopted",{"className":1,"style":1}]} */
import { Icon12Circle } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { Icon12LiveBadge } from '@vkontakte-internal/icons-private';
import { useContext } from 'react';
import { Avatar, ImageBaseContext } from '../../Adopted';
import { placementModifiersMap, RichAvatarBadge } from './Badge';
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-css-module, css-modules/no-unused-class
import badgeStyles from './Badge.module.css';
import styles from './BadgeWithPreset.module.css';
const presetIconsMap = {
    'live': Icon12LiveBadge,
    'live-outline': Icon12LiveBadge,
    'content-unseen': Icon12Circle,
};
const presetModifiersMap = {
    'live': styles.rootLive,
    'live-outline': styles.rootLiveOutline,
    'content-unseen': styles.rootContentUnseen,
};
export const RichAvatarBadgeWithPreset = ({ placement = 'bottom-right', zIndex, className, style: styleProp, preset, ...restProps }) => {
    const { size } = useContext(ImageBaseContext);
    const badgeSize = getBadgeIconSizeByImageBaseSize(size);
    const style = {
        zIndex: zIndex ?? styleProp?.zIndex,
        ...styleProp,
    };
    if (preset === 'online' || preset === 'online-mobile') {
        return (_jsx(Avatar.BadgeWithPreset, { className: classNames(badgeStyles.root, placementModifiersMap[placement], className), style: style, preset: preset, ...restProps }));
    }
    const Icon = presetIconsMap[preset];
    if (preset === 'content-unseen') {
        placement = 'top-right';
    }
    return (_jsx(RichAvatarBadge, { placement: placement, zIndex: zIndex, background: "stroke", className: classNames(presetModifiersMap[preset], className), style: style, 
        // @ts-expect-error TS0000: Как раньше работало? Жалоб вроде бы не было, посмотрим после того как обновим VKUI
        preset: preset, ...restProps, children: _jsx(Icon, { className: styles.icon, style: {
                height: badgeSize,
                width: 'auto',
            } }) }));
};
function getBadgeIconSizeByImageBaseSize(size) {
    if (size < 72) {
        return 12;
    }
    if (size < 120) {
        return 16;
    }
    return 20;
}
//# sourceMappingURL=BadgeWithPreset.js.map