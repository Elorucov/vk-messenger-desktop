const UPPERCASE_PATTERN = /([A-Z])/g;
const cache = new Map();
/**
 * Преобразует jsx название свойства стиля в css-формат
 *
 * @example hyphenateStyleName('maxWidth') // max-width
 */
export const hyphenateStyleName = (name) => {
    const cachedValue = cache.get(name);
    if (cachedValue) {
        return cachedValue;
    }
    let hyphenatedName = name.replace(UPPERCASE_PATTERN, '-$1').toLowerCase();
    if (hyphenatedName.startsWith('ms-')) {
        hyphenatedName = `-${hyphenatedName}`;
    }
    cache.set(name, hyphenatedName);
    return hyphenatedName;
};
//# sourceMappingURL=hyphenateStyleName.js.map