import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { Spacing } from '../Adopted';
import { Join } from '../Join/Join';
import styles from './SpacedList.module.css';
/**
 * Компонент для создания отступов между элементами в списке.
 */
export const SpacedList = ({ spacing = 2, children, mode = 'vertical', className, ...restProps }) => {
    return (_jsx("div", { className: classNames(className, mode === 'horizontal' && styles.horizontal), ...restProps, children: _jsx(Join, { separator: _jsx(Spacing, { size: spacing, mode: mode === 'horizontal' ? 'vertical' : 'horizontal' }), children: children }) }));
};
//# sourceMappingURL=SpacedList.js.map