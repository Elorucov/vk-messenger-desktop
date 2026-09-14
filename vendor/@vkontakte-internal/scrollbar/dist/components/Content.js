import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, memo } from 'react';
export const Content = memo(forwardRef(({ children, ...props }, ref) => {
    return (_jsx("div", { ref: ref, ...props, children: children }));
}));
Content.displayName = 'Content';
