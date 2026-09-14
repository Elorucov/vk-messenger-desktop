import { jsx as _jsx } from "react/jsx-runtime";
import { HorizontalScroll as VKUIHorizontalScroll, } from '@vkontakte/vkui';
const LegacySizeMap = {
    s: 's',
    m: 's',
    l: 'm',
};
export const HorizontalScroll = ({ arrowSize: arrowSizeProp, disableArrowSizeBackwardСompatible, inline, ...restProps }) => {
    let arrowSize;
    if (disableArrowSizeBackwardСompatible) {
        arrowSize = arrowSizeProp === 'l' ? 'm' : arrowSizeProp;
    }
    else if (arrowSizeProp) {
        arrowSize = LegacySizeMap[arrowSizeProp];
    }
    return _jsx(VKUIHorizontalScroll, { arrowSize: arrowSize, ...restProps });
};
//# sourceMappingURL=HorizontalScroll.js.map