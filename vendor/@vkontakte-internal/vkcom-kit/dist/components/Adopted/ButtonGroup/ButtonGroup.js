import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIButtonGroup":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { ButtonGroup as VKUIButtonGroup, } from '@vkontakte/vkui';
import { Children, Fragment } from 'react';
import { Separator } from '../Separator/Separator';
import styles from './ButtonGroup.module.css';
export const ButtonGroup = ({ segmented, separator, className, children, ...restProps }) => {
    if (separator) {
        children = Children.toArray(children).map((child, index, array) => {
            const isLastElement = index === array.length - 1;
            return (_jsxs(Fragment, { children: [child, !isLastElement && _jsx(Separator, { className: styles.separator, direction: "vertical" })] }, index));
        });
    }
    return (_jsx(VKUIButtonGroup, { className: classNames(segmented && styles.rootSegmented, className), ...restProps, gap: segmented ? 'space' : restProps.gap, children: children }));
};
//# sourceMappingURL=ButtonGroup.js.map