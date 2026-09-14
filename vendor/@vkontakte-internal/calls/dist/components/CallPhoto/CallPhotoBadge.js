import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Icon16StarCircleFillBlue, Icon16StarCircleFillGray } from '@vkontakte/icons';
import { RichAvatar } from '@vkontakte-internal/vkcom-kit';
const renderIcon = (type) => {
    switch (type) {
        case 'creator':
            return _jsx(Icon16StarCircleFillBlue, {});
        case 'admin':
            return _jsx(Icon16StarCircleFillGray, {});
        default:
            return _jsx(_Fragment, {});
    }
};
export const CallPhotoBadge = ({ type }) => {
    return _jsx(RichAvatar.Badge, { "data-testid": "calls_user_badge", children: renderIcon(type) });
};
//# sourceMappingURL=CallPhotoBadge.js.map