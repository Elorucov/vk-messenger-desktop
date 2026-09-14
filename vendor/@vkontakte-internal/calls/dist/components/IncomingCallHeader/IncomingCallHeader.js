import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"header":["global",{"className":1}],"h1":["global",{"className":1}],"div":["global",{"className":1}]} */
import { classNames as cx } from '@vkontakte/vkjs';
export function IncomingCallHeader({ title, description, className }) {
    return (_jsxs("header", { className: cx('IncomingCallHeader', className), children: [_jsx("h1", { "data-testid": "calls_incoming_call_title", className: "IncomingCallHeader__title", children: title }), _jsx("div", { "data-testid": "calls_incoming_call_desc", className: "IncomingCallHeader__description", children: description })] }));
}
//# sourceMappingURL=IncomingCallHeader.js.map