import React from 'react';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { isString } from '@vkontakte/vkjs';
export function getOffsetRect(elem, parentElem) {
    if (typeof window === 'undefined' || !(elem instanceof HTMLElement)) {
        return {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
        };
    }
    const box = elem.getBoundingClientRect();
    const parentBox = parentElem?.getBoundingClientRect();
    const body = document.body;
    const doc = document.documentElement;
    const scrollTop = parentElem
        ? parentElem.scrollTop
        : window.pageYOffset || doc.scrollTop || body.scrollTop;
    const scrollLeft = (parentElem ? parentElem.scrollLeft : window.pageXOffset) ||
        doc.scrollLeft ||
        body.scrollLeft;
    const clientTop = doc.clientTop || body.clientTop || 0;
    const clientLeft = doc.clientLeft || body.clientLeft || 0;
    return {
        top: box.top - (parentBox?.top || 0) + scrollTop - clientTop,
        left: box.left - (parentBox?.left || 0) + scrollLeft - clientLeft,
        width: box.width,
        height: box.height,
    };
}
const _ua = navigator.userAgent.toLowerCase();
export const browser = {
    version: (_ua.match(/.+(?:me|ox|on|rv|it|era|opr|ie|edge)[/: ]([\d.]+)/) || [
        0,
        '0',
    ])[1],
    firefox: /firefox\/\d+/i.test(_ua),
    safari: !/chrome/i.test(_ua) && /webkit|safari|khtml/i.test(_ua),
    safari_mobile: /iphone|ipod|ipad/i.test(_ua),
    ios: /.+(ipod|ipad|iphone.*os)/i.test(_ua),
    android: /android/i.test(_ua),
    huawei: /huawei/i.test(_ua),
    touch: window.matchMedia('(pointer: coarse)').matches,
    voiceRecordingSupported: Boolean(window.navigator.mediaDevices &&
        'getUserMedia' in window.navigator.mediaDevices &&
        (window.AudioContext || window.webkitAudioContext)),
    mobile: /iphone|ipod|ipad|opera mini|opera mobi|iemobile|android/.test(_ua),
};
export const isMac = 'userAgentData' in window.navigator &&
    'platform' in window.navigator.userAgentData
    ? window.navigator.userAgentData.platform.indexOf('mac') === 0
    : window.navigator.platform.indexOf('Mac') === 0;
export const isWindows = window.navigator.platform
    .toLowerCase()
    .startsWith('win');
export const getAttachForwardIndent = (forwardLevel, isNewForward = false) => {
    if (forwardLevel === 0) {
        return 0;
    }
    if (isNewForward) {
        // Всрато немного получается. 34пх это автатарка с отступом, 10пх отступ у бабла, 2пх ещё один Отступ
        // Только при таком расчете считается правильно размер и строится сетка
        return 34 + 10 * 2 - 2 * 2;
    }
    return 22 + (forwardLevel - 1) * 10;
};
export function getExpectedAttachWidth(isDense, isInBubble, forwardLevel, baseWidth) {
    const forwardIndent = getAttachForwardIndent(forwardLevel);
    const base = baseWidth + (!isInBubble ? 8 : 0) - forwardIndent;
    const pixelRatio = isDense
        ? typeof window !== 'undefined'
            ? window.devicePixelRatio
            : 2
        : 1;
    return [base, base * pixelRatio];
}
export const enRuKeysMap = {
    q: 'й',
    w: 'ц',
    e: 'у',
    r: 'к',
    t: 'е',
    y: 'н',
    u: 'г',
    i: 'ш',
    o: 'щ',
    p: 'з',
    '[': 'х',
    ']': 'ъ',
    a: 'ф',
    s: 'ы',
    d: 'в',
    f: 'а',
    g: 'п',
    h: 'р',
    j: 'о',
    k: 'л',
    l: 'д',
    ';': 'ж',
    "'": 'э',
    z: 'я',
    x: 'ч',
    c: 'с',
    v: 'м',
    b: 'и',
    n: 'т',
    m: 'ь',
    ',': 'б',
    '.': 'ю',
    '/': '.',
    [isMac ? '\\' : '`']: 'ё',
};
/**
 * Возвращает отображение нескольких пользователей со строковыми
 * разделителями: ', '/' и '/' и еще {n} пользователей'.
 * @param peers - пользователи, которые будут отображены вызовом peerRenderer
 * @param totalPeersCount - общее кол-во пользователей.
 * @param peerRenderer
 * @param lang
 */
export const getPeersInlineNames = (peers, totalPeersCount, peerRenderer, lang) => {
    const res = [];
    const getPeersSeparator = (index) => {
        if (index === peers.length - 1) {
            return '';
        }
        // Добрыня и Алеша
        // Добрыня, Алеша и Илья
        if (totalPeersCount === peers.length && index === peers.length - 2) {
            return ` ${lang.use('me_chat_members_last_divider')} `;
        }
        return ', ';
    };
    peers.forEach((peer, index) => {
        res.push(peerRenderer(peer), getPeersSeparator(index));
    });
    // Добрыня, Алеша, Илья и ещё 5 богатырей
    // 5 безымянных богатырей
    if (totalPeersCount > peers.length) {
        if (peers.length === 0) {
            res.push(lang.use('me_chat_members_count', {
                num: totalPeersCount - peers.length,
            }));
        }
        else {
            res.push(lang.use('me_chat_members_count_lots', {
                num: totalPeersCount - peers.length,
                values: {
                    names: '',
                },
            }));
        }
    }
    return res.length > 0 ? React.createElement(React.Fragment, null, res) : null;
};
export function getOrganiserUid(item) {
    switch (item.kind) {
        case 'filters':
            return item.filter;
        case 'folders':
            return item.id;
        case 'tags':
            return item.mask;
        default:
            exhaustivenessCheck(item);
    }
}
/**
 * Подготавливает сырой ввод номера телефона, чтобы awesome-phonenumber проще было распознать
 */
export function preparePhoneNumber(phone) {
    if (phone.length === 0) {
        return '';
    }
    let newValue = phone;
    //Если начали вводить 921...
    //То добавляем +7 в начале
    if (newValue[0] === '9') {
        newValue = '+7' + newValue;
    }
    //Если начали вводить 8921...
    //То меняем 8 на +7
    if (newValue[0] === '8') {
        newValue = '+7' + phone.slice(1);
    }
    //Если начали вводить не с +
    //То добавляем его в начало
    if (newValue[0] !== '+') {
        newValue = '+' + newValue;
    }
    return newValue;
}
export async function formatPhoneNumber(value) {
    const { parsePhoneNumber } = await import('awesome-phonenumber');
    // Добавляем плюс, если его нет в начале номера
    const result = parsePhoneNumber(value.replace(/^(\+|)+/, '+'));
    return {
        isValid: result.valid,
        international: result.number?.international ?? value,
        national: result.number?.national ?? value,
    };
}
/**
 * Проверка что значение является объектом
 * Основное отличие в тайп-гарде который нужен, и которого нет в других доступных пакетах
 */
export function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
export function download({ blob, filename, }) {
    const anchor = document.createElement('a');
    anchor.setAttribute('download', filename);
    const href = URL.createObjectURL(blob);
    anchor.setAttribute('href', href);
    anchor.setAttribute('target', '_blank');
    anchor.click();
    URL.revokeObjectURL(href);
}
export function isValidJSON(value) {
    if (!isString(value)) {
        return false;
    }
    try {
        JSON.parse(value);
        return true;
    }
    catch {
        return false;
    }
}
const vendorOrientationLockFn = window.screen.lockOrientation ||
    window.screen.mozLockOrientation ||
    window.screen.msLockOrientation;
/**
 * Фиксирует положение экрана.
 *
 * Не оказывает влияния на десктопы, т.к. на данных платформах
 * смена положения экрана не поддерживается.
 */
export async function lockScreenOrientation(orientation) {
    try {
        if (vendorOrientationLockFn?.(orientation))
            return;
        void (await window.screen.orientation?.lock?.(orientation));
        // Не прерываем работу приложения в случае, если устройство не поддерживает
        // данную операцию.
    }
    catch { }
}
const vendorOrientationUnlockFn = window.screen.unlockOrientation ||
    window.screen.mozUnlockOrientation ||
    window.screen.msUnlockOrientation;
/**
 * Разблокирует зафиксированное положение экрана.
 */
export function unlockScreenOrientation() {
    try {
        if (vendorOrientationUnlockFn?.())
            return;
        window.screen.orientation?.unlock?.();
        // Не прерываем работу приложения в случае, если устройство не поддерживает
        // данную операцию.
    }
    catch { }
}
export function isMouseEventWithModifier(event) {
    return (event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button === 1);
}
export function applySizeLimitations(width, height, maxWidth, maxHeight, minWidth, minHeight) {
    const ratio = width / height;
    // расчитываем высоту отталкиваясь от ширины
    let _width = Math.max(width, minWidth);
    _width = Math.min(_width, maxWidth);
    let _height = _width / ratio;
    _height = Math.max(_height, minHeight);
    _height = Math.min(_height, maxHeight);
    const ratio1 = _width / _height;
    const size1 = { height: _height, width: _width };
    // расчитываем ширину отталкиваясь от высоты
    let _height2 = Math.max(height, minHeight);
    _height2 = Math.min(_height2, maxHeight);
    let _width2 = _height2 * ratio;
    _width2 = Math.max(_width2, minWidth);
    _width2 = Math.min(_width2, maxWidth);
    const ratio2 = _width2 / _height2;
    const size2 = { height: _height2, width: _width2 };
    // считаем разницу в соотношениях сторон относительно оригинала
    const delta1 = Math.abs(1 - ratio / ratio1);
    const delta2 = Math.abs(1 - ratio / ratio2);
    // выбираем самое близкое к оригиналу
    return delta1 < delta2 ? size1 : size2;
}
export function isInputElementActive() {
    const activeEl = getActiveElement();
    if (!activeEl) {
        return false;
    }
    return (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable === true));
}
/**
 * @returns Находится ли интерактивный элемент, имеющий дефолтные обработчики в фокусе.
 */
export function isInteractiveElementActive() {
    const activeEl = getActiveElement();
    if (!activeEl) {
        return false;
    }
    /**
     * Ниже перечислены все элементы из
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#interactive_content
     * и еще несколько элементов, имеющих дефолтные обработчики клавиш.
     */
    return (isInputElementActive() ||
        [
            'A',
            'AUDIO',
            'VIDEO',
            'SUMMARY',
            'DETAILS',
            'IFRAME',
            'EMBED',
            'LABEL',
            'IMG',
            'OBJECT',
            'BUTTON',
            'OPTION',
            'SELECT',
        ].includes(activeEl.tagName));
}
export function getOwnerDocument(root) {
    return root?.ownerDocument || document;
}
export function getActiveElement(rootOrDocument) {
    let doc;
    switch (true) {
        case rootOrDocument instanceof Document:
        case rootOrDocument instanceof ShadowRoot:
            doc = rootOrDocument;
            break;
        case rootOrDocument instanceof Element:
            doc = getOwnerDocument(rootOrDocument);
            break;
        default:
            doc = document;
    }
    const activeElement = doc.activeElement;
    if (activeElement instanceof HTMLIFrameElement) {
        // В iframe'ах не всегда удаётся получить document, в некоторых случаях
        // вылетает ошибка, поэтому обрабатываем эти кейсы.
        try {
            const iframeDoc = activeElement.contentWindow?.document;
            if (iframeDoc)
                return getActiveElement(iframeDoc);
        }
        catch {
            return;
        }
    }
    return activeElement;
}
export function isTouchScreen() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
//# sourceMappingURL=misc.js.map