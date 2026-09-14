import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames, noop } from '@vkontakte/vkjs';
import { IconOnboardingHighlighter112h, IconOnboardingHighlighter212h, IconOnboardingHighlighter312h, IconOnboardingHighlighter412h, } from '@vkontakte-internal/icons-private';
import { useStableCallback } from '@vkontakte-internal/react-utils';
import { useEffect, useState } from 'react';
import { getColorClass } from '../../utils/getColorClass/getColorClass';
import styles from './OnboardingHighlighter.module.css';
const appearanceModifiers = {
    lime: getColorClass('color_accent_lime'),
    azure: getColorClass('color_accent_azure'),
    cyan: getColorClass('color_accent_cyan'),
    pink: getColorClass('color_accent_pink'),
};
const shapeIconsMap = {
    1: IconOnboardingHighlighter112h,
    2: IconOnboardingHighlighter212h,
    3: IconOnboardingHighlighter312h,
    4: IconOnboardingHighlighter412h,
};
export const OnboardingHighlighter = ({ children, appearance = 'lime', shape = 1, animated, duration, onHide = noop, zIndex, contrast, }) => {
    const ShapeIcon = shapeIconsMap[shape];
    const [hidden, setHidden] = useState(false);
    const onHideStable = useStableCallback(onHide);
    useEffect(() => {
        if (!animated || !duration) {
            return;
        }
        const timeout = setTimeout(() => {
            setHidden(true);
            onHideStable();
        }, duration);
        return () => clearTimeout(timeout);
    }, [onHideStable, animated, duration]);
    return (_jsxs("span", { className: styles.root, style: { zIndex }, children: [children, _jsxs("span", { className: classNames(styles.shapeWrapper, appearanceModifiers[appearance], !animated && styles.static, animated && !hidden && styles.shown, animated && hidden && styles.hidden), children: [_jsx(ShapeIcon
                    // Сбрасываем дефолтные ширину/высоту чтобы растянуть svg
                    , { 
                        // Сбрасываем дефолтные ширину/высоту чтобы растянуть svg
                        style: {
                            width: '100%',
                            height: '100%',
                        }, className: styles.shape }), _jsx("span", { className: classNames(styles.text, contrast && styles.textContrast), children: children })] })] }));
};
//# sourceMappingURL=OnboardingHighlighter.js.map