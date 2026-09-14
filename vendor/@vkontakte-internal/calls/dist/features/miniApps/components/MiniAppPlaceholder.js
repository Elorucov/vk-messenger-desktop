import { jsx as _jsx } from "react/jsx-runtime";
import { Icon56LockOutline } from '@vkontakte/icons';
import { Placeholder } from '@vkontakte-internal/vkcom-kit';
export const MiniAppPlaceholder = ({ children, header }) => {
    return (_jsx(Placeholder, { icon: _jsx(Icon56LockOutline, {}), header: header, stretched: true, "data-testid": "calls_miniapp_ph", children: children }));
};
//# sourceMappingURL=MiniAppPlaceholder.js.map