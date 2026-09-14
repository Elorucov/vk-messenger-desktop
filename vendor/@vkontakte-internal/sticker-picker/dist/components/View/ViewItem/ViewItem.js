import { jsx as _jsx } from "react/jsx-runtime";
export function ViewItem({ getRef, mounted, ...props }) {
    if (mounted === false) {
        return null;
    }
    return _jsx("div", { ref: getRef, ...props });
}
//# sourceMappingURL=ViewItem.js.map