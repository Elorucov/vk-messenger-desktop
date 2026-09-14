import * as TextChunk from '../model/TextChunk';
import { exhaustivenessCheck } from '../utils/misc';
export function toTextAndEmojiChunks(text) {
    const chunks = TextChunk.fromClientText(text);
    return chunks.reduce((acc, chunk, index) => {
        const prevChunk = acc[index - 1];
        const newChunk = chunk.kind === 'Emoji'
            ? { kind: 'Emoji', text: chunk.text }
            : { kind: 'Text', text: TextChunk.toRawText([chunk]) };
        if (newChunk.kind === 'Text' && prevChunk?.kind === 'Text') {
            prevChunk.text += newChunk.text;
        }
        else {
            acc.push(newChunk);
        }
        return acc;
    }, []);
}
export function getFirstEmojiFromString(str) {
    const emojiChunk = TextChunk.fromClientText(str).find((chunk) => chunk.kind === 'Emoji');
    if (emojiChunk) {
        return emojiChunk.text;
    }
    return undefined;
}
/**
 * Вычисляет длину строки с учётом emoji.
 * Считает emoji как один символ
 * @param useRealEmojiLength считает реальную длину эмоджи, а не как один символ
 */
export function getLengthWithEmoji(str, useRealEmojiLength) {
    const chunks = toTextAndEmojiChunks(str);
    return chunks.reduce((length, chunk) => {
        switch (chunk.kind) {
            case 'Text':
                return length + chunk.text.length;
            case 'Emoji':
                return length + (useRealEmojiLength ? chunk.text.length : 1);
            default:
                return exhaustivenessCheck(chunk);
        }
    }, 0);
}
export function hasEmoji(str) {
    const chunks = TextChunk.fromClientText(str);
    return chunks.some((chunk) => chunk.kind === 'Emoji');
}
//# sourceMappingURL=emoji.js.map