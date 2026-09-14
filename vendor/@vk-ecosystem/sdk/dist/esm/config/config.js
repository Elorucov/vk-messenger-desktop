import { Config as globalConfig } from '../lib/@vkid/sdk/dist-sdk/esm/index.js';
import mitt from '../lib/mitt/dist/mitt.es.js';
import { LOGIN_DOMAIN, OAUTH_DOMAIN, CONNECT_DOMAIN, DOMAIN_FILE_URL, DEFAULT_DOMAIN } from '../common/constants.js';
import '../common/errors.js';
import { tokenValidator } from '../validator/validators.js';
import { ConfigInternalEvents } from './events.js';
import { appIdValidator, requestSuperAppTokenHandlerValidator, authHandlerValidator, logoutHandlerValidator } from './validators.js';
import { ConfigAuthMode } from '../lib/@vkid/sdk/dist-sdk/esm/core/config/types.js';

let fetchVKDomainTask;
let store = {
    appId: 0,
    superAppToken: '',
    superAppTokenV2: '',
    state: '',
    redirectUrl: '',
    mode: ConfigAuthMode.InNewTab,
    loginDomain: LOGIN_DOMAIN,
    oauthDomain: OAUTH_DOMAIN,
    connectDomain: CONNECT_DOMAIN,
    _debug: false,
    _localhost: false
};
let handlers = {};
/**
 * Пример использования:
 *
 * ```
 * Config.init({
 *   app_id: 111111,
 * });
 *
 * Config.onRequestSuperAppToken(() => {
 *   Config.setSuperAppToken('superapptoken приложения');
 * });
 *
 * Config.onAuth(() => {
 *   Config.setSuperAppToken('superapptoken приложения');
 * });
 *
 * Config.onLogout(() => {
 *    window.location.reload();
 * });
 * ```
 */ // eslint-disable-next-line @typescript-eslint/no-extraneous-class
class Config {
    /**
   * Св-во позволяет подписаться на общие события SDK.
   */ static events = mitt();
    /**
   * @ignore
   */ // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor(){}
    /**
   * Метод инициализации. Позволяет установить базовые настройки для всех модулей SDK.
   */ static init(params) {
        if (!params.appId) {
            throw new Error('appId required');
        }
        const validationResult = appIdValidator.validate({
            appId: params.appId
        });
        !validationResult.isValid() && console.error(validationResult.error());
        store.appId = params.appId;
        store.superAppToken = params.superAppToken || '';
        store.superAppTokenV2 = params.superAppTokenV2 || '';
        store.loginDomain = params.loginDomain || LOGIN_DOMAIN;
        store.oauthDomain = params.oauthDomain || OAUTH_DOMAIN;
        store.connectDomain = params.connectDomain || CONNECT_DOMAIN;
        store.redirectUrl = params.redirectUrl || '';
        store.state = params?.state;
        store.mode = params?.mode;
        store.only_qr = params?.only_qr;
        store.appSettings = params.appSettings;
        store._debug = !!params._debug;
        store._localhost = !!params._localhost;
        globalConfig.set({
            app: store.appId,
            redirectUrl: store.redirectUrl,
            state: store.state,
            mode: store.mode,
            __vkidDomain: store.connectDomain,
            __loginDomain: store.loginDomain,
            __oauthDomain: store.oauthDomain,
            __debug: store._debug,
            __localhost: store._debug
        });
    }
    /**
   * Метод возвращает текущие настройки.
   */ static get() {
        return store;
    }
    /**
   * Метод позволяет установить SuperAppToken.
   * Этот токен будут использовать другие модули SDK.
   */ static setSuperAppToken(token, options = {}) {
        const validationResult = tokenValidator.validate({
            token
        });
        !validationResult.isValid() && console.error(validationResult.error());
        if (options.version === 2) {
            store.superAppTokenV2 = token;
            Config.events.emit(ConfigInternalEvents.SUPERAPP_TOKEN_CHANGE_V2, token);
        } else {
            store.superAppToken = token;
            Config.events.emit(ConfigInternalEvents.SUPERAPP_TOKEN_CHANGE, token);
        }
    }
    /**
   * Метод позволяет подписаться на событие запроса SuperAppToken-а.
   */ static onRequestSuperAppToken(handler) {
        const validationResult = requestSuperAppTokenHandlerValidator.validate({
            handler
        });
        !validationResult.isValid() && console.error(validationResult.error());
        handlers.requestSuperAppToken = handler;
    }
    // TODO (alegotkin): сделать подписку через emit.
    // TODO (rualekseev): подумать как правильно именовать такие методы, приватные для самого сдк
    /**
   * @ignore
   */ static _requestSuperAppToken(params, options = {}) {
        let handler;
        if (handlers.requestSuperAppToken) {
            handler = handlers.requestSuperAppToken(params, options);
        }
        if (handler) {
            handler.then((token)=>Config.setSuperAppToken(token, options)).catch(console.error);
        }
    }
    /**
   * Метод позволяет подписаться на событие запроса авторизации.
   */ static onAuth(handler) {
        const validationResult = authHandlerValidator.validate({
            handler
        });
        !validationResult.isValid() && console.error(validationResult.error());
        handlers.auth = handler;
    }
    /**
   * @ignore
   */ static _auth(options = {}) {
        let handler;
        if (handlers.auth) {
            handler = handlers.auth();
        }
        if (handler) {
            handler.then((token)=>{
                Config.setSuperAppToken(token, options);
            }).catch(console.error);
        }
    }
    // TODO: V2 - удалить метод.
    /**
   * @ignore
   */ static onOpenApp(handler) {
        handlers.openApp = handler;
    }
    /**
   * @ignore
   */ static _openApp(params) {
        if (!handlers.openApp) {
            return;
        }
        // TODO (alegotkin): вынести это в профиль, что бы была возможность возвращать данные обратно.
        handlers.openApp(params.app);
    }
    /**
   * Метод позволяет подписаться на событие разлогина.
   */ static onLogout(handler) {
        const validationResult = logoutHandlerValidator.validate({
            handler
        });
        !validationResult.isValid() && console.error(validationResult.error());
        handlers.logout = handler;
    }
    /**
   * @ignore
   */ static _logout() {
        if (!handlers.logout) {
            return;
        }
        handlers.logout();
    }
    static fetchDomain() {
        if (!Boolean(fetchVKDomainTask)) {
            fetchVKDomainTask = new Promise((resolve)=>{
                void fetch(DOMAIN_FILE_URL).then((response)=>{
                    return response.text();
                }).then((raw)=>{
                    return raw.trim();
                }).then((domain)=>{
                    store.loginDomain = store.loginDomain.replace(DEFAULT_DOMAIN, domain);
                    store.oauthDomain = store.oauthDomain.replace(DEFAULT_DOMAIN, domain);
                    store.connectDomain = store.connectDomain.replace(DEFAULT_DOMAIN, domain);
                }).then(resolve).catch((error)=>{
                    resolve();
                    console.warn(error);
                });
            });
        }
        return fetchVKDomainTask;
    }
}

export { Config };
