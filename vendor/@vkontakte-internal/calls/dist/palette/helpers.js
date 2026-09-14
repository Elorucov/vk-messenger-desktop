// This symbols will be encode from server
export const symbols = [
    ['&amp;', '&'],
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&quot;', '"'],
    ['&#33;', '!'],
];
export function decodeHTMLEntities(input) {
    const text = symbols.reduce((result, [mask, char]) => result.replace(new RegExp(mask, 'ig'), char), input);
    return text.replace(/&#(\d+);/g, (match, dec) => String.fromCodePoint(dec));
}
//# sourceMappingURL=helpers.js.map