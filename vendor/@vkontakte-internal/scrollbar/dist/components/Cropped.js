import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, memo } from 'react';
export const Cropped = memo(forwardRef(({ children, style = {}, ...props }, ref) => {
    return (_jsx("div", { ref: ref, style: { ...styles, ...style }, ...props, "data-scrollbar": "cropped", children: children }));
}));
Cropped.displayName = 'Cropped';
const styles = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
};
