import { useCallback, useState } from 'react';
export const usePhotoRotator = () => {
    const [degrees, setDegrees] = useState(0);
    const rotateLeft = useCallback(() => {
        let newDegrees = degrees;
        if (degrees === 360) {
            newDegrees = 0;
        }
        newDegrees += 90;
        setDegrees(newDegrees);
        return newDegrees;
    }, [degrees]);
    const reset = useCallback(() => {
        setDegrees(0);
    }, []);
    return {
        degrees,
        rotateLeft,
        reset,
    };
};
//# sourceMappingURL=usePhotoRotator.js.map