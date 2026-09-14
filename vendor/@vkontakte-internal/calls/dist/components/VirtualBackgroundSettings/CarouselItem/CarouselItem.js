import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { memo } from 'react';
const CarouselItemElement = ({ onClick, effect, content }) => {
    const cb = () => onClick?.(effect);
    return (_jsx("div", { className: "VirtualBackgroundSettingsCarousel__Item", onClick: cb, children: content }));
};
export const CarouselItem = memo(CarouselItemElement);
//# sourceMappingURL=CarouselItem.js.map