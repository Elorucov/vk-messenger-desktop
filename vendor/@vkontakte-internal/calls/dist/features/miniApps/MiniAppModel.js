import { __decorate, __metadata } from "tslib";
import { startUrlSharing, stopUrlSharing } from '@vkontakte/calls-sdk';
import { Props, createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { handlePromiseError } from '../../helpers/logger';
import { LangUtils } from '../../services/Lang';
import { isMiniAppIntegrationError, MiniAppIntegrationService } from '../../services/MiniAppIntegration';
import { EMPTY_USER_ID, peerIdToVkId, ClickHouseEventType } from '@vkontakte-internal/calls-core';
import { buildCustomMiniAppStatEvent, createErrorHandler, getSuccessfulResponse, logFeatureDebug, } from './utils';
import { StateBridge } from '../../utils/stateBridge';
import { MiniAppId } from './constants';
import { WhiteBoardStatEventReason } from './whiteboard/constants';
import { updateSharedMiniAppUrl } from './actions';
import { addMiniAppsStatEvents } from '../../services/backend';
import { CallsConfigService } from '../../services/config';
let MiniAppModel = class MiniAppModel {
    constructor(_props, configService, langUtils, miniAppService, stateBridge) {
        this._props = _props;
        this.configService = configService;
        this.langUtils = langUtils;
        this.miniAppService = miniAppService;
        this.stateBridge = stateBridge;
        this._app = undefined;
        this._error = undefined;
        this._isLoading = false;
        this.handleStartSharing = async (params) => {
            const handlerName = 'VKWebAppCallStartSharing';
            logFeatureDebug(`MiniAppModel: handleStartSharing: call SDK method with url = ${params.deepLink}`);
            this.sendSharingStats(true);
            try {
                startUrlSharing(params.deepLink);
                this.stateBridge.dispatch(updateSharedMiniAppUrl(params.deepLink));
                return getSuccessfulResponse(handlerName);
            }
            catch (err) {
                return createErrorHandler(handlerName)(err);
            }
        };
        this.handleStopSharing = async () => {
            const handlerName = 'VKWebAppCallStopSharing';
            logFeatureDebug(`MiniAppModel: handleStopSharing: call SDK method`);
            this.sendSharingStats(false);
            try {
                stopUrlSharing();
                this.stateBridge.dispatch(updateSharedMiniAppUrl(undefined));
                return getSuccessfulResponse(handlerName);
            }
            catch (err) {
                return createErrorHandler(handlerName)(err);
            }
        };
        this.handleCustomEvent = async (params) => {
            const handlerName = 'VKWebAppSendCustomEvent';
            const errorHandler = createErrorHandler(handlerName);
            if (!this.app) {
                return errorHandler('No miniapp is call');
            }
            const userId = this.userId;
            if (userId === EMPTY_USER_ID) {
                return errorHandler('No authorized user');
            }
            const statEvent = buildCustomMiniAppStatEvent({
                bridgeParams: params,
                app: this.app,
                hash: this.hash,
                miniAppsStatPlatform: this.configService.getMiniAppsStatPlatform(),
                userId,
            });
            try {
                await addMiniAppsStatEvents({ events: JSON.stringify([statEvent]) });
                return getSuccessfulResponse(handlerName);
            }
            catch (err) {
                return errorHandler(err);
            }
        };
        this.getIsFeatureEnabled = this.miniAppService.getIsFeatureEnabled;
        this.sendMiniAppSdkStats = this.miniAppService.sendMiniAppSdkStats;
        this.handleServiceError = (err) => {
            handlePromiseError(err);
            if (isMiniAppIntegrationError(err)) {
                this.setError({
                    title: err.title,
                    message: err.message,
                });
            }
            else {
                this.setError({
                    title: this.langUtils.getLang('calls_miniapp_error_title'),
                    message: this.langUtils.getLang('calls_miniapp_error_message_default'),
                });
            }
        };
        makeAutoObservable(this);
        void this.init(this._props.current);
    }
    get props() {
        return this._props.current;
    }
    get apiUrl() {
        return this.miniAppService.getApiUrl();
    }
    get authUrl() {
        return this.miniAppService.getAuthUrl();
    }
    get app() {
        return this._app;
    }
    get hash() {
        return this.props.hash;
    }
    setApp(app) {
        if (app) {
            this.setError(undefined);
        }
        this._app = app;
    }
    get error() {
        return this._error;
    }
    setError(error) {
        if (error) {
            this.setApp(undefined);
        }
        this._error = error;
    }
    get isLoading() {
        return this._isLoading;
    }
    get sessionUuid() {
        return this.stateBridge.callData.callId;
    }
    setIsLoading(value) {
        this._isLoading = value;
    }
    get userId() {
        return peerIdToVkId(this.stateBridge.me);
    }
    setErrorForAnonym(appId) {
        const getLang = this.langUtils.getLang;
        this.setError({
            title: getLang('calls_miniapp_error_title'),
            message: appId === MiniAppId.WHITEBOARD
                ? getLang('calls_whiteboard_error_message_anonym')
                : getLang('calls_miniapp_error_message_anonym'),
        });
    }
    sendSharingStats(isStarted) {
        if (this.app?.id === MiniAppId.WHITEBOARD) {
            const eventType = isStarted
                ? ClickHouseEventType.WHITE_BOARD_VIEW_STARTED
                : ClickHouseEventType.WHITE_BOARD_VIEW_STOPPED;
            this.miniAppService.sendProductStatEvent(eventType, { reason: WhiteBoardStatEventReason.MINIAPP });
        }
    }
    async init({ appId, hash, isAnonym }) {
        if (isAnonym) {
            this.setErrorForAnonym(appId);
            return;
        }
        this.setIsLoading(true);
        try {
            const appWithUrl = await this.miniAppService.getApp(appId);
            logFeatureDebug('MiniAppModel: loadMiniApp response, set to model state', appWithUrl);
            logFeatureDebug('MiniAppModel: full url with hash', `${appWithUrl.webview_url}${hash ?? ''}`);
            this.setApp({
                id: appWithUrl.id,
                url: appWithUrl.webview_url,
            });
        }
        catch (err) {
            this.handleServiceError(err);
        }
        finally {
            this.setIsLoading(false);
        }
    }
};
MiniAppModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        CallsConfigService,
        LangUtils,
        MiniAppIntegrationService,
        StateBridge])
], MiniAppModel);
export const { Provider: MiniAppModelProvider, useModel: useMiniAppModel } = createProvider(MiniAppModel, {
    isolatedContext: false,
    onlyTransient: true,
});
//# sourceMappingURL=MiniAppModel.js.map