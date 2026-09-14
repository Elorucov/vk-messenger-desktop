import { jsx as _jsx } from "react/jsx-runtime";
import { EllipsisText as VKUIEllipsisText, } from '@vkontakte/vkui';
export const EllipsisText = ({ title, ...restProps }) => {
    return _jsx(VKUIEllipsisText, { disableNativeTitle: !!title, ...restProps });
};
//# sourceMappingURL=EllipsisText.js.map