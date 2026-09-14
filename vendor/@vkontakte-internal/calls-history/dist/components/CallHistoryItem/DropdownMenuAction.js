import { jsx as _jsx } from "react/jsx-runtime";
import { DropdownActionSheet } from '@vkontakte-internal/vkcom-kit';
export const DropdownMenuAction = ({ icon, text, onClick, dataTestId, }) => (_jsx(DropdownActionSheet.Item, { "data-testid": dataTestId, onClick: onClick, before: icon, children: text }, text));
//# sourceMappingURL=DropdownMenuAction.js.map