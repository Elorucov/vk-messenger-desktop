import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Input":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Input } from '../../Adopted';
import styles from './InputStub.module.css';
const modeModifiersMap = {
    primary: undefined,
    secondary: styles.rootSecondary,
};
const cursorModifiersMap = {
    default: undefined,
    pointer: styles.rootPointer,
};
export const InputStub = ({ mode = 'primary', cursor = 'default', children, className, ...restProps }) => {
    const focusHandler = ({ currentTarget }) => {
        currentTarget.blur();
    };
    return (_jsx(Input, { ...restProps, className: classNames(styles.root, modeModifiersMap[mode], cursorModifiersMap[cursor], className), value: children, onFocus: focusHandler, readOnly: true }));
};
//# sourceMappingURL=InputStub.js.map