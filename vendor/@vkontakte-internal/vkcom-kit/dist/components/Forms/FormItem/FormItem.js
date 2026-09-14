import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIFormItem":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
// eslint-disable-next-line no-restricted-imports
import { FormItem as VKUIFormItem } from '@vkontakte/vkui';
import { useFormLayoutContext } from '../FormLayout/FormLayoutContext';
import { FormItemLabeledContent } from './FormItemLabeledContent/FormItemLabeledContent';
import styles from './FormItem.module.css';
const modeModifiersMap = {
    horizontal: styles.rootHorizontal,
    vertical: undefined,
};
const topAlignModifiersMap = {
    left: undefined,
    right: styles.rootTopRight,
};
const topWidthModifiersMap = {
    s: styles.rootTopWidthS,
    m: styles.rootTopWidthM,
    l: styles.rootTopWidthL,
};
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-invalid-component-props-name
export const FormItemComponent = ({ mode: externalMode, topWidth: externalTopWidth, topAlign: externalTopAlign, className, children, topNode, top: topProp, topComponent, topId, htmlFor, ...restProps }) => {
    const { topMultiline } = restProps;
    const context = useFormLayoutContext();
    const mode = externalMode ?? context.mode ?? 'vertical';
    const topWidth = externalTopWidth ?? context.topWidth ?? 'm';
    const topAlign = externalTopAlign ?? context.topAlign ?? 'left';
    let content = children;
    if (mode === 'horizontal') {
        content = _jsx("div", { className: styles.in, children: content });
    }
    let top = topNode;
    if (topProp) {
        // Раньше `top` всегда оборачивал в <FormItem.Top> + <FormItem.TopLabel>.
        // Нужно перенести эту обёртку в код, там где `top !== string`.
        //
        // см. https://github.com/VKCOM/VKUI/pull/7837
        top = (_jsx(VKUIFormItem.Top, { children: _jsx(VKUIFormItem.TopLabel, { id: topId, htmlFor: htmlFor, Component: topComponent, children: topProp }) }));
    }
    return (_jsx(VKUIFormItem, { top: top, className: classNames(className, modeModifiersMap[mode], topMultiline && styles.rootMultiline, mode === 'horizontal' && classNames(topAlignModifiersMap[topAlign], topWidthModifiersMap[topWidth])), ...restProps, children: content }));
};
export const FormItem = Object.assign(FormItemComponent, {
    ...VKUIFormItem,
    LabeledContent: FormItemLabeledContent,
});
//# sourceMappingURL=FormItem.js.map