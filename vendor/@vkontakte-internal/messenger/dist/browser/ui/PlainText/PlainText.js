import React from 'react';
import { Emoji } from '../../ui/Emoji/Emoji';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useTextFormatting } from '../../hooks/useTextFormatting';
export function PlainText({ chunks, multiline, formatData, }) {
    const formatting = useTextFormatting({
        formatData,
        linkRenderer: (url, content) => content,
        multiline,
    });
    return (React.createElement(React.Fragment, null, chunks.map((chunk, index) => {
        switch (chunk.kind) {
            case 'Text':
            case 'Mention':
            case 'MassMention':
            case 'ScreenNameMention':
            case 'Email':
            case 'Url':
            case 'Hashtag':
            case 'HashtagMention':
                return formatting.byChunk(chunk);
            case 'Emoji': {
                formatting.byChunk(chunk);
                return React.createElement(Emoji, { emoji: chunk.text, key: index });
            }
            case 'Code': {
                formatting.byChunk(chunk);
                return multiline ? chunk.text : chunk.text.replace(/\n/g, ' ');
            }
            case 'LineBreak': {
                formatting.byChunk(chunk);
                return multiline ? '\n' : ' ';
            }
            default:
                return exhaustivenessCheck(chunk);
        }
    })));
}
//# sourceMappingURL=PlainText.js.map