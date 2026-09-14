import { jsx as _jsx } from "react/jsx-runtime";
import { calcInitialsAvatarColor, RichAvatar, UsersStack } from '@vkontakte-internal/vkcom-kit';
import { isStackItemWithImage } from './types';
const sizeMap = {
    s: 16,
    m: 24,
    l: 32,
};
/**
 * UsersStack in vkcom-kit can not show users without image
 */
export const CallUsersStack = (props) => {
    const { items, size } = props;
    return (_jsx(UsersStack, { photos: items.map((item) => isStackItemWithImage(item)
            ? { src: item.src }
            : {
                src: '',
                renderWrapper: () => (_jsx(RichAvatar, { gradientColor: calcInitialsAvatarColor(item.id), initials: item.text, size: size ? sizeMap[size] : sizeMap.m })),
            }), size: size }));
};
//# sourceMappingURL=CallUsersStack.js.map