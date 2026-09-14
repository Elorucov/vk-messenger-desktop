import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLang } from '../../hooks/useLang';
import { Icon16CopyOutline } from '@vkontakte/icons';
import { Div, Subhead } from '@vkontakte-internal/vkcom-kit';
export const JoinLink = ({ link, onCopyLink, title, description }) => {
    const { getLang } = useLang();
    return (_jsxs("div", { children: [_jsx("span", { className: "CallsModalEventPlanned__joinLinkTitle", children: `${title}:` }), description && _jsx(Subhead, { children: description }), _jsx(Div, { mode: "vertical", spacing: 0, paddingBottom: 0, paddingTop: 4, children: link }), _jsxs("div", { className: "CallsModalEventPlanned__copyLink", onClick: onCopyLink, children: [_jsx(Icon16CopyOutline, { className: "CallsModalEventPlanned__copyLink__icon" }), _jsx("span", { children: getLang('calls_copy_link') })] })] }));
};
//# sourceMappingURL=JoinLink.js.map