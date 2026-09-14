import { hyphenateStyleName } from '../../../utils/hyphenateStyleName';
export const serializeMediaQuery = (mediaQuery) => {
    return Object.entries(mediaQuery)
        .map(([key, value]) => {
        key = hyphenateStyleName(key);
        if (value === true) {
            return key;
        }
        if (value === false) {
            return `not ${key}`;
        }
        if (typeof value === 'number') {
            value = `${value}px`;
        }
        return `(${key}: ${value})`;
    })
        .join(' and ');
};
//# sourceMappingURL=serializeMediaQuery.js.map