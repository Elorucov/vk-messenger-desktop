import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { RichAvatar, calcInitialsAvatarColor } from '@vkontakte-internal/vkcom-kit';
import { isStackItemWithImage } from './types';
import styles from './CallUsersStack.module.css';
/**
 * UsersStack in vkcom-kit can not show users without image
 */
export const CallUsersStack = (props) => {
    const { items, size } = props;
    return (_jsx("div", { className: styles.container, children: items.map((item, i) => {
            return (_jsx("div", { className: styles.item, children: isStackItemWithImage(item) ? (
                // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                _jsx(RichAvatar, { src: item.src, size: size })) : (_jsx(RichAvatar, { gradientColor: calcInitialsAvatarColor(item.id), initials: item.text, size: size })) }, item.key ?? i));
        }) }));
};
//# sourceMappingURL=CallUsersStack.js.map