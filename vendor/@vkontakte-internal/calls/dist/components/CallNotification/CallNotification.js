import { jsx as _jsx } from "react/jsx-runtime";
import { classNames as cx } from '@vkontakte/vkjs';
export const CallNotification = ({ children, className }) => {
    const classes = cx('CallNotification', className);
    return (_jsx("div", { className: classes, "data-testid": "calls_call_notification", "aria-live": "polite", "aria-atomic": "true", children: children }));
};
//# sourceMappingURL=CallNotification.js.map