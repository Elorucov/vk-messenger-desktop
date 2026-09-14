import { jsx as _jsx } from "react/jsx-runtime";
import { Separator, Spacing } from '../Adopted';
export const SeparatorSpacing = ({ wide, direction, appearance, ...restProps }) => {
    return (_jsx(Spacing, { ...restProps, children: _jsx(Separator, { wide: wide, direction: direction, appearance: appearance }) }));
};
//# sourceMappingURL=SeparatorSpacing.js.map