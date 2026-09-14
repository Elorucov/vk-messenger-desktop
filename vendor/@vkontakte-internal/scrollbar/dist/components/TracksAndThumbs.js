import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, memo, useImperativeHandle, useRef } from 'react';
import { TrackWithThumb } from '../components/TrackWithThumb';
export const TracksAndThumbs = memo(forwardRef(({ overflowY, overflowX, forceVisible, xTrackNeeded, yTrackNeeded, clickOnTrack, dispatchScrollAction, }, $tracksAndThumbsRef) => {
    const $xTrackWithThumb = useRef(null);
    const $yTrackWithThumb = useRef(null);
    useImperativeHandle($tracksAndThumbsRef, () => ({
        x: $xTrackWithThumb.current,
        y: $yTrackWithThumb.current,
    }), 
    // Необходимо для корректного восстановления рефов
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [xTrackNeeded, yTrackNeeded, overflowX, overflowY]);
    return (_jsxs(_Fragment, { children: [overflowX !== 'hidden' && xTrackNeeded && (_jsx(TrackWithThumb, { ref: $xTrackWithThumb, axis: "x", dispatchScrollAction: dispatchScrollAction, clickOnTrack: clickOnTrack, forceVisible: forceVisible })), overflowY !== 'hidden' && yTrackNeeded && (_jsx(TrackWithThumb, { ref: $yTrackWithThumb, axis: "y", dispatchScrollAction: dispatchScrollAction, clickOnTrack: clickOnTrack, forceVisible: forceVisible }))] }));
}));
TracksAndThumbs.displayName = 'TracksAndThumbs';
