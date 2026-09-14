import { jsx as _jsx } from "react/jsx-runtime";
import { Tooltip as VKUITooltip } from '@vkontakte/vkui';
export const Tooltip = ({ text, header, title, description, ...restProps }) => {
    return _jsx(VKUITooltip, { title: header || title, description: text || description, ...restProps });
};
//# sourceMappingURL=Tooltip.js.map