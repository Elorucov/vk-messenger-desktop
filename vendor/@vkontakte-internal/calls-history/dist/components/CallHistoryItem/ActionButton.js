import { jsx as _jsx } from "react/jsx-runtime";
import { IconButton, TextTooltip } from '@vkontakte-internal/vkcom-kit';
export function ActionButton({ description, label, 'data-testid': dataTestId, onClick, children, ...restProps }) {
    if (!description) {
        return (_jsx(IconButton, { "data-testid": dataTestId, label: label, onClick: onClick, ...restProps, children: children }));
    }
    return (_jsx(TextTooltip, { placement: "top", description: description, children: _jsx(IconButton, { "data-testid": dataTestId, label: label, onClick: onClick, ...restProps, children: children }) }));
}
//# sourceMappingURL=ActionButton.js.map