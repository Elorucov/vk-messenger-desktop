import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUICell":["@vkontakte/vkui",{"className":1}]} */
import { classNames as cn } from '@vkontakte/vkjs';
import { Cell as VKUICell } from '@vkontakte/vkui';
import styles from './Cell.module.css';
const CellComponent = ({ expandable, subhead, chevron, overTitle, className, noIsolation, alignIconsStart, ...restProps }) => {
    return (_jsx(VKUICell, { chevron: expandable || chevron, overTitle: subhead || overTitle, className: cn(className, noIsolation && styles.noIsolation, alignIconsStart && styles.alignIconsStart), ...restProps }));
};
export const Cell = Object.assign(CellComponent, {
    Checkbox: VKUICell.Checkbox,
});
//# sourceMappingURL=Cell.js.map