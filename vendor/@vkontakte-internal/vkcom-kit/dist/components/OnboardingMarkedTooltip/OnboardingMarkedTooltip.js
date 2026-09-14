import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Popper":["Adopted",{"style":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { usePatchChildrenRef } from '@vkontakte-internal/react-utils';
import { useMemo, } from 'react';
import { getVKSansDisplayClass } from '../../utils/getVKSansDisplayClass/getVKSansDisplayClass';
import { Popper, Text } from '../Adopted';
import { OnboardingTooltipMarker } from './OnboardingTooltipMarker/OnboardingTooltipMarker';
import { calculateValidMarkerSize, getOffsetByCrossAxis, getOffsetByMainAxis, getTipCustomCssProperties, } from './helpers';
import { useOnboardingTooltipAppearance } from './hooks/useOnboardingTooltipAppearance';
import { useOnboardingTooltipMarkerOffset } from './hooks/useOnboardingTooltipMarkerOffset';
import { useOnboardingTooltipPlacement } from './hooks/useOnboardingTooltipPlacement';
import styles from './OnboardingMarkedTooltip.module.css';
export const OnboardingMarkedTooltip = ({ shown, mode = '1', appearance = 'lime', tilt = 'left', size = 48, tipPosition, onShowStart, onShowEnd, onHideStart, onHideEnd, onClose, maxWidth = 210, content, onClick, onMarkerClick, zIndex, hideTooltip, tooltipShown, children: childrenProp, ...restProps }) => {
    const [childrenRef, children] = usePatchChildrenRef(childrenProp);
    const { computedShown, initialized, animated, animationIn, startAnimation, endAnimation, tipRef } = useOnboardingTooltipAppearance({
        shown,
        onShowStart,
        onShowEnd,
        onHideStart,
        onHideEnd,
        onClose,
    });
    const { onPlacementChange, tipPlacement } = useOnboardingTooltipPlacement({
        tipPosition,
    });
    const markerSize = useMemo(() => {
        return calculateValidMarkerSize(mode, size);
    }, [mode, size]);
    const { markerOffsetX, markerOffsetY } = useOnboardingTooltipMarkerOffset({
        shown: computedShown,
        size: markerSize,
        childrenRef,
    });
    const onClickHandler = (e) => {
        e.stopPropagation();
        onClick?.(e);
    };
    if (!content) {
        return children ?? null;
    }
    const style = getTipCustomCssProperties({
        tipPlacement,
        markerOffsetX,
        markerOffsetY,
        size: markerSize,
        tilt,
    });
    return (_jsxs(_Fragment, { children: [children, computedShown && (_jsx(Popper, { targetRef: childrenRef, role: "tooltip", "aria-live": "polite", "aria-hidden": !initialized || !animationIn, "aria-describedby": "onboarding_tooltip_content", getRootRef: tipRef, style: {
                    ...style,
                    maxWidth,
                    zIndex,
                    pointerEvents: initialized && !hideTooltip && animationIn && !tooltipShown ? 'auto' : 'none',
                }, offsetByCrossAxis: getOffsetByCrossAxis(tipPlacement, markerSize[0], markerOffsetX), offsetByMainAxis: getOffsetByMainAxis(markerSize[1], markerOffsetY), placement: tipPlacement, onPlacementChange: onPlacementChange, onClick: onClickHandler, ...restProps, children: _jsxs(_Fragment, { children: [_jsx(OnboardingTooltipMarker, { targetRef: childrenRef, size: markerSize, mode: mode, appearance: appearance, animated: animated, animationIn: animationIn, startAnimation: startAnimation, endAnimation: endAnimation, onClick: onMarkerClick }), _jsx("div", { className: classNames(styles.root, initialized &&
                                !hideTooltip &&
                                (animationIn && !tooltipShown ? styles.rootIn : styles.rootOut)), children: _jsx(Text, { className: getVKSansDisplayClass(), id: "onboarding_tooltip_content", weight: "2", children: content }) })] }) }))] }));
};
//# sourceMappingURL=OnboardingMarkedTooltip.js.map