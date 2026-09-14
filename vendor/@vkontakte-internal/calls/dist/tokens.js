import { localStorage } from '@vkontakte/vkjs';
import { getCallAuthToken } from './services/backend';
const TOKEN_WITH_API_BASE_URL_STORAGE_KEY = 'calls_token_with_url';
const getTokenKeyWithApiBaseUrl = (userId) => `${TOKEN_WITH_API_BASE_URL_STORAGE_KEY}${userId ? `_${userId}` : ''}`;
/**
 * Сохраняет токен в локальное хранилища
 *
 * @param {string} token
 * @return {void}
 */
export function saveLocalTokenWithApiBaseUrl(token, apiBaseUrl, userId) {
    localStorage.setItem(getTokenKeyWithApiBaseUrl(userId), [token, apiBaseUrl].join('///'));
}
/**
 * Достает значение токена из локального хранилища
 *
 * @return {String}
 */
export function getLocalTokenWithApiBaseUrl(userId) {
    const data = localStorage.getItem(getTokenKeyWithApiBaseUrl(userId));
    if (!data) {
        return null;
    }
    const [token, apiBaseUrl] = data.split('///');
    return {
        token,
        apiBaseUrl,
    };
}
/**
 * Получает токен локально или с сервера
 *
 * @param {boolean} isDev
 *
 * @return {Promise}
 */
export async function fetchTokenWithApiBaseUrl(isDev) {
    const { token, api_base_url } = await getCallAuthToken(isDev);
    return {
        token,
        apiBaseUrl: api_base_url,
    };
}
//# sourceMappingURL=tokens.js.map