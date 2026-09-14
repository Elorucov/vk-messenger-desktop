import React from 'react';
import { toTextAndEmojiChunks } from '../../../core/utils/emoji';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { Emoji } from '../../ui/Emoji/Emoji';
export const TextWithEmoji = React.memo(({ text }) => {
    const chunks = toTextAndEmojiChunks(text);
    return (React.createElement(React.Fragment, null, chunks.map((chunk, index) => {
        switch (chunk.kind) {
            case 'Text':
                return chunk.text;
            case 'Emoji':
                return React.createElement(Emoji, { emoji: chunk.text, key: index });
            default:
                return exhaustivenessCheck(chunk);
        }
    })));
});
//# sourceMappingURL=TextWithEmoji.js.map