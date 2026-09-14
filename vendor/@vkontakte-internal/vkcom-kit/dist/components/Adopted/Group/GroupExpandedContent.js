import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-css-module, css-modules/no-unused-class
import styles from './Group.module.css';
const directionModifiersMap = {
    vertical: styles.verticalContentExpanded,
    horizontal: styles.horizontalContentExpanded,
};
export const GroupExpandedContent = ({ className, children, direction = 'horizontal', }) => {
    return (_jsx("div", { className: classNames(directionModifiersMap[direction], 'vkuiInternalGroupExpandedContent', className), children: children }));
};
//# sourceMappingURL=GroupExpandedContent.js.map