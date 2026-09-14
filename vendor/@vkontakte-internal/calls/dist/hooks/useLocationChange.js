import { useEffect } from 'react';
export const useLocationChange = (onLocationChange) => {
    useEffect(() => {
        const removeLocationChangeListener = window?.nav?.onLocationChange?.(() => {
            onLocationChange();
            removeLocationChangeListener?.();
        });
        return onLocationChange;
    }, []);
};
//# sourceMappingURL=useLocationChange.js.map