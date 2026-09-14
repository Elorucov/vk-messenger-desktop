import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
let apiWrapper = null;
let anonymousAccessToken;
export const setApiWrappers = (
// TODO: удалить withAuth
_apiWrapperWithAuth, _apiWrapper) => {
    apiWrapper = _apiWrapper;
};
export const setAnonymousAccessToken = (token) => {
    anonymousAccessToken = token;
};
export const getAnonymousAccessToken = () => anonymousAccessToken;
export const hasAnonymousAccessToken = () => Boolean(anonymousAccessToken);
export const getApiWrapper = () => {
    return apiWrapper;
};
// TODO: удалить withAuth
export function createApi(method, withAnonymousToken = false) {
    return (params, fetchOptions, apiConfig) => {
        debugMessage(DebugMessageType.DEBUG, {
            type: 'request',
            method,
        });
        if (withAnonymousToken === true && hasAnonymousAccessToken()) {
            const accessToken = getAnonymousAccessToken();
            apiConfig = {
                ...apiConfig,
                accessToken,
            };
            // Удаляем эти ключи чтоб бекенд работал по новым анонимным токенам
            if (accessToken &&
                params !== null &&
                typeof params === 'object' &&
                'secret' in params &&
                'device_id' in params &&
                'anonym_auth_user_id' in params) {
                delete params.device_id;
                delete params.secret;
                delete params.anonym_auth_user_id;
            }
        }
        return getApiWrapper()()(method, params, apiConfig, fetchOptions).then((data) => {
            debugMessage(DebugMessageType.DEBUG, {
                type: 'response',
                method,
                data,
            });
            return data;
        });
    };
}
//# sourceMappingURL=apiGetter.js.map