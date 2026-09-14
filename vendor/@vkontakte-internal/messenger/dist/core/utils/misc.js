import { toTextAndEmojiChunks } from '../utils/emoji';
export const isDev = process.env.NODE_ENV === 'development';
export function exhaustivenessCheck(_unused) {
    throw new Error('Exhaustivness failure! This should never happen.');
}
export async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
export function debounce(func, wait, immediate) {
    let timeout = null;
    const clear = () => {
        if (timeout !== null) {
            window.clearTimeout(timeout);
            timeout = null;
        }
    };
    const result = (...args) => {
        const later = () => {
            timeout = null;
            if (!immediate) {
                func(...args);
            }
        };
        const callNow = immediate && !timeout;
        clear();
        timeout = window.setTimeout(later, wait);
        if (callNow) {
            func(...args);
        }
    };
    result.cancel = clear;
    return result;
}
export function throttle(callback, wait, onlyTrailing) {
    let isBlocked = false;
    let callArgs = null;
    let timeout = null;
    const result = (...args) => {
        if (isBlocked) {
            callArgs = args;
            return;
        }
        isBlocked = true;
        if (onlyTrailing) {
            callArgs = args;
        }
        else {
            callback(...args);
        }
        timeout = window.setTimeout(() => {
            isBlocked = false;
            if (callArgs) {
                callback(...callArgs);
                callArgs = null;
            }
        }, wait);
    };
    result.cancel = () => {
        isBlocked = false;
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
    };
    return result;
}
export class RetryTimeout {
    minTimeout;
    maxTimeout;
    timeout;
    retries;
    constructor(minTimeout, maxTimeout) {
        this.minTimeout = minTimeout;
        this.maxTimeout = maxTimeout;
        this.timeout = minTimeout;
        this.retries = 0;
    }
    delay = () => {
        return this.timeout;
    };
    attempts = () => {
        return this.retries;
    };
    backoff = () => {
        this.timeout = Math.min(2 * this.timeout, this.maxTimeout);
        this.retries++;
    };
    reset = () => {
        this.timeout = this.minTimeout;
        this.retries = 0;
    };
}
export function toNonEmpty(arr) {
    return arr.length > 0 ? arr : null;
}
/**
 * Проверка, что массив не пустой.
 */
export function isNonEmptyArray(array) {
    return array[0] !== undefined;
}
export function formatFileSize(size) {
    /**
     * @TODO: подумать над тем, куда это положить
     *   Вполне возможно, что зависит от локали и может жить в lang
     */
    if (size > 1024 ** 3) {
        return Number((size / 1024 ** 3).toFixed(2)) + ' GB';
    }
    if (size > 1024 ** 2) {
        return Number((size / 1024 ** 2).toFixed(1)) + ' MB';
    }
    return Math.round(size / 1024) + ' KB';
}
export function formatDuration(durationInSeconds, forceHours) {
    if (!durationInSeconds) {
        durationInSeconds = 0;
    }
    durationInSeconds = Math.abs(durationInSeconds);
    const MINUTE = 60;
    const HOUR = 3600;
    const hours = Math.floor(durationInSeconds / HOUR).toString();
    const minutes = (Math.floor(durationInSeconds / MINUTE) % MINUTE).toString();
    const seconds = (durationInSeconds % MINUTE).toString().padStart(2, '0');
    if (durationInSeconds >= HOUR || forceHours) {
        return [hours, minutes.padStart(2, '0'), seconds].join(':');
    }
    else {
        return [minutes.padStart(1, '0'), seconds].join(':');
    }
}
/**
 * Проверяет что переданные даты находятся в одном дне
 */
export function isSameDate(d1, d2) {
    d1 = new Date(d1);
    d2 = new Date(d2);
    return (d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear());
}
/**
 * Проверяет, что переданные даты находятся в одном месяце
 */
export function isSameMonth(d1, d2) {
    d1 = new Date(d1);
    d2 = new Date(d2);
    return (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear());
}
/**
 * Проверяет, что переданные даты находятся в одном году
 */
export function isSameYear(d1, d2) {
    d1 = new Date(d1);
    d2 = new Date(d2);
    return d1.getFullYear() === d2.getFullYear();
}
/**
 * Получает таймстемп начала дня
 */
export function getDateDayStart(timestamp) {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}
/**
 * No operation function (noop) – используется для кейсов, когда требуется передача функций через обязательные пропсы, но
 * компоненту не требуется обработка таких сценариев. В таком случае передаем noop (no operation). */
export function noop() {
    // Ничего не делаем
}
export const noopArray = [];
export const noopMap = new Map();
// @note При необходимости заменить на более продвинутую версию, _.words
export function words(value) {
    return value.split(/\s/);
}
function isEqual(a, b, strategy) {
    if (a === b)
        return true;
    // Условие для NaN.
    // eslint-disable-next-line no-self-compare
    if (a !== a && b !== b) {
        return true;
    }
    const isPrimitive = (value) => typeof value !== 'object' || value === null;
    const compare = (a, b) => strategy === 'deep' ? isEqual(a, b, 'deep') : Object.is(a, b);
    if (isPrimitive(a) || isPrimitive(b)) {
        return a === b;
    }
    if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor) {
            return false;
        }
        if (Array.isArray(a)) {
            if (a.length !== b.length) {
                return false;
            }
            for (let i = 0; i < a.length; i++) {
                if (!compare(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }
        if (a instanceof Map && b instanceof Map) {
            if (a.size !== b.size) {
                return false;
            }
            for (const i of a.entries()) {
                const key = i[0];
                if (!isPrimitive(key)) {
                    throw new Error("isDeepEqual can't compare Maps with non primitive keys");
                }
                if (!b.has(key)) {
                    return false;
                }
            }
            for (const i of a.entries()) {
                if (!compare(i[1], b.get(i[0]))) {
                    return false;
                }
            }
            return true;
        }
        if (a instanceof Set && b instanceof Set) {
            if (a.size !== b.size) {
                return false;
            }
            for (const i of a.entries()) {
                const value = i[0];
                if (!isPrimitive(value)) {
                    throw new Error("isDeepEqual can't compare Sets with non primitive values");
                }
                if (!b.has(value)) {
                    return false;
                }
            }
            return true;
        }
        const keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length) {
            return false;
        }
        for (const key of keys) {
            if (!Object.prototype.hasOwnProperty.call(b, key)) {
                return false;
            }
        }
        for (const key of keys) {
            if (!compare(a[key], b[key])) {
                return false;
            }
        }
        return true;
    }
    throw new Error(`isEqual don't know how to compare: ${a} and ${b}`);
}
/**
 * Глубокое сравнение обьектов.
 * Не умеет сравнивать: ArrayBuffer'ы, Map с ключами-непримитивами, Set с непримитивами.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isDeepEqual(a, b) {
    return isEqual(a, b, 'deep');
}
/**
 * Поверхностное сравнение обьектов.
 * Не умеет сравнивать: ArrayBuffer'ы, Map с ключами-непримитивами, Set с непримитивами.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isShallowEqual(a, b) {
    return isEqual(a, b, 'shallow');
}
export function cloneDeep(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Escape regexp special symbols, so that they match only the actual character (e.g. '.' for matching dot '.' and not any char)
 * See https://stackoverflow.com/a/3561711
 * @param {string} s - normal string to be used in regexp pattern
 * @return {string}
 */
export const escapeRegex = (s) => s ? s.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1') : '';
/**
 * Безопасное декодирование URI
 */
export function safeDecodeURI(link) {
    try {
        return decodeURIComponent(link);
    }
    catch (err) {
        return link;
    }
}
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
export function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
// https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
// The Fisher-Yates algorithm
export function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        const temp = shuffledArray[i];
        shuffledArray[i] = shuffledArray[j];
        shuffledArray[j] = temp;
    }
    return shuffledArray;
}
/**
 * Получение первого символа в строке с учётом emoji
 */
export function getFirstLetter(str) {
    const [chunk] = toTextAndEmojiChunks(str);
    if (!chunk) {
        return '';
    }
    switch (chunk.kind) {
        case 'Text':
            return (chunk.text[0] || '').toUpperCase();
        case 'Emoji':
            return chunk.text;
        default:
            return exhaustivenessCheck(chunk);
    }
}
/**
 * Возвращает промис, которым можно управлять извне
 *
 * @deprecated костыль, который будет выпилен в рамках
 * https://jira.mvk.com/browse/ME-39519
 */
export function createDeferredPromise() {
    // Дефолтные значения выставлены, чтобы угомонить typescript.
    // Они будут перезаписаны сразу же после создания промиса
    let resolve = Promise.resolve;
    let reject = Promise.reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    promise.resolve = resolve;
    promise.reject = reject;
    return promise;
}
/**
 * Проверяет телефонный номер на валидность
 * Регулярка взята из \VK\Mobile\PhoneParser
 */
export function isValidPhoneNumber(phone) {
    const PHONE_REGEXP = /^\+?(\d{10,18}|\d{1,5}([\s-]?(\(\d{1,3}\)|\d{1,4})){1,4})$/;
    const cleanPhone = phone.trim();
    return PHONE_REGEXP.test(cleanPhone);
}
export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
export const parseRootMargin = (rootMargin) => rootMargin
    ? rootMargin
        .toString()
        .split(' ')
        .map((margin) => `${parseInt(margin)}px`)
        .join(' ')
    : undefined;
export function getInitials(name) {
    return name.split(/\s/).slice(0, 2).map(getFirstLetter).join('');
}
export function getFlagValueByBitOffset(flags, mapping) {
    if (typeof flags === 'number') {
        const matchedFlags = {};
        for (const name of Object.keys(mapping)) {
            matchedFlags[name] = (flags & (1 << mapping[name])) > 0;
        }
        return matchedFlags;
    }
    let result = 0;
    for (const name of Object.keys(flags)) {
        if (flags[name]) {
            result |= 1 << mapping[name];
        }
    }
    return result;
}
export const MIN_INT_32 = -(2 ** 31);
export const MAX_INT_32 = 2 ** 31 - 1;
export const isValidUrl = (rawUrl) => {
    const url = addProtocolToUrl(rawUrl);
    const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
    const localhostDomainRE = /^localhost[:?\d]*(?:[^:?\d]\S*)?$/;
    const nonLocalhostDomainRE = /^[^\s.]+\.\S{2,}$/;
    if (typeof url !== 'string') {
        return false;
    }
    const match = url.match(protocolAndDomainRE);
    if (!match) {
        return false;
    }
    const everythingAfterProtocol = match[1];
    if (!everythingAfterProtocol) {
        return false;
    }
    if (localhostDomainRE.test(everythingAfterProtocol) ||
        nonLocalhostDomainRE.test(everythingAfterProtocol)) {
        return true;
    }
    return false;
};
export const addProtocolToUrl = (url) => {
    const u = url.trim();
    return u.startsWith('http') ? u : `https://${u}`;
};
const HEX_REGEXP = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
export function hexToRgbData(color) {
    const result = HEX_REGEXP.exec(color) || undefined;
    return (result && {
        r: parseInt(result[1] || '', 16),
        g: parseInt(result[2] || '', 16),
        b: parseInt(result[3] || '', 16),
    });
}
export function hexToRgba(color, alpha) {
    const { r, g, b } = hexToRgbData(color) || {};
    return ![r, g, b].includes(NaN)
        ? `rgba(${r}, ${g}, ${b}, ${alpha})`
        : undefined;
}
export function defer() {
    let resolve = () => { };
    let reject = () => { };
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {
        promise,
        resolve,
        reject,
    };
}
//# sourceMappingURL=misc.js.map