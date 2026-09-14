import { jsx as _jsx } from "react/jsx-runtime";
import { DropdownActionSheetEmptyIcon } from './DropdownActionSheetEmptyIcon';
import { DropdownActionSheetItem } from './DropdownActionSheetItem';
export const DropdownActionSubSheetItem = ({ before, children, ...restProps }) => {
    return (_jsx(DropdownActionSheetItem, { before: before ?? _jsx(DropdownActionSheetEmptyIcon, {}), ...restProps, children: children }));
};
//# sourceMappingURL=DropdownActionSubSheetItem.js.map