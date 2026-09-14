import { jsx as _jsx } from "react/jsx-runtime";
import { Flex as VKUIFlex } from '@vkontakte/vkui';
/**
 * Изменился порядок в `gap` с `[column, row]` на `[row, column]` https://vkcom.github.io/VKUI/7.1.0/#/Migrations
 */
// TODO [@vkontakte/vkui@>=7.3.7]: Удалить gap = [0,0] из пропов и из условия ниже https://github.com/VKCOM/VKUI/pull/8618
const FlexComponent = ({ gap = [0, 0], ...restProps }) => {
    return _jsx(VKUIFlex, { gap: Array.isArray(gap) ? [gap[1], gap[0]] : gap === 0 ? [0, 0] : gap, ...restProps });
};
export const Flex = Object.assign(FlexComponent, {
    Item: VKUIFlex.Item,
});
//# sourceMappingURL=Flex.js.map