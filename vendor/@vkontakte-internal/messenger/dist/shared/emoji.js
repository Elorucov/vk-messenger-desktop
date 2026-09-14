import { unicodeToByteHex } from '@vkontakte-internal/sticker-picker/dist/utils/unicodeToByteHex';
// 1x1 прозрачная гифка
export const emptyImage = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const supportedEmojiCache = new Map();
/**
 * Проверяет, доступен ли эмодзи для отображения через наши спрайты.
 *
 * На M1 маке обычно это занимает меньше 0.01 мс, но в редких случаях
 * одна проверка из пачки одновременных проверок может занимать до 0.2 мс.
 *
 * Однако не исключены ситуации, когда первая проверка может занять целые
 * значения мс, но предположительно это происходит из-за массивного рендеринга
 * другого контента и влияния на время рендера конкретно из-за этой проверки
 * быть не должно
 */
export function checkEmojiSupportViaCss(img) {
    const { backgroundImage } = window.getComputedStyle(img);
    const isSupported = backgroundImage !== '' && backgroundImage !== 'none';
    supportedEmojiCache.set(img.alt, isSupported);
    return isSupported;
}
export function getEmojiSupportFromCache(emoji) {
    if (!supportedEmojiCache.has(emoji)) {
        return 'unknown';
    }
    return supportedEmojiCache.get(emoji) ? 'supported' : 'unsupported';
}
/**
 * Создает img-элемент, если эмодзи поддержан в спрайтах,
 * либо текстовую ноду с эмодзи, чтобы его отрендерить средствами браузера
 */
export function createEmojiElement(emoji) {
    const img = document.createElement('img');
    img.classList.add('Emoji', '@' + unicodeToByteHex(emoji));
    img.src = emptyImage;
    img.alt = emoji;
    let isEmojiSupported;
    if (supportedEmojiCache.has(emoji)) {
        isEmojiSupported = !!supportedEmojiCache.get(emoji);
    }
    else {
        document.head.appendChild(img);
        isEmojiSupported = checkEmojiSupportViaCss(img);
        img.remove();
    }
    if (!isEmojiSupported) {
        return document.createTextNode(emoji);
    }
    return img;
}
//# sourceMappingURL=emoji.js.map