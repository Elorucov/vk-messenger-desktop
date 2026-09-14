import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, useCallback, useImperativeHandle, useRef, } from 'react';
import './TrackWithThumb.css';
import { Thumb } from '../components/Thumb';
import { cx } from '../utils/cx';
import { isHoveredOver } from '../utils/isHoveredOver';
export const TrackWithThumb = forwardRef(({ axis, dispatchScrollAction, clickOnTrack, forceVisible }, $ref) => {
    const $trackRef = useRef(null);
    const $thumb = useRef(null);
    const onTrackClick = useCallback((clientX, clientY) => {
        if (!clickOnTrack ||
            (typeof clickOnTrack === 'string' && clickOnTrack !== axis)) {
            return;
        }
        const thumb = $thumb.current?.ref.current;
        if (!thumb) {
            return;
        }
        dispatchScrollAction((scrollableElement) => {
            const { scrollLeft, scrollTop } = scrollableElement;
            const { width, height } = scrollableElement.getBoundingClientRect();
            const { left, top } = thumb.getBoundingClientRect();
            const size = axis === 'x' ? width : height;
            const offset = axis === 'x' ? left : top;
            const spot = axis === 'x' ? clientX : clientY;
            const scrollState = axis === 'x' ? scrollLeft : scrollTop;
            const direction = Math.sign(spot - offset);
            const scrollSize = scrollState + size * direction;
            const scrollToOptions = axis === 'x' ? { left: scrollSize } : { top: scrollSize };
            scrollableElement.scrollTo({
                ...scrollToOptions,
                behavior: 'auto',
            });
        });
    }, [axis, clickOnTrack, dispatchScrollAction]);
    useImperativeHandle($ref, () => ({
        thumb: $thumb.current,
        track: {
            ref: $trackRef,
            onTrackClick,
            isHoveredOver: isHoveredOver($trackRef),
        },
    }), [onTrackClick]);
    return (_jsx("div", { ref: $trackRef, "data-scrollbar": `track track${axis.toUpperCase()}`, className: cx(`sbarTrack sbarTrack${axis.toUpperCase()}`, applyVisibility(axis, forceVisible)), children: _jsx(Thumb, { ref: $thumb, axis: axis, dispatchScrollAction: dispatchScrollAction }) }));
});
TrackWithThumb.displayName = 'TrackWithThumb';
function applyVisibility(axis, forceVisible) {
    if (!forceVisible) {
        return '';
    }
    if (typeof forceVisible === 'boolean' || forceVisible === axis) {
        return `sbarTrack${axis.toUpperCase()}--visible`;
    }
    return '';
}
