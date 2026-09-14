import { isIPad, isIPadOS } from '@vkontakte/vkjs';
import { ARCH, BROWSER, OS } from '../types';
const osRegexp = {
    [OS.ANDROID]: /Android/i,
    [OS.IOS]: /(iPhone|iPad|iPod)/i,
    [OS.WINDOWS]: /Win/i,
    [OS.MAC]: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh|Mac OS X)/i,
    [OS.LINUX]: /(Linux|X11(?!.*CrOS))/i,
};
const x64Regexp = /(x86_64|x86-64|win64|x64;|amd64|wow64|x64_64)/i;
const mobileRegexp = /Mobile|mini|Fennec|Android|iP(ad|od|hone)|opera (mini|mobi)/i;
const cache = new Map();
/**
 * Определяет операционную систему, ее архитектуру и браузер.
 */
export const Platform = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    get OS() {
        if (cache.has('os')) {
            return cache.get('os');
        }
        const { userAgent } = window.navigator;
        for (let [os, regexp] of Object.entries(osRegexp)) {
            if (regexp && regexp.test(userAgent)) {
                cache.set('os', os);
                return os;
            }
        }
        cache.set('os', OS.UNKNOWN);
        return OS.UNKNOWN;
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    get ARCH() {
        if (cache.has('arch')) {
            return cache.get('arch');
        }
        const { userAgent, platform } = window.navigator;
        if (x64Regexp.test(userAgent) || platform === 'MacIntel' || platform === 'Linux x86_64') {
            cache.set('arch', ARCH.X64);
            return ARCH.X64;
        }
        if (/arm/i.test(userAgent)) {
            cache.set('arch', ARCH.ARM);
            return ARCH.ARM;
        }
        cache.set('arch', ARCH.X86);
        return ARCH.X86;
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    get BROWSER() {
        return getBrowserInfo().name.toLowerCase();
    },
    get isChromeBased() {
        return getBrowserInfo().chromeBased;
    },
    get isMobile() {
        if (cache.has('isMobile')) {
            return cache.get('isMobile');
        }
        const { appVersion } = window.navigator;
        const result = mobileRegexp.test(appVersion);
        cache.set('isMobile', result);
        return result;
    },
    get isIPad() {
        return isIPad || isIPadOS;
    },
    get isFirefox() {
        return Platform.BROWSER === BROWSER.FIREFOX;
    },
    get name() {
        return Platform.OS === OS.LINUX
            ? 'Linux'
            : Platform.OS === OS.MAC
                ? 'macOS'
                : Platform.OS === OS.WINDOWS
                    ? 'Windows'
                    : undefined;
    },
};
export function getBrowserInfo() {
    if (cache.has('browserInfo')) {
        return cache.get('browserInfo');
    }
    const browserInfo = (() => {
        let tmp;
        let isChromeBased = false;
        let chromeVersion = 0;
        const { userAgent: ua, appName: an, appVersion: av } = window.navigator;
        const matched = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)([\d.]+)/i);
        const defaultBrowserInfo = {
            name: an,
            version: av,
            fullVersion: av,
            chromeBased: isChromeBased,
            chromeVersion,
        };
        if (!matched) {
            const tmp = ua.match(/version\/(\d+)([\d.]+)/i);
            return {
                ...defaultBrowserInfo,
                version: (tmp && tmp[1]) || av,
                fullVersion: tmp && tmp[1] ? `${tmp[1]}${tmp[2] || ''}` : av,
            };
        }
        if (/trident/i.test(matched[1])) {
            tmp = /\brv[ :]+(\d+)([\d.]+)/g.exec(ua);
            return {
                name: BROWSER.IE,
                version: (tmp && tmp[1]) || 'Unknown',
                fullVersion: tmp && tmp[1] ? `${tmp[1]}${tmp[2] || ''}` : 'Unknown',
                chromeBased: isChromeBased,
                chromeVersion: chromeVersion,
            };
        }
        if (matched[1] === 'Safari') {
            // Old Edge
            tmp = ua.match(/\bEdge\/(\d+)([\d.])+/);
            if (tmp) {
                return {
                    name: BROWSER.EDGE,
                    version: tmp[1] || 'Unknown',
                    fullVersion: tmp[1] ? `${tmp[1]}${tmp[2] || ''}` : 'Unknown',
                    chromeBased: isChromeBased,
                    chromeVersion: chromeVersion,
                };
            }
            // Chrome iOS
            tmp = ua.match(/\bCriOS\/(\d+)([\d.]+)/);
            if (tmp) {
                return {
                    name: BROWSER.CHROME,
                    version: tmp[1],
                    fullVersion: `${tmp[1]}${tmp[2]}`,
                    chromeBased: true,
                    chromeVersion: tmp[1],
                };
            }
            // Firefox iOS
            tmp = ua.match(/\bFxiOS\/(\d+)([\d.]+)/);
            if (tmp) {
                return {
                    name: BROWSER.FIREFOX,
                    version: tmp[1],
                    fullVersion: `${tmp[1]}${tmp[2]}`,
                    chromeBased: isChromeBased,
                    chromeVersion: chromeVersion,
                };
            }
            // Yandex Browser iOS
            tmp = ua.match(/\bYaBrowser\/(\d+)([\d.]+)/);
            if (tmp) {
                return {
                    name: BROWSER.YANDEX,
                    version: tmp[1],
                    fullVersion: `${tmp[1]}${tmp[2]}`,
                    chromeBased: isChromeBased,
                    chromeVersion: chromeVersion,
                };
            }
            // Opera Touch iOS
            tmp = ua.match(/\bOPT\/(\d+)([\d.]+)/);
            if (tmp) {
                return {
                    name: BROWSER.OPERA,
                    version: tmp[1],
                    fullVersion: `${tmp[1]}${tmp[2]}`,
                    chromeBased: isChromeBased,
                    chromeVersion: chromeVersion,
                };
            }
        }
        if (matched[1] === 'Chrome') {
            chromeVersion = Number(matched[2]);
            isChromeBased = true;
            tmp = ua.match(/\bOPR\/(\d+)([\d.]+)/);
            if (tmp) {
                return {
                    name: BROWSER.CHROME,
                    version: tmp[1] || 'Unknown',
                    fullVersion: tmp[1] ? `${tmp[1]}${tmp[2] || ''}` : 'Unknown',
                    chromeBased: isChromeBased,
                    chromeVersion: chromeVersion,
                };
            }
            tmp = ua.match(/\bYaBrowser\/(\d+)([\d.]+)/);
            if (tmp) {
                return {
                    name: BROWSER.YANDEX,
                    version: tmp[1] || 'Unknown',
                    fullVersion: tmp[1] ? `${tmp[1]}${tmp[2] || ''}` : 'Unknown',
                    chromeBased: isChromeBased,
                    chromeVersion: chromeVersion,
                };
            }
            // New Edge
            tmp = ua.match(/\bEdge?\/(\d+)([\d.]+)/);
            if (tmp) {
                return {
                    name: BROWSER.EDGE,
                    version: tmp[1] || 'Unknown',
                    fullVersion: tmp[1] ? `${tmp[1]}${tmp[2] || ''}` : 'Unknown',
                    chromeBased: isChromeBased,
                    chromeVersion: chromeVersion,
                };
            }
            // TODO: Оставить или удалить?
            // На домене ok.ru Opera почему-то отдаёт userAgent хрома
            if (typeof window.opr !== 'undefined' && /^(.+\.)?ok.ru$/.test(window.location.host)) {
                return {
                    name: BROWSER.OPERA,
                    version: 'Hidden',
                    fullVersion: 'Hidden',
                    chromeBased: isChromeBased,
                    chromeVersion: chromeVersion,
                };
            }
        }
        tmp = ua.match(/version\/(\d+)([\d.]+)/i);
        return {
            ...defaultBrowserInfo,
            name: matched[2] ? matched[1] : an,
            version: (tmp && tmp[1]) || matched[2] || av,
            fullVersion: tmp && tmp[1] ? `${tmp[1]}${tmp[2] || ''}` : matched[2] ? `${matched[2]}${matched[3] || ''}` : av,
        };
    })();
    cache.set('browserInfo', browserInfo);
    return browserInfo;
}
//# sourceMappingURL=platform.js.map