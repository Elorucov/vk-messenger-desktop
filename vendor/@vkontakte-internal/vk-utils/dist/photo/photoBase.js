/**
 * Внутренний хэлпер. Как String.prototype.split(), но с той разницей, что весь хвост останется во втором элементе массива
 * @private
 * @example
 *   splitAtFirst('http://u.rl/?foo?bar', '?'); // => ['http://u.rl/', 'foo?bar']
 *   splitAtFirst('http://u.rl/?foo?bar', '_'); // => ['http://u.rl/?foo?bar', '']
 *   splitAtFirst('foobarbaz', 'bar'); // => ['foo', 'baz']
 */
function splitAtFirst(input, separator) {
    const index = input.indexOf(separator);
    return index === -1 ? [input, ''] : [input.slice(0, index), input.slice(index + separator.length)];
}
/**
 * Подготавливает базовую ссылку на изображение для получения ближайшего к указанному (width) по размерной сетке.
 *
 * Выбор ближайшего из сетки: 300 и 600, если передать 450, то выберется 300 (как ближайший), если передать 451, то тут уже выберется 600.
 * Выбор для больших размеров, например для сетки: 100, 200, 300, если не указывать или указать размер 100500, то вернется изображение размером 300, как самое большое.
 *
 * @param basePhotoUrl
 * @param width размер масштабируется только по ширине (указанный в ссылке параметр высоты не влияет на результат)
 * @param pixelRatio множитель плотности пикселей (по умолчанию 1)
 *
 * @see https://confluence.vk.team/display/VD/Base+URL
 */
export function prepareBasePhotoUrl(basePhotoUrl, width, pixelRatio = 1) {
    const [hashless, hash] = splitAtFirst(basePhotoUrl, '#');
    let [baseUrl, query] = splitAtFirst(hashless, '?');
    // Search-параметрами URL манипулируем через строки, чтобы не поменять %-encoding для "unwise" символов.
    // От появления энкодинга там где его не было у нас ломается валидация сигнатуры на некоторых эндпоинтах.
    const csParamPattern = /(^|\?|&)cs(?:=[^&]*)?(\?|&|$)/;
    while (csParamPattern.test(query)) {
        query = query.replace(csParamPattern, (_, delim, hasNext) => (hasNext ? delim : ''));
    }
    if (width) {
        const size = Math.round(width * Math.max(1, pixelRatio));
        const csParam = `cs=${size}x${size}`;
        query = query ? `${query}&${csParam}` : csParam;
    }
    return `${baseUrl}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
}
//# sourceMappingURL=photoBase.js.map