import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
export const CallsBridgeContext = createContext(null);
export function useCallsBridge() {
    const bridge = useContext(CallsBridgeContext);
    if (bridge === null) {
        throw Error('Calls bridge context has not been Provided!');
    }
    return bridge;
}
export function CallsBridgeProvider({ bridge, children, }) {
    return _jsx(CallsBridgeContext.Provider, { value: bridge, children: children });
}
//# sourceMappingURL=useCallsBridge.js.map