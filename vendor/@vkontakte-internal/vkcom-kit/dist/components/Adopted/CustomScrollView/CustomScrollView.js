import { jsx as _jsx } from "react/jsx-runtime";
import { CustomScrollView as VKUICustomScrollView, } from '@vkontakte/vkui';
export const CustomScrollView = ({ windowResize, autoHideScrollbar, autoHideScrollbarDelay, boxRef, noOverscroll, overscrollBehavior, ...restProps }) => {
    return (_jsx(VKUICustomScrollView, { getRootRef: boxRef, overscrollBehavior: noOverscroll ? 'none' : overscrollBehavior, ...restProps }));
};
//# sourceMappingURL=CustomScrollView.js.map