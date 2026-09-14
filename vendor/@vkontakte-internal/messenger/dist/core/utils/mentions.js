export function isMentionContent(str) {
    return str
        .split('')
        .every((char) => /[\d_]/.test(char) ||
        char.toLocaleLowerCase() !== char.toLocaleUpperCase());
}
//# sourceMappingURL=mentions.js.map