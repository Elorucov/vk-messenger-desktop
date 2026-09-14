import { jsx as _jsx } from "react/jsx-runtime";
import { StickersKeyboardSelectContext, } from '../../hooks/stickersKeyboard';
export function StickersKeyboardSelectProvider({ selectPack, ...props }) {
    return (_jsx(StickersKeyboardSelectContext.Provider, { value: {
            selectPack,
        }, ...props }));
}
//# sourceMappingURL=StickersKeyboardSelectProvider.js.map