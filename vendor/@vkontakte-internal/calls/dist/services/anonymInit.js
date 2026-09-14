import { __decorate, __metadata } from "tslib";
import { CallsAppId, vkIdToPeerId, } from '@vkontakte-internal/calls-core';
import { getAnonymCallToken, getSettings, messagesGetCallPreview, prepareCallsSettings, } from './backend';
import { useCallback, useState } from 'react';
import { browser } from '../helpers/browser';
import { login } from '@vkontakte-internal/api-client';
import { scope } from '@vkontakte-internal/di';
import { CallsApi } from '@vkontakte-internal/plugins';
/**
 * Запрашивает данные для инициализации бриджа как аноним
 */
export async function getAnonymInitBridgeData(vkJoinLink, name, tokenData = {}) {
    const overrideApiConfig = {};
    if (tokenData.access_token) {
        overrideApiConfig.accessToken = tokenData.access_token;
    }
    const { secret = '', user_id: userId = 0, preview, is_edu, } = await messagesGetCallPreview(vkJoinLink, overrideApiConfig);
    const { secret: anonymSecret = '', token, api_base_url: apiBaseUrl = null, } = await getAnonymCallToken(vkJoinLink, userId, name, secret, overrideApiConfig);
    const preparedCallsSettings = await getSettings();
    const callsCredentials = {
        is_dev: preparedCallsSettings.settings.is_dev,
        key: preparedCallsSettings.settings.public_key,
        ip_setting_enabled: false,
        privacySettings: { callsIp: 'all' },
        token: token,
        secret: anonymSecret,
        me: {
            firstName: name,
            id: userId,
            lastName: '',
            link: '',
            name,
            peerId: vkIdToPeerId(userId),
            photo: '',
            photo_100: '',
            sex: 0,
            shortName: name,
        },
    };
    const callPreview = {
        tab: preview?.title,
        photo: preview?.photo?.photo_200 ?? '',
    };
    const initArgs = {
        callPreview,
        callsCredentials,
        apiBaseUrl,
        isSferum: !!is_edu,
        preparedSettings: preparedCallsSettings,
        enableVmoji: true,
    };
    return initArgs;
}
/**
 * Инициализирует звонки для анонимного пользователя, используя данные от getAnonymCallToken
 * При повторном вызове не пытается инициализировать повторно
 */
export async function initCallsIfNeed({ bridge, data }) {
    if (bridge.initialized) {
        return bridge.initializing;
    }
    const { callPreview, callsCredentials, preparedSettings, isSferum, apiToken, apiBaseUrl } = data;
    const { toggles, settings } = preparedSettings;
    await bridge?.init({
        callPreview,
        callsCredentials,
        apiBaseUrl,
        anonymousApiToken: apiToken,
        toggles: {
            ...toggles,
            enableSimplePiPVk: browser.safari ? toggles.enableSimplePiPSafariVk : toggles.enableSimplePiPVk,
            enableSimplePiPSferum: browser.safari
                ? toggles.enableSimplePiPSafariSferum
                : toggles.enableSimplePiPSferum,
            videoSlotsCount: settings.video_slots_count,
            browserWarnings: settings.browser_warnings,
            customScreenSharePacketSize: settings.custom_screen_share_packet_size,
            customScreenShareCongestionControlThreshold: settings.custom_screen_share_congestion_control_threshold,
            customExternalDomain: settings.custom_external_domain,
            noiseReductionMode: settings.noise_reduction_mode,
            enableVmoji: true,
            deviceId: settings.device_id,
            enableSkipJoinScreenFeature: false,
            skipJoinScreen: settings.skip_join_screen,
            sferum: isSferum,
            temporaryVirtualBackgrounds: settings.temporary_virtual_backgrounds,
        },
    });
}
export function useAnonymousBridgeInit(bridgeInitializer) {
    const [isInitialized, setIsInitialized] = useState(false);
    const startInit = useCallback(async (vkJoinLink, name) => {
        await bridgeInitializer(vkJoinLink, name);
        setIsInitialized(true);
    }, [bridgeInitializer]);
    return {
        isInitialized,
        startInit,
    };
}
let AnonymousCallsJWTService = class AnonymousCallsJWTService {
    constructor(callsApi) {
        this.callsApi = callsApi;
        this.authData = {
            token: '',
            userId: 0,
        };
    }
    async authorize() {
        const anonymPayload = await this.callsApi.getAnonymousAccessTokenPayload({});
        const anonymToken = await login('get_anonym_token', {
            client_id: CallsAppId.WEB,
            token_type: 'messages',
            payload: anonymPayload.payload,
            client_secret: 'QbYic1K3lEV5kTGiqlq2',
            version: '5.226',
        }, { disableSaveToken: true, domain: window.vk?.apiConfigDomains.loginDomain ?? 'login.vk.com' });
        return {
            userId: anonymPayload.user_id,
            token: anonymToken.access_token,
        };
    }
    async getAuthData() {
        if (this.authData.token) {
            return this.authData;
        }
        if (this.loading) {
            return this.loading;
        }
        this.loading = this.authorize();
        this.authData = await this.loading;
        this.loading = undefined;
        return this.authData;
    }
};
AnonymousCallsJWTService = __decorate([
    scope.global(),
    __metadata("design:paramtypes", [CallsApi])
], AnonymousCallsJWTService);
export { AnonymousCallsJWTService };
export class AnonymousBridgeService {
    constructor(bridge, callsApi, callSettings, authData, callPreview) {
        this.bridge = bridge;
        this.callsApi = callsApi;
        this.callSettings = callSettings;
        this.authData = authData;
        this.callPreview = callPreview;
    }
    async createBridge(link, name) {
        const bridge = this.bridge();
        if (bridge?.initialized) {
            return bridge.initializing;
        }
        const okToken = await this.callsApi.getAnonymousToken({ vk_join_link: link, name: name }, { accessToken: this.authData.token });
        const preparedCallsSettings = prepareCallsSettings(this.callSettings);
        const { settings } = preparedCallsSettings;
        const dataForInit = {
            callPreview: {
                tab: this.callPreview.title,
                photo: this.callPreview.photo400,
            },
            callsCredentials: {
                is_dev: settings.is_dev,
                key: settings.public_key,
                ip_setting_enabled: true,
                privacySettings: { callsIp: 'all' },
                token: okToken.token,
                secret: '',
                is_anonym: true,
                me: {
                    firstName: name,
                    id: this.authData.userId,
                    lastName: '',
                    link: '',
                    name,
                    peerId: vkIdToPeerId(this.authData.userId),
                    photo: '',
                    photo_100: '',
                    sex: 0,
                    shortName: name,
                },
            },
            isSferum: this.callPreview.isSferum,
            preparedSettings: preparedCallsSettings,
            apiToken: this.authData.token,
            apiBaseUrl: okToken.api_base_url,
        };
        if (!bridge) {
            throw new Error('Unable to initialize Bridge');
        }
        return initCallsIfNeed({ bridge: bridge, data: dataForInit });
    }
}
//# sourceMappingURL=anonymInit.js.map