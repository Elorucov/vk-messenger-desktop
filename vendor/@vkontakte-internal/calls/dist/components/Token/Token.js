import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}],"span":["global",{"className":1}],"Icon16Cancel":["@vkontakte/icons",{"className":1}]} */
import { Icon16Cancel } from '@vkontakte/icons';
export const Token = ({ id, text, value, onDelete }) => {
    const handleDelete = () => {
        onDelete?.(id, value);
    };
    return (_jsxs("div", { className: "CallsToken", children: [_jsx("span", { className: "CallsToken__text", children: text }), _jsx(Icon16Cancel, { className: "CallsToken__cross", onClick: handleDelete })] }));
};
//# sourceMappingURL=Token.js.map