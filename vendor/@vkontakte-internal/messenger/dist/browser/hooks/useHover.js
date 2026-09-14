import React, { useCallback } from 'react';
export const useHover = () => {
    const [isHovering, setIsHovering] = React.useState(false);
    const handleMouseEnter = useCallback(() => setIsHovering(true), []);
    const handleMouseLeave = useCallback(() => setIsHovering(false), []);
    const nodeRef = React.useRef();
    const refCallback = (node) => {
        if (nodeRef.current) {
            nodeRef.current.removeEventListener('mouseenter', handleMouseEnter);
            nodeRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
        nodeRef.current = node;
        if (nodeRef.current) {
            nodeRef.current.addEventListener('mouseenter', handleMouseEnter);
            nodeRef.current.addEventListener('mouseleave', handleMouseLeave);
        }
    };
    return [refCallback, isHovering];
};
//# sourceMappingURL=useHover.js.map