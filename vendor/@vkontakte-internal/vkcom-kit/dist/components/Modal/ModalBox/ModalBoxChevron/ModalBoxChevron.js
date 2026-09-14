import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["Adopted",{"className":1,"style":1}]} */
import { Icon48ChevronLeftOutline, Icon48ChevronRightOutline } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { Tappable } from '../../../Adopted';
import styles from './ModalBoxChevron.module.css';
const placementModifiersMap = {
    left: styles.rootLeft,
    right: styles.rootRight,
};
export const ModalBoxChevron = ({ top, ariaLabel, placement, className, style, ...restProps }) => {
    return (_jsx(Tappable, { "aria-label": ariaLabel, className: classNames(styles.root, placementModifiersMap[placement], className), hoverMode: styles.rootHover, activeMode: styles.rootActive, style: {
            ...style,
            top: style?.top ?? top,
            margin: style?.margin ?? top !== undefined ? 'unset' : undefined,
        }, ...restProps, children: placement === 'left' ? _jsx(Icon48ChevronLeftOutline, {}) : _jsx(Icon48ChevronRightOutline, {}) }));
};
//# sourceMappingURL=ModalBoxChevron.js.map