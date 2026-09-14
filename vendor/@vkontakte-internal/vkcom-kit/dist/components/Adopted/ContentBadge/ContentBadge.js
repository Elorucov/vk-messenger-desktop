import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Tappable } from '@vkontakte/vkui';
import { Children } from 'react';
import { Caption, Footnote } from '../Typography/Typography';
import { ContentBadgeProvider } from './ContentBadgeContext';
import { ContentBadgeIconSlot } from './ContentBadgeIconSlot';
import styles from './ContentBadge.module.css';
const modeModifiersMap = {
    primary: styles.rootModePrimary,
    secondary: styles.rootModeSecondary,
    outline: styles.rootModeOutline,
};
const sizeModifiersMap = {
    s: styles.rootSizeS,
    m: styles.rootSizeM,
    l: styles.rootSizeL,
};
const appearanceModifiersMap = {
    'accent': styles.rootAppearanceAccent,
    'accent-red': styles.rootAppearanceAccentRed,
    'accent-orange-fire': styles.rootAppearanceAccentOrangeFire,
    'accent-orange': styles.rootAppearanceAccentOrange,
    'accent-orange-peach': styles.rootAppearanceAccentOrangePeach,
    'accent-green': styles.rootAppearanceAccentGreen,
    'accent-secondary': styles.rootAppearanceAccentSecondary,
    'accent-tint': styles.rootAppearanceAccentTint,
    'accent-blue': styles.rootAppearanceAccentBlue,
    'accent-purple': styles.rootAppearanceAccentPurple,
    'accent-violet': styles.rootAppearanceAccentViolet,
    'accent-raspberry-pink': styles.rootAppearanceAccentRaspberryPink,
    'accent-pink': styles.rootAppearanceAccentPink,
    'accent-gray': styles.rootAppearanceAccentGray,
    'neutral': styles.rootAppearanceNeutral,
    'overlay': styles.rootAppearanceOverlay,
};
const ContentBadgeComponent = ({ children, capsule, className, size = 'm', mode = 'primary', appearance = 'accent', ...restProps }) => {
    const Typography = size === 'l' ? Footnote : Caption;
    return (_jsx(Tappable, { className: classNames(styles.root, modeModifiersMap[mode], sizeModifiersMap[size], appearanceModifiersMap[appearance], size !== 's' && capsule && styles.rootCapsule, className), ...restProps, children: _jsx(Typography, { weight: "2", className: styles.content, children: _jsx(ContentBadgeProvider, { value: { isSingleChild: Children.count(children) === 1, size }, children: children }) }) }));
};
export const ContentBadge = Object.assign(ContentBadgeComponent, {
    IconSlot: ContentBadgeIconSlot,
});
//# sourceMappingURL=ContentBadge.js.map