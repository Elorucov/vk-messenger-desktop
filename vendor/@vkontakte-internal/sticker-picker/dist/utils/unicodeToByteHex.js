export function unicodeToByteHex(symbol) {
    return encodeURIComponent(symbol.replace(/\uFE0F/giu, ''))
        .replace(/%/gi, '')
        .toLowerCase();
}
//# sourceMappingURL=unicodeToByteHex.js.map