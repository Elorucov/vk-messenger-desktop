import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"SimpleCell":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Fragment, isValidElement } from 'react';
import { getColorClass } from '../../utils/getColorClass/getColorClass';
import { Avatar, Caption, Footnote, Headline, SimpleCell } from '../Adopted';
import { IconSlider } from './IconSlider/IconSlider';
import styles from './OnboardingBenefit.module.css';
const sizeMap = {
    s: 48,
    m: 64,
};
const beforeSizeMap = {
    s: 32,
    m: 40,
};
export const OnboardingBenefit = ({ size = 'm', before, subtitle, noHorizontalPadding, children, ...restProps }) => {
    const TypographyComponent = size === 's' ? Footnote : Headline;
    const SubtitleTypographyComponent = size === 's' ? Caption : Footnote;
    const beforeIcons = getBeforeIcons(before);
    return (_jsx(SimpleCell, { className: classNames(noHorizontalPadding && styles.rootNoHorizontalPadding), minHeight: sizeMap[size], before: _jsx(Avatar, { className: getColorClass('color_icon_accent'), size: beforeSizeMap[size], noBorder: true, children: Array.isArray(beforeIcons) ? _jsx(IconSlider, { children: beforeIcons }) : beforeIcons }), subtitle: Boolean(subtitle) && _jsx(SubtitleTypographyComponent, { children: subtitle }), multiline: true, ...restProps, children: _jsx(TypographyComponent, { children: children }) }));
};
function getBeforeIcons(before) {
    if (isValidElement(before) &&
        before.type === Fragment &&
        before.props &&
        typeof before.props === 'object' &&
        'children' in before.props) {
        return before.props.children;
    }
    return before;
}
//# sourceMappingURL=OnboardingBenefit.js.map