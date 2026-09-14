import { API_ERROR_CAPTCHA, API_ERROR_TOO_MANY } from '../../error-codes';
import { Storage } from '../../helpers/Storage';
import { getRandomWaitTime, ONE_MINUTE_MS } from '../../utils/utilsWait';
import { makeParams } from '../../utils/utilsUrl';
import { getApiConfig } from '../API/config';
import { getApiQueryParams } from '../API/utils';
import { AUTH_VERSION, ERROR_TRY_LATER } from './constants';
export const getLoginParams = (config) => {
    if (config.useAPIGateWay) {
        const apiConfig = getApiConfig();
        return { app_id: apiConfig.appId };
    }
    return {
        version: config.version || AUTH_VERSION,
        app_id: config.appId,
    };
};
export const getApiAnonymLoginResponse = (loginResponse) => {
    if ('error' in loginResponse) {
        return {
            type: 'error',
            error_code: loginResponse.error,
            error_info: loginResponse.error_description,
        };
    }
    return {
        type: 'okay',
        data: {
            access_token: loginResponse.token,
            expires: loginResponse.expired_at,
        },
    };
};
export const getLoginResponse = (loginResponse) => {
    if (!Array.isArray(loginResponse)) {
        return loginResponse;
    }
    const [data] = loginResponse;
    return { type: 'okay', data };
};
export const getApiLoginResponse = ({ response }) => {
    return {
        type: 'okay',
        data: {
            ...response,
            access_token: response.token,
        },
    };
};
export const waitRequestFromOtherTabs = (key) => {
    return new Promise((resolve) => {
        const requestFromOtherTabs = Storage.getItemFromStorage(key);
        if (requestFromOtherTabs === null) {
            Storage.setItemToStorage(key, '1');
            resolve();
        }
        else {
            setTimeout(resolve, getRandomWaitTime());
        }
    });
};
export const loadCache = (key) => {
    let cacheString = Storage.getItemFromStorage(key);
    let cache = {};
    if (cacheString) {
        try {
            cache = JSON.parse(cacheString);
        }
        catch (e) { }
    }
    return cache;
};
export const checkAuthExpires = (expiresSeconds) => {
    return expiresSeconds * 1000 - Date.now() >= ONE_MINUTE_MS;
};
export const getWafCaptchaParams = (response) => {
    // waf капча имеет немного другие поля, поэтому необходимо привести их к общему виду
    let value;
    const { error_code, error_msg } = response.error;
    switch (error_code) {
        case API_ERROR_CAPTCHA:
            const { captcha_sid, captcha_img, captcha_width, captcha_height, captcha_attempt, captcha_ts, is_refresh_enabled, is_sound_captcha_available, captcha_track, is_enabled_vkui, uiux_changes, redirect_uri, } = response.error;
            value = {
                type: 'captcha',
                captcha_type: 'regular',
                captcha_sid: captcha_sid,
                captcha_img: captcha_img,
                captcha_track: captcha_track,
                captcha_height: captcha_height,
                captcha_width: captcha_width,
                captcha_attempt,
                captcha_ts,
                is_refresh_enabled,
                is_sound_captcha_available,
                is_enabled_vkui,
                uiux_changes,
                redirect_uri,
            };
            break;
        case API_ERROR_TOO_MANY:
            value = {
                type: 'error',
                error_info: ERROR_TRY_LATER,
                error_code: String(error_code),
            };
            break;
        default:
            value = {
                type: 'error',
                error_info: error_msg,
                error_code: String(error_code),
            };
    }
    return value;
};
export const getRequestUrl = (method, { apiDomain, domain, path = '', useAPIGateWay }, isApiGetAnonymTokenEnabled) => {
    if (isApiGetAnonymTokenEnabled) {
        return `https://${apiDomain}/get_anonym_token`;
    }
    if (useAPIGateWay) {
        const apiConfig = getApiConfig();
        const apiQueryParams = makeParams(getApiQueryParams(apiConfig));
        return `https://${apiConfig.domain}/method/${method}?${apiQueryParams}`;
    }
    return `https://${domain}/${path}?act=${method}`;
};
export const mapLoginResponse = (jsonResponse, { useAPIGateWay }, isApiGetAnonymTokenEnabled) => {
    if (useAPIGateWay) {
        return getApiLoginResponse(jsonResponse);
    }
    if (isApiGetAnonymTokenEnabled) {
        return getApiAnonymLoginResponse(jsonResponse);
    }
    return getLoginResponse(jsonResponse);
};
//# sourceMappingURL=utils.js.map