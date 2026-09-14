import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './ModalBody.module.css';
export const ModalBody = ({ className, children, insetLevel = 2, ...restProps }) => {
    return (_jsx("div", { ...restProps, className: classNames(styles.container, insetLevel === 1 && styles.containerLevel1, insetLevel === 2 && styles.containerLevel2, className), children: children }));
};
//# sourceMappingURL=ModalBody.js.map