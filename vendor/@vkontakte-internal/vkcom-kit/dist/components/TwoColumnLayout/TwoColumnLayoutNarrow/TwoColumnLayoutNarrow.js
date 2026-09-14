import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"SplitCol":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { SplitCol } from '../../Adopted';
import { useStickyPosition } from './hooks/useStickyPosition';
import styles from './TwoColumnLayoutNarrow.module.css';
export const TwoColumnLayoutNarrow = ({ offsetTop, children, className, ...restProps }) => {
    const contentRef = useStickyPosition(offsetTop);
    return (_jsx(SplitCol, { className: classNames(styles.root, 'vkuiInternalTwoColumnLayoutColumn', className), ...restProps, children: _jsx("div", { ref: contentRef, children: children }) }));
};
//# sourceMappingURL=TwoColumnLayoutNarrow.js.map