import { jsx as _jsx } from "react/jsx-runtime";
import { DIProvider } from '@vkontakte-internal/di';
import { useEffect } from 'react';
export const CallsDIProvider = ({ children, disposeOnUnmount = true, instance, }) => {
    useEffect(() => () => {
        disposeOnUnmount && instance.destroy();
    }, []);
    return _jsx(DIProvider, { instance: instance, children: children });
};
//# sourceMappingURL=CallsDIProvider.js.map