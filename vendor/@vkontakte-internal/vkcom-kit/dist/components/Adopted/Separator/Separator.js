import { jsx as _jsx } from "react/jsx-runtime";
import { Separator as VKUISeparator } from '@vkontakte/vkui';
export const Separator = ({ direction, wide, mode, padding: paddingProp, appearance, ...restProps }) => {
    const padding = wide === undefined ? (paddingProp === undefined ? direction !== 'vertical' : paddingProp) : !wide;
    return (_jsx(VKUISeparator, { appearance: mode || appearance, padding: padding, direction: direction, ...restProps }));
};
//# sourceMappingURL=Separator.js.map