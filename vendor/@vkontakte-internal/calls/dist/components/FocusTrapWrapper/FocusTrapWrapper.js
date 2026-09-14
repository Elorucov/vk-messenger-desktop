import { jsx as _jsx } from "react/jsx-runtime";
import { FocusTrap } from '../FocusTrap/FocusTrap';
export function FocusTrapWrapper({ label, children, isAlertDialog }) {
    return (_jsx("div", { role: "dialog", "aria-label": label, "aria-modal": "true", tabIndex: -1, children: _jsx(FocusTrap, { hasFirstFocusableElement: true, autoFocus: true, isAlertDialog: isAlertDialog, children: children }) }));
}
//# sourceMappingURL=FocusTrapWrapper.js.map