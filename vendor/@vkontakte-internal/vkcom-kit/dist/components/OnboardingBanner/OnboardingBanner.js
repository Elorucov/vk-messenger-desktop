import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Paragraph":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { getColorClass } from '../../utils/getColorClass/getColorClass';
import { Banner, Paragraph } from '../Adopted';
import { LangTag } from '../LangTag/LangTag';
import { OnboardingHighlighter, } from '../OnboardingHighlighter/OnboardingHighlighter';
import { PointerIcon } from './PointerIcon';
import styles from './OnboardingBanner.module.css';
const pointerAppearanceMap = {
    lime: getColorClass('color_accent_lime'),
    cyan: getColorClass('color_accent_cyan'),
    azure: getColorClass('color_accent_azure'),
    pink: getColorClass('color_accent_pink'),
};
const pointerMarginMap = {
    shake: styles.pointerShake,
};
const pointerDirectionMap = {
    reversed: styles.pointerReversed,
};
export const OnboardingBanner = ({ children, pattern = 'downward-arrow', action, highlighterShape, appearance = 'lime', getRootRef, zIndex, pointerDirection = 'regular', onClick, onActionClick, ...restProps }) => {
    const onActionClickHandler = (e) => {
        e.stopPropagation();
        onActionClick?.();
    };
    return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
    _jsx("div", { ref: getRootRef, className: classNames(styles.root, restProps.mode === 'transparent' && styles.transparent), onClick: onClick, style: { zIndex }, children: _jsx(Banner, { stretched: true, noPadding: true, asideMode: "dismiss", header: _jsx(Paragraph, { className: styles.text, weight: "1", children: _jsx(LangTag, { tag: "highlight", Component: OnboardingHighlighter, animated: false, appearance: appearance, shape: highlighterShape, zIndex: -1, children: children }) }), ...restProps, actions: 
            /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
            _jsxs("div", { className: classNames(styles.actions, !action && styles.actionsEmpty), onClick: onActionClickHandler, children: [action, _jsx(PointerIcon, { className: classNames(styles.pointer, pointerDirectionMap[pointerDirection], pointerAppearanceMap[appearance], pointerMarginMap[pattern]), pattern: pattern })] }) }) }));
};
//# sourceMappingURL=OnboardingBanner.js.map