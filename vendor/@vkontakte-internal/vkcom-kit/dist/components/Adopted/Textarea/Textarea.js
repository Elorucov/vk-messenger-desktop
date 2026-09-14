import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"TextareaNative":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Textarea as TextareaNative } from '@vkontakte/vkui';
import styles from './Textarea.module.css';
const modeModifiersMap = {
    default: undefined,
    plain: undefined,
    overlay: styles.rootOverlay,
};
export const Textarea = ({ mode = 'default', className, ...restProps }) => {
    return (_jsx(TextareaNative, { className: classNames(modeModifiersMap[mode], className), mode: mode === 'overlay' ? undefined : mode, ...restProps }));
};
//# sourceMappingURL=Textarea.js.map