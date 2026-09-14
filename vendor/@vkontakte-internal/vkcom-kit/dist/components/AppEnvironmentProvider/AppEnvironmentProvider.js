import { jsx as _jsx } from "react/jsx-runtime";
import { AppEnvironmentContext } from './AppEnvironmentContext';
import { useAppEnvironmentContext } from './useAppEnvironmentContext';
export function AppEnvironmentProvider({ children, appEnvironment }) {
    const context = useAppEnvironmentContext();
    return (_jsx(AppEnvironmentContext.Provider, { value: appEnvironment ?? context, children: children }));
}
//# sourceMappingURL=AppEnvironmentProvider.js.map