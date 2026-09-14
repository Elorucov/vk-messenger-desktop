import { jsx as _jsx } from "react/jsx-runtime";
import { DropdownActionSheet } from '@vkontakte-internal/vkcom-kit';
export function DropdownMenu({ content, dataTestId, children, }) {
    return (_jsx(DropdownActionSheet, { "data-testid": dataTestId, trigger: "hover", width: 250, placement: "bottom-end", content: content, restoreFocus: false, children: children }));
}
//# sourceMappingURL=DropdownMenu.js.map