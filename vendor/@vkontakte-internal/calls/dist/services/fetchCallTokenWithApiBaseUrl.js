import { fetchTokenWithApiBaseUrl, getLocalTokenWithApiBaseUrl, saveLocalTokenWithApiBaseUrl, } from '../tokens';
let sdkTokenWithApiBaseUrl;
/**
 * Берем кешированный токен или запрашиваем новый.
 * Если токен устарел, то sdk сам пересоздаст токен.
 *
 * **Использовать данную функцию, только когда пользователь авторизован**
 */
export async function fetchCallTokenWithApiBaseUrl(id, isDev = false) {
    if (sdkTokenWithApiBaseUrl) {
        return sdkTokenWithApiBaseUrl;
    }
    const sdkTokenWithApiBaseUrlLocal = getLocalTokenWithApiBaseUrl(id);
    if (sdkTokenWithApiBaseUrlLocal) {
        return {
            token: sdkTokenWithApiBaseUrlLocal.token,
            apiBaseUrl: sdkTokenWithApiBaseUrlLocal.apiBaseUrl,
        };
    }
    /**
     * fetchTokenWithApiBaseUrl - полагается на реализацию setApiWrappers, поэтому запускается только после него
     */
    sdkTokenWithApiBaseUrl = fetchTokenWithApiBaseUrl(isDev);
    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
    sdkTokenWithApiBaseUrl.then(({ token, apiBaseUrl }) => saveLocalTokenWithApiBaseUrl(token, apiBaseUrl, id));
    return sdkTokenWithApiBaseUrl;
}
//# sourceMappingURL=fetchCallTokenWithApiBaseUrl.js.map