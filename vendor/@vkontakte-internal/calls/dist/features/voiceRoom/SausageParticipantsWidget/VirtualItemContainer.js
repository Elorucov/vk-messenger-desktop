import { jsx as _jsx } from "react/jsx-runtime";
export const VirtualItemContainer = ({ className, children, isVirtualPosition = true, width, height, offsetX, offsetY, measureElement, dataIndex, }) => {
    const styles = isVirtualPosition
        ? {
            width,
            height,
            transform: `translateX(${offsetX}px) translateY(${offsetY}px)`,
        }
        : {};
    return (_jsx("div", { className: className, style: styles, ref: (el) => {
            measureElement?.(el);
        }, "data-index": dataIndex, children: children }));
};
//# sourceMappingURL=VirtualItemContainer.js.map