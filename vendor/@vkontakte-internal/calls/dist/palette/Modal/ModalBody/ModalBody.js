import { jsx as _jsx } from "react/jsx-runtime";
import { Scroll } from '../../../palette/Scroll/Scroll';
import { classNames as cn } from '@vkontakte/vkjs';
export const ModalBody = ({ children, hasScroll = true, className }) => {
    if (!hasScroll) {
        return _jsx("div", { className: cn('ModalBody', className), children: children });
    }
    return _jsx(Scroll, { className: cn('ModalBody', className), children: children });
};
//# sourceMappingURL=ModalBody.js.map