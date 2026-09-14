import { useState, useEffect } from 'react';
export const useRefRect = (ref) => {
    const [rect, setRect] = useState([0, 0]);
    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setRect([rect.width, rect.height]);
        }
    }, []);
    return rect;
};
//# sourceMappingURL=useRefRect.js.map