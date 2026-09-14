import { jsx as _jsx } from "react/jsx-runtime";
import { CallsSdkContext } from '../lib/CallsSdkContext';
export function CallsSdkProvider({ SDK, children, }) {
    return _jsx(CallsSdkContext.Provider, { value: SDK, children: children });
}
//# sourceMappingURL=CallsSdkProvider.js.map