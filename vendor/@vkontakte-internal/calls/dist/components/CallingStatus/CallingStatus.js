import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}],"span":["global",{"className":3}]} */
import { classNames as cx } from '@vkontakte/vkjs';
export default function CallingStatus({ isInverted }) {
    const classes = cx('CallingStatus', {
        'CallingStatus--inverted': !!isInverted,
    });
    const classesForParts = cx('CallingStatus__part', 'CallingStatus__part--withAnimation');
    return (_jsxs("div", { className: classes, children: [_jsx("span", { className: classesForParts }), _jsx("span", { className: classesForParts }), _jsx("span", { className: classesForParts })] }));
}
//# sourceMappingURL=CallingStatus.js.map