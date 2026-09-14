import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useMemo, useCallback, forwardRef } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { Touch } from '../../../../components/Touch/Touch';
import { useIsScroll } from '../../../../components/Touch/useIsScroll';
import { collapsedCallPositionStorage } from '../../../../helpers/sessionStorage';
/** нужен для использования с PIP */
export const COLLAPSED_CALL_MAIN_CLASS = 'CollapsedCall';
export const CollapsedCall = forwardRef(({ children, isCollapsedPip }, ref) => {
    const classes = cx(COLLAPSED_CALL_MAIN_CLASS, {
        'CollapsedCall--withAnimation': !isCollapsedPip,
        'CollapsedCall--pip': !!isCollapsedPip,
    });
    return (_jsx("div", { ref: ref, className: classes, children: children }));
});
CollapsedCall.displayName = COLLAPSED_CALL_MAIN_CLASS;
export const CollapsedCallDraggable = ({ children, className }) => {
    const isScroll = useIsScroll('body');
    /** совпадает с css */
    const padding = useMemo(() => ({
        bottom: isScroll.h ? 30 : 15,
        left: 15,
        right: isScroll.v ? 30 : 15,
        top: 15,
    }), [isScroll]);
    /** совпадает с css */
    const startCoords = useMemo(() => {
        return collapsedCallPositionStorage.getPosition() || [15, -15];
    }, []);
    const ignoredSelectors = useMemo(() => {
        return ['.CallVideoWidget__buttons'];
    }, []);
    const handleOnUpdateStartCoords = useCallback((coords) => {
        collapsedCallPositionStorage.setPosition(coords);
    }, []);
    const classes = cx(COLLAPSED_CALL_MAIN_CLASS, 'CollapsedCall--draggable', 'CollapsedCall--withAnimation', className);
    return (_jsx(Touch, { className: classes, padding: padding, startCoords: startCoords, onUpdateStartCoords: handleOnUpdateStartCoords, ignoredSelectors: ignoredSelectors, children: children }));
};
//# sourceMappingURL=CollapsedCall.js.map