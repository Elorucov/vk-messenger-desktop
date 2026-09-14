import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIRadio":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Radio as VKUIRadio } from '@vkontakte/vkui';
import styles from './Radio.module.css';
const noHorizontalPaddingLabelProps = {
    hoverMode: 'opacity',
    activeMode: 'opacity',
};
export const Radio = ({ className, labelProps, noHorizontalPadding, ...restProps }) => {
    // TODO (VKCOMKIT-1317): hoverMode & activeMode пропы должны быть из коробки https://github.com/VKCOM/VKUI/issues/6735
    const radioLabelProps = noHorizontalPadding
        ? labelProps
            ? { ...noHorizontalPaddingLabelProps, ...labelProps }
            : noHorizontalPaddingLabelProps
        : labelProps;
    return (_jsx(VKUIRadio, { className: classNames(!restProps.children && styles.rootHasNoChildren, noHorizontalPadding && styles.rootNoHorizontalPadding, className), labelProps: radioLabelProps, ...restProps }));
};
//# sourceMappingURL=Radio.js.map