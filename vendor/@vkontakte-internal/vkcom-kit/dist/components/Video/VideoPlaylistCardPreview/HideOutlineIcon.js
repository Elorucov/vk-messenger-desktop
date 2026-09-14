import { jsx as _jsx } from "react/jsx-runtime";
import { Icon24HideOutline, Icon28HideOutline } from '@vkontakte/icons';
export const HideOutlineIcon = ({ direction }) => {
    switch (direction) {
        case 'horizontal':
            return _jsx(Icon24HideOutline, {});
        case 'vertical':
            return _jsx(Icon28HideOutline, {});
        default:
            return null;
    }
};
//# sourceMappingURL=HideOutlineIcon.js.map