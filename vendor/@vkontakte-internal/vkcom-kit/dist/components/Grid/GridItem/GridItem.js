import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useGridContext } from '../GridContext';
import styles from './GridItem.module.css';
export const GridItem = ({ centered, className, ...restProps }) => {
    const { hasColumns, hasHorizontalScroll, hasSeparator } = useGridContext();
    return (_jsx("div", { "data-testid": "grid-item", className: classNames(styles.root, centered && styles.rootCentered, hasHorizontalScroll && styles.rootHasHorizontalScroll, !hasColumns && styles.rootMultiline, hasSeparator && styles.rootHasSeparator, className), ...restProps }));
};
//# sourceMappingURL=GridItem.js.map