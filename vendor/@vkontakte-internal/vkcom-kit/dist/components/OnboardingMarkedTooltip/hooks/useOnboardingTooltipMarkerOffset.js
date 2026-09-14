import { useLayoutEffect, useState } from 'react';
export const useOnboardingTooltipMarkerOffset = ({ size, shown, childrenRef, }) => {
    const [markerOffsetX, setMarkerOffsetX] = useState(0);
    const [markerOffsetY, setMarkerOffsetY] = useState(0);
    useLayoutEffect(() => {
        if (!shown) {
            return;
        }
        const container = childrenRef.current;
        const { width = 0, height = 0 } = container?.getBoundingClientRect() || {};
        setMarkerOffsetX((size[0] - width) / 2);
        setMarkerOffsetY((size[1] - height) / 2);
    }, [size, shown, childrenRef]);
    return {
        markerOffsetX,
        markerOffsetY,
    };
};
//# sourceMappingURL=useOnboardingTooltipMarkerOffset.js.map