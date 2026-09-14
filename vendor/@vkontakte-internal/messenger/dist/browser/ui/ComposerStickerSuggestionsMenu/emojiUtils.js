import { skinToneModifierRegex } from './emojiConstants';
import { toTextAndEmojiChunks } from '../../../core/utils/emoji';
import { exhaustivenessCheck } from '../../../core/utils/misc';
function removeSkinToneModifier(symbol) {
    return symbol.replace(skinToneModifierRegex, '');
}
export function emojiRemoveSkinToneModifiers(str) {
    const chunks = toTextAndEmojiChunks(str);
    return chunks.reduce((text, chunk) => {
        switch (chunk.kind) {
            case 'Text':
                return text + chunk.text;
            case 'Emoji':
                return text + removeSkinToneModifier(chunk.text);
            default:
                return exhaustivenessCheck(chunk);
        }
    }, '');
}
function splitByPairs(str) {
    return str
        .split('')
        .reduce((acc, item, i) => {
        const check = (i + 1) % 2 === 0;
        return acc + item + (check ? ' ' : '');
    }, '')
        .trim()
        .split(/\s+/);
}
export function emojiByteHexToSymbol(code) {
    const prefixed = code.length % 2 === 1;
    const prefix = prefixed ? code.slice(0, 1) : '';
    const encoded = prefixed ? code.slice(1) : code;
    let res = '';
    try {
        res = decodeURIComponent('%' + splitByPairs(encoded).join('%'));
    }
    catch { }
    return prefix + res;
}
//# sourceMappingURL=emojiUtils.js.map