import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["Adopted",{"className":1,"style":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Tappable } from '../Adopted';
import { AvatarStackItemSizeContextProvider } from './AvatarStackContext';
import { AvatarStackItem } from './AvatarStackItem/AvatarStackItem';
import styles from './AvatarStack.module.css';
const directionModifiersMap = {
    top: styles.rootTop,
    bottom: styles.rootBottom,
};
const AVATAR_SCALE = 0.75;
const AvatarStackComponent = ({ size, stroke, direction, className, style: styleProp, children, ...restProps }) => {
    const avatarSize = Math.floor(size * AVATAR_SCALE);
    const style = {
        ...styleProp,
        '--vkui_internal--avatarstack_size': `${size}px`,
        '--vkui_internal--avatarstack_avatar_size': `${avatarSize}px`,
    };
    return (_jsx(AvatarStackItemSizeContextProvider, { value: avatarSize, children: _jsx(Tappable, { className: classNames(styles.root, stroke && styles.rootStroke, directionModifiersMap[direction], className), style: {
                ...style,
                width: style.width ?? size,
                height: style.height ?? size,
            }, hoverMode: "opacity", activeMode: "opacity", ...restProps, children: children }) }));
};
export const AvatarStack = Object.assign(AvatarStackComponent, {
    Item: AvatarStackItem,
});
//# sourceMappingURL=AvatarStack.js.map