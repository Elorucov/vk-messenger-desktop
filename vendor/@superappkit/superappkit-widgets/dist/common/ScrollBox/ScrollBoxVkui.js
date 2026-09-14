import * as React from 'react';
import { HorizontalScroll } from '@vkontakte/vkui';
export const ScrollBoxVkui = ({ children, className }) => {
    return (React.createElement("div", { className: ['SAKWidget__scrollBox', className].join(' ') },
        React.createElement(HorizontalScroll, { showArrows: true, getScrollToLeft: (i) => i - 120, getScrollToRight: (i) => i + 120 }, children)));
};
//# sourceMappingURL=ScrollBoxVkui.js.map