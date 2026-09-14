import { jsx as _jsx } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { MiniAppModelProvider, useMiniAppModel } from './MiniAppModel';
import { EmbeddedMiniApp, MiniAppPlaceholder } from './components';
import { logFeatureDebug } from './utils';
const MiniAppView = observer(function MiniAppWidget() {
    const model = useMiniAppModel();
    if (model.app) {
        return (_jsx(EmbeddedMiniApp, { apiUrl: model.apiUrl, authUrl: model.authUrl, app: model.app, getIsFeatureEnabled: model.getIsFeatureEnabled, hash: model.hash, handlers: {
                VKWebAppInit: (params) => {
                    logFeatureDebug(`VKWebAppInit: handler params`, params);
                },
                VKWebAppCallStartSharing: model.handleStartSharing,
                VKWebAppCallStopSharing: model.handleStopSharing,
                VKWebAppSendCustomEvent: model.handleCustomEvent,
            }, sendMiniAppSdkStats: model.sendMiniAppSdkStats, sessionUuid: model.sessionUuid }));
    }
    else if (model.error) {
        return _jsx(MiniAppPlaceholder, { header: model.error.title, children: model.error.message });
    }
    return null;
});
export const MiniAppWidget = createWidget(MiniAppModelProvider, MiniAppView);
//# sourceMappingURL=MiniAppWidget.js.map