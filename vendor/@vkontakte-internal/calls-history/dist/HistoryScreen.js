import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { CallsBridgeProvider, HistoryConfig, NavigationContext, VkmeContext, } from '@vkontakte-internal/calls-core';
import { AppRootProvider } from '@vkontakte-internal/vkcom-kit';
import { CallsHistoryConfigProvider } from './services/HistoryConfig';
import { HistoryScreenApp } from './widgets/HistoryScreenApp';
import { CallsDIProvider } from './services/CallsDIProvider';
import { CallsHistoryWidgetsProvider } from './services/CallsWidgetsProvider';
import { ensureCallsHistoryDIContainer, createDiContainer, } from './di';
import { setBridgeForLogger } from './helpers/logger';
export function HistoryScreen({ config, dependencies, messenger, widgets = {}, }) {
    const historyConfig = useMemo(() => new HistoryConfig(config), []);
    const diContainer = ensureCallsHistoryDIContainer(createDiContainer(), {
        ...dependencies,
        HistoryConfig: historyConfig,
        isVkMe: messenger.isMessengerEnv,
    });
    setBridgeForLogger(dependencies.Bridge);
    return (_jsx(AppRootProvider, { children: _jsx(CallsDIProvider, { instance: diContainer, disposeOnUnmount: false, children: _jsx(CallsBridgeProvider, { bridge: dependencies.Bridge, children: _jsx(CallsHistoryConfigProvider, { value: historyConfig, children: _jsx(VkmeContext.Provider, { value: {
                            isVkme: messenger.isMessengerEnv,
                            startedSection: messenger.startedSection,
                            onNavigateAway: messenger.onNavigate,
                        }, children: _jsx(NavigationContext.Provider, { value: {
                                navigateToConvo: dependencies.navigateToConvo,
                                navigateToProfile: dependencies.navigateToProfile,
                            }, children: _jsx(CallsHistoryWidgetsProvider, { value: widgets, children: _jsx(HistoryScreenApp, {}) }) }) }) }) }) }) }));
}
//# sourceMappingURL=HistoryScreen.js.map