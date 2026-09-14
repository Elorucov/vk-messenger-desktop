import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUISimpleCell":["@vkontakte/vkui",{"className":1,"style":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { SimpleCell as VKUISimpleCell } from '@vkontakte/vkui';
import styles from './SimpleCell.module.css';
export const SimpleCell = ({ expandable, subhead, overTitle, chevron, className, disableOpacity, maxHeight, minHeight, style, ...restProps }) => {
    return (_jsx(VKUISimpleCell, { overTitle: subhead || overTitle, chevron: expandable || chevron, className: classNames(disableOpacity && styles.rootDisableOpacity, className), style: {
            ...style,
            maxHeight: maxHeight ?? style?.maxHeight,
            minHeight: maxHeight || style?.maxHeight ? 'unset' : minHeight ?? style?.minHeight,
        }, ...restProps }));
};
//# sourceMappingURL=SimpleCell.js.map