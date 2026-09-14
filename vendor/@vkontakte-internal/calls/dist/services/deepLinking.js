import { Platform } from '@vkontakte-internal/calls-core';
import { LOCALSTORAGE_IS_CALLS_APP_DOWNLOADED, LOCALSTORAGE_IS_MESSENGER_APP_DOWNLOADED } from '../constants';
/**
 * Cтраница не в фокусе, невозможно открыть диплинк
 */
const DEEP_LINK_ERROR_PAGE_IS_HIDDEN = 'hidden_page';
/**
 * Время проверки истекло - приложение не установлено,
 * либо в данный момент пользователь видит какое-либо модальное окно
 */
const DEEP_LINK_ERROR_TIMED_OUT = 'timed_out';
/**
 * На мобильных платформах полноценная поддержка отсутствует
 */
const DEEP_LINK_ERROR_IS_MOBILE = 'is_mobile';
/**
 * Большее время ожидание нужно для медленных окружений
 */
const DEEP_LINK_TIMEOUT = 3000;
/**
 * Открывает диплинк на дексопе
 */
export function openDesktopDeepLink(link) {
    return new Promise((resolve, reject) => {
        if (Platform.isMobile) {
            reject(DEEP_LINK_ERROR_IS_MOBILE);
            return;
        }
        document.body.focus();
        if (document.visibilityState === 'hidden' || document.hidden) {
            reject(DEEP_LINK_ERROR_PAGE_IS_HIDDEN);
            return;
        }
        let timeout;
        const handler = () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            window.removeEventListener('blur', handler);
            resolve(true);
        };
        window.addEventListener('blur', handler);
        timeout = setTimeout(() => {
            window.removeEventListener('blur', handler);
            reject(DEEP_LINK_ERROR_TIMED_OUT);
        }, DEEP_LINK_TIMEOUT);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
            iframeWindow.location.href = link;
            setTimeout(() => {
                iframe.parentNode && iframe.parentNode.removeChild(iframe);
            }, 100);
        }
        else {
            window.location.href = link;
        }
    });
}
export const handleDeepLinkSuccess = (isSferum) => {
    const key = isSferum ? LOCALSTORAGE_IS_MESSENGER_APP_DOWNLOADED : LOCALSTORAGE_IS_CALLS_APP_DOWNLOADED;
    if (window.localStorage.getItem(key) !== 'true') {
        window.localStorage.setItem(key, 'true');
    }
};
//# sourceMappingURL=deepLinking.js.map