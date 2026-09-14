import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIUsersStack":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
// eslint-disable-next-line no-restricted-imports
import { UsersStack as VKUIUsersStack } from '@vkontakte/vkui';
import styles from './UsersStack.module.css';
const directionMap = {
    'row': 'inline-start',
    'row-reverse': 'inline-end',
    'column': 'block-start',
};
const modeModifiersMap = {
    overlay: styles.rootOverlay,
    default: undefined,
};
const photosVerticalAlignMap = {
    top: styles.rootPhotosVerticalAlignTop,
    center: styles.rootPhotosVerticalAlignCenter,
    bottom: styles.rootPhotosVerticalAlignBottom,
};
export const UsersStack = ({ size = 'm', mode = 'default', photosVerticalAlign = 'center', className, direction, avatarsPosition, ...restProps }) => {
    return (_jsx(VKUIUsersStack, { avatarsPosition: (direction && directionMap[direction]) || avatarsPosition, className: classNames(styles.root, modeModifiersMap[mode], photosVerticalAlignMap[photosVerticalAlign], className), size: size, ...restProps }));
};
//# sourceMappingURL=UsersStack.js.map