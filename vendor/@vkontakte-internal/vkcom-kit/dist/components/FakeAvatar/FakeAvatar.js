import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './FakeAvatar.module.css';
/**
 * Помогает позиционировать элементы внутри других VKUI компонентов как Avatar.
 */
export const FakeAvatar = ({ className, ...restProps }) => {
    return _jsx("div", { className: classNames(styles.root, 'vkuiImageBase', className), ...restProps });
};
//# sourceMappingURL=FakeAvatar.js.map