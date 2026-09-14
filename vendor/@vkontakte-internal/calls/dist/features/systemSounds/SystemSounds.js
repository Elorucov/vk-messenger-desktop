import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { createProvider, createWidget } from '@vkontakte-internal/di';
import { SystemSoundsViewModel } from './SystemSoundsViewModel';
export const { Provider: SystemSoundsViewModelProvider } = createProvider(SystemSoundsViewModel, {
    isolatedContext: false,
    onlyTransient: false,
});
export const SystemSounds = createWidget(SystemSoundsViewModelProvider, () => _jsx(_Fragment, {}));
//# sourceMappingURL=SystemSounds.js.map