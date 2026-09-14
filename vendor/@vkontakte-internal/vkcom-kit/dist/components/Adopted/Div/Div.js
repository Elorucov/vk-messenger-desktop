import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIDiv":["@vkontakte/vkui",{"style":1}]} */
import { Div as VKUIDiv } from '@vkontakte/vkui';
/**
 * Поднастройка над Div из VKUI для регулировки отступов.
 */
export const Div = ({ children, style = {}, mode = 'default', spacing = 0, paddingTop, paddingBottom, ...restProps }) => {
    const localStyle = {};
    switch (mode) {
        case 'horizontal':
            localStyle.paddingTop = spacing;
            localStyle.paddingBottom = spacing;
            break;
        case 'vertical':
            localStyle.paddingLeft = spacing;
            localStyle.paddingRight = spacing;
            break;
    }
    if (paddingTop !== undefined) {
        localStyle.paddingTop = paddingTop;
    }
    if (paddingBottom !== undefined) {
        localStyle.paddingBottom = paddingBottom;
    }
    return (_jsx(VKUIDiv, { ...restProps, style: { ...localStyle, ...style }, children: children }));
};
//# sourceMappingURL=Div.js.map