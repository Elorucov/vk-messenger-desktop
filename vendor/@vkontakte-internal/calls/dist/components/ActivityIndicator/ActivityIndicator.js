import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './ActivityIndicator.module.css';
export const ActivityIndicator = ({ children, className, ...restProps }) => (_jsx("span", { ...restProps, className: classNames(styles.activityIndicator, className), children: children }));
//# sourceMappingURL=ActivityIndicator.js.map