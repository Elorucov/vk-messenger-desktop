import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { Tooltip as VKUITooltip } from '../Tooltip/Tooltip';
import styles from './TextTooltip.module.css';
const alignTextModifiersMap = {
    left: undefined,
    center: styles.containerTextAlignCenter,
    right: styles.containerTextAlignRight,
};
export function TextTooltip({ text: legacyTextProp, description, minWidth, enableInteractive, appearance = 'black', className, style, textAlign = 'left', children, onClose, onShownChange, ...restProps }) {
    const text = legacyTextProp || description;
    if (text === undefined) {
        return children ?? null;
    }
    const handleOnShownChange = (shown, reason) => {
        if (onClose && reason === 'callback') {
            onClose();
        }
        onShownChange?.(shown, reason);
    };
    return (_jsx(VKUITooltip, { description: text, enableInteractive: !!onClose || enableInteractive, className: classNames(alignTextModifiersMap[textAlign], className), style: {
            ...style,
            minWidth: minWidth ?? style?.minWidth,
        }, appearance: appearance, "data-testid": "text_tooltip", closable: !!onClose, onShownChange: handleOnShownChange, ...restProps, children: children }));
}
//# sourceMappingURL=TextTooltip.js.map