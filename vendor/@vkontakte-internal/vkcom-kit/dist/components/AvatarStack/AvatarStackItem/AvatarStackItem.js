import { jsx as _jsx } from "react/jsx-runtime";
import { Avatar } from '../../Adopted';
import { useAvatarStackItemSizeContext } from '../AvatarStackContext';
export const AvatarStackItem = (props) => {
    const size = useAvatarStackItemSizeContext();
    return _jsx(Avatar, { size: size, ...props });
};
//# sourceMappingURL=AvatarStackItem.js.map