import { jsx as _jsx } from "react/jsx-runtime";
import { MiniAppBase } from '@vk-ecosystem/mini-app';
import { useMemo } from 'react';
import { CallsAppId } from '@vkontakte-internal/calls-core';
import { useLang } from '../../../hooks/useLang';
import { createMiniAppBaseHandlers } from './utils';
import { Appearance } from '@vkontakte-internal/vkcom-kit';
const appDefaults = {
    hash: '',
    query: {},
    internal: true,
    title: '',
};
const handleGetHostToken = () => Promise.resolve('');
const iframeProps = {
    allow: 'geolocation; microphone; camera; autoplay; clipboard-read; clipboard-write',
};
export function EmbeddedMiniApp(props) {
    const { app, apiUrl, authUrl, getIsFeatureEnabled, hash, handlers, sendMiniAppSdkStats, sessionUuid } = props;
    const { getLang } = useLang();
    const enableCollectPerformance = getIsFeatureEnabled?.('mini_apps_collect_performance_from_sdk');
    const config = useMemo(() => ({
        // TODO CALL-CALL-23825 Некорректно определяется тема из-за бага vkui, пока приколотим светлую
        appearance: Appearance.LIGHT,
        performance: enableCollectPerformance && getIsFeatureEnabled?.('mini_apps_performance_v2')
            ? {
                isDirectLink: false,
                startTime: Date.now(),
            }
            : undefined,
    }), []);
    return (_jsx(MiniAppBase, { apiUrl: apiUrl, authUrl: authUrl, app: {
            ...appDefaults,
            ...app,
            hash: hash ?? '',
        }, config: config, featureEnabled: getIsFeatureEnabled, featureToggles: { enableCollectPerformance }, getLang: getLang, handlers: handlers && createMiniAppBaseHandlers(handlers), host: {
            id: CallsAppId.WEB,
            title: window.location.host,
        }, iframeProps: iframeProps, onGetHostToken: handleGetHostToken, sendStatEvent: sendMiniAppSdkStats, sessionUuid: sessionUuid }));
}
//# sourceMappingURL=EmbeddedMiniApp.js.map