import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { getColorClass } from '@vkontakte-internal/vkcom-kit';
export const RoomStatusTimer = ({ timeLeft, warning, divider }) => {
    return (_jsxs(_Fragment, { children: [divider && _jsx("span", { children: "\u00A0\u00B7\u00A0" }), _jsx("span", { className: warning ? getColorClass('color_text_negative') : undefined, children: timeLeft })] }));
};
//# sourceMappingURL=RoomStatusTimer.js.map