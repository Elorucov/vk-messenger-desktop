import { useCallback, useLayoutEffect, useState } from 'react';
import { tipPositionMap } from '../helpers';
export const useOnboardingTooltipPlacement = ({ tipPosition, }) => {
    const [tipPlacement, setTipPlacement] = useState(tipPositionMap[tipPosition]);
    useLayoutEffect(() => {
        setTipPlacement(tipPositionMap[tipPosition]);
    }, [tipPosition]);
    const onPlacementChange = useCallback((newPlacement) => {
        newPlacement && setTipPlacement(newPlacement);
    }, []);
    return {
        tipPlacement,
        onPlacementChange,
    };
};
//# sourceMappingURL=useOnboardingTooltipPlacement.js.map