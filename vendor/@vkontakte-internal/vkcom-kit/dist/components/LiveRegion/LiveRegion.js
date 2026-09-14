import { jsx as _jsx } from "react/jsx-runtime";
import { VisuallyHidden } from '../Adopted';
export const LiveRegion = (props) => {
    return _jsx(VisuallyHidden, { ...props, Component: "output", "aria-live": "assertive", "aria-atomic": true });
};
//# sourceMappingURL=LiveRegion.js.map