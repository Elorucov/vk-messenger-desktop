import { PendingTask } from '../../helpers/PendingTask';
import { Retries } from '../../helpers/Retries';
import { Storage } from '../../helpers/Storage';
import { corsRequest } from '../../utils/utilsUrl';
import { waitTimeExp } from '../../utils/utilsWait';
import { CACHE_KEY_REG_EXP, ERROR_TRY_LATER } from './constants';
import { checkAuthExpires, getLoginParams, getRequestUrl, loadCache, mapLoginResponse, waitRequestFromOtherTabs, getWafCaptchaParams, } from './utils';
const reLoginRetries = new Retries();
let lastConfig = {
    domain: 'login.vk.com',
    apiDomain: 'oauth.vk.com',
    maxRetries: 3,
};
export function setLoginConfig(config) {
    config = Object.assign({}, lastConfig, config);
    lastConfig = config;
}
const loginActiveRequestsMap = new Map();
const loginFirstRequestsMap = new Map();
let showCaptcha = false;
export function login(method, methodParams, overrideLoginConfig = {}, force = false, fetchOptions = {}) {
    const config = Object.assign({}, lastConfig, overrideLoginConfig);
    const STORAGE_CACHE_AUTH_KEY = `${config.appId}:${method}:login:auth`;
    const STORAGE_ACTIVE_AUTH_REQUEST_KEY = `${STORAGE_CACHE_AUTH_KEY}--request`;
    let activeRequest = loginActiveRequestsMap.get(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
    if (activeRequest) {
        return activeRequest.get();
    }
    const reLoginAttempt = reLoginRetries.get(STORAGE_ACTIVE_AUTH_REQUEST_KEY) ||
        reLoginRetries.create(STORAGE_ACTIVE_AUTH_REQUEST_KEY, config.maxRetries);
    activeRequest = new PendingTask();
    loginActiveRequestsMap.set(STORAGE_ACTIVE_AUTH_REQUEST_KEY, activeRequest);
    (async () => {
        await waitRequestFromOtherTabs(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
        await waitTimeExp(reLoginAttempt.get());
        // Первый запрос всегда отправляем игнорируя кеш, что бы провалидировать пользователя.
        // Это нужно когда разлогин и авторизация могут пройти не прямую, например сброс сессии и токен
        // сохранные в localStorage будет принадлежать другому пользователю.
        const shouldForce = !loginFirstRequestsMap.get(STORAGE_ACTIVE_AUTH_REQUEST_KEY) || force;
        let cache;
        if (!config.disableSaveToken) {
            cache = loadCache(STORAGE_CACHE_AUTH_KEY);
        }
        const isApiGetAnonymTokenEnabled = methodParams &&
            'isApiOauthAnonymEnabled' in methodParams &&
            methodParams.isApiOauthAnonymEnabled &&
            method === 'get_anonym_token';
        // Если анонимный токен еще действителен, возвращаем его из кеша
        if (isApiGetAnonymTokenEnabled &&
            cache?.access_token &&
            cache?.expires &&
            checkAuthExpires(Number(cache.expires))) {
            activeRequest.resolve(cache);
            return;
        }
        if (!shouldForce && cache?.expires && checkAuthExpires(Number(cache.expires))) {
            Storage.removeItemFromStorage(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
            loginActiveRequestsMap.delete(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
            activeRequest.resolve(cache);
            return;
        }
        const { onCaptcha, useAPIGateWay } = config;
        const cacheAccessToken = {};
        // Сделано, чтобы в params не перезаписывался access_token, если его нет в стораже
        if (cache?.access_token) {
            if (useAPIGateWay) {
                cacheAccessToken.token = cache.access_token;
            }
            else {
                cacheAccessToken.access_token = cache.access_token;
            }
        }
        const url = getRequestUrl(method, config, isApiGetAnonymTokenEnabled);
        const loginParams = getLoginParams(config);
        const params = Object.assign({}, methodParams, loginParams, cacheAccessToken);
        removeLoginCache(method, overrideLoginConfig);
        try {
            const httpResponse = await corsRequest(url, params, fetchOptions);
            const jsonResponse = await httpResponse.json();
            let response = mapLoginResponse(jsonResponse, config, isApiGetAnonymTokenEnabled);
            if ('error' in response) {
                response = getWafCaptchaParams(response);
            }
            if (response.type === 'error') {
                loginActiveRequestsMap.delete(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
                // Нужно сделать несколько попыток перезапросить токен, если пришла ошибка.
                if (response.error_info === ERROR_TRY_LATER) {
                    if (reLoginAttempt.isExceeded()) {
                        reLoginRetries.delete(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
                        return activeRequest.reject({
                            type: 'login_error',
                            error: {
                                error_code: 0,
                                error_msg: 'Maximum of login retries exceeded',
                            },
                        });
                        return;
                    }
                    reLoginAttempt.increment();
                    void (async () => {
                        try {
                            const result = await login(method, methodParams, overrideLoginConfig);
                            activeRequest.resolve(result);
                        }
                        catch (error) {
                            activeRequest.reject(error);
                        }
                    })();
                    return;
                }
                reLoginRetries.delete(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
                activeRequest.reject({
                    type: 'login_error',
                    error: response.error_info,
                    errorCode: response.error_code ?? 'unknown_error',
                });
                return;
            }
            reLoginRetries.delete(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
            if (response.type === 'captcha') {
                if (!onCaptcha) {
                    activeRequest.reject({
                        type: 'login_error',
                        error: 'captcha',
                    });
                    return;
                }
                const { captcha_sid, captcha_img, captcha_type, captcha_height, captcha_width, captcha_ts, captcha_attempt, is_refresh_enabled, is_sound_captcha_available, captcha_track, is_enabled_vkui, uiux_changes, redirect_uri, } = response;
                showCaptcha = true;
                try {
                    const result = await onCaptcha({
                        captcha_sid,
                        captcha_img,
                        captcha_type,
                        captcha_height,
                        captcha_width,
                        is_refresh_enabled,
                        is_sound_captcha_available,
                        captcha_track,
                        is_enabled_vkui,
                        uiux_changes,
                        redirect_uri,
                    });
                    const additionalCaptchaParams = { captcha_ts, captcha_attempt };
                    const newParams = Object.assign({}, methodParams, result, additionalCaptchaParams);
                    loginActiveRequestsMap.delete(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
                    void (async () => {
                        try {
                            const result = await login(method, newParams, overrideLoginConfig);
                            activeRequest.resolve(result);
                        }
                        catch (error) {
                            activeRequest.reject(error);
                        }
                        finally {
                            if (showCaptcha) {
                                showCaptcha = false;
                                config.onCaptchaSuccess?.();
                            }
                        }
                    })();
                }
                catch {
                    loginActiveRequestsMap.delete(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
                    activeRequest.reject({
                        type: 'login_error',
                        error: 'captcha',
                    });
                }
                return;
            }
            const expires = response.data.expires || Infinity;
            if (!config.disableSaveToken) {
                Storage.setItemToStorage(STORAGE_CACHE_AUTH_KEY, JSON.stringify({ ...response.data, expires }));
            }
            Storage.removeItemFromStorage(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
            loginFirstRequestsMap.set(STORAGE_ACTIVE_AUTH_REQUEST_KEY, true);
            loginActiveRequestsMap.delete(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
            activeRequest.resolve(response.data);
        }
        catch (error) {
            reLoginRetries.delete(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
            loginActiveRequestsMap.delete(STORAGE_ACTIVE_AUTH_REQUEST_KEY);
            activeRequest.reject({
                type: 'network_error',
                error,
            });
        }
    })();
    return activeRequest.get();
}
export function removeLoginCache(method, overrideLoginConfig) {
    // Если не передали метод, то удаляем весь нужный кеш.
    if (!method) {
        Object.keys(localStorage).forEach((key) => {
            if (CACHE_KEY_REG_EXP.test(key)) {
                Storage.removeItemFromStorage(key);
            }
        });
        return;
    }
    let config = lastConfig;
    if (overrideLoginConfig) {
        config = Object.assign({}, lastConfig, overrideLoginConfig);
    }
    const STORAGE_CACHE_AUTH_KEY = `${config.appId}:${method}:login:auth`;
    Storage.removeItemFromStorage(STORAGE_CACHE_AUTH_KEY);
}
//# sourceMappingURL=index.js.map