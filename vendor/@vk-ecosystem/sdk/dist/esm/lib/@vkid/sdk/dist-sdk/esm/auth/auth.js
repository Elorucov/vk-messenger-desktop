import { AuthDataService } from './authDataService.js';
import { ConfigResponseMode, ConfigAuthMode } from '../core/config/types.js';
import { setExtIdCookie } from '../utils/cookie.js';
import { isDomainAllowed } from '../utils/domain.js';
import { deleteUnnecessaryFields } from '../utils/fields.js';
import { getRedirectWithPayloadUrl, getVKIDUrl } from '../utils/url/url.js';
import { uuid } from '../utils/uuid.js';
import { AUTH_VK_CONNECT_RESPONSE, AUTH_RESPONSE_TOKEN } from './constants.js';

let Auth$1 = class Auth {
    /**
   * @ignore
   */ static __config;
    uuid;
    dataService;
    opener;
    interval;
    close = ()=>{
        this.opener && this.opener.close();
    };
    handleMessage = ({ origin, source, data })=>{
        if (source !== this.opener || !this.opener || !isDomainAllowed(origin)) {
            return;
        }
        this.unsubscribe();
        if (data.payload.error) {
            this.dataService.sendAuthorizationFailed(data.payload.error);
            return;
        }
        if (data.action === `${AUTH_VK_CONNECT_RESPONSE}${this.uuid}`) {
            const { responseMode } = Auth.__config.get();
            if (data.payload.ext_id) {
                setExtIdCookie(data.payload.ext_id);
                delete data.payload.ext_id;
            }
            if (responseMode === ConfigResponseMode.Redirect) {
                this.redirectWithPayload(data.payload);
                this.close();
            } else {
                this.dataService.sendSuccessData(data.payload);
            }
            return;
        }
        this.dataService.sendEventNotSupported();
    };
    handleInterval = ()=>{
        if (this.opener?.closed) {
            this.unsubscribe();
            this.dataService.sendNewTabHasBeenClosed();
        }
    };
    subscribe = ()=>{
        this.interval = window.setInterval(this.handleInterval, 1000);
        window.addEventListener('message', this.handleMessage);
        this.dataService.removeCallback();
    };
    unsubscribe = ()=>{
        window.removeEventListener('message', this.handleMessage);
        clearInterval(this.interval);
        this.dataService.setCallback(this.close);
    };
    loginInNewTab = (url)=>{
        this.dataService = new AuthDataService();
        this.opener = window.open(url, '_blank');
        if (this.opener) {
            this.subscribe();
        } else {
            this.dataService.sendCannotCreateNewTab();
        }
        return this.dataService.value;
    };
    loginByRedirect = (url)=>{
        location.assign(url);
        return Promise.resolve();
    };
    login(params) {
        const config = Auth.__config.get();
        this.uuid = uuid();
        const queryParams = deleteUnnecessaryFields([
            'lang'
        ], {
            ...params,
            uuid: this.uuid,
            lang_id: params?.lang,
            scheme: params?.scheme,
            screen: params?.screen,
            response_type: AUTH_RESPONSE_TOKEN,
            action: params?.action ? btoa(JSON.stringify(params.action)) : undefined
        });
        const getUrl = ()=>getVKIDUrl('auth', queryParams, config);
        if (config.mode === ConfigAuthMode.InNewTab) {
            queryParams.origin = location.protocol + '//' + location.hostname;
            return this.loginInNewTab(getUrl());
        } else {
            return this.loginByRedirect(getUrl());
        }
    }
    redirectWithPayload(payload) {
        location.assign(getRedirectWithPayloadUrl(payload, Auth.__config));
    }
};

export { Auth$1 as Auth };
