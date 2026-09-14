import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIHorizontalCell":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { HorizontalCell as VKUIHorizontalCell, } from '@vkontakte/vkui';
import styles from './HorizontalCell.module.css';
export const HorizontalCell = ({ header, title, size, className, disableOpacity, textAlign, TitleComponent, ...restProps }) => {
    return (_jsx(VKUIHorizontalCell, { size: size === 'dynamic' ? 'auto' : size, title: header || title, className: classNames(className, styles.root, disableOpacity && styles.rootDisableOpacity), textAlign: textAlign, TitleComponent: TitleComponent, ...restProps }));
};
//# sourceMappingURL=HorizontalCell.js.map