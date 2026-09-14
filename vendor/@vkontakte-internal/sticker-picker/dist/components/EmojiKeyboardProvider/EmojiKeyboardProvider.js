import { jsx as _jsx } from "react/jsx-runtime";
import { useStore } from 'effector-react';
import { useEffect, useState } from 'react';
import { sections } from './sections';
import { $isVisible } from '../../model/visible';
import { setRecentEmoji } from '../../model/emoji/recent';
import { setSelectedEmoji } from '../../model/emoji/selected';
import { useAPI } from '../../hooks/api';
import { EmojiKeyboardContext } from '../../hooks/emojiKeyboard';
export const EMOJI_SIZE = 16;
export function EmojiKeyboardProvider({ onEmojiInsert, ...props }) {
    const api = useAPI();
    const isVisible = useStore($isVisible);
    const parseRecentEmoji = (recentEmoji) => {
        if (!recentEmoji) {
            return [];
        }
        return recentEmoji.sort(([, a], [, b]) => b - a).map(([emoji]) => emoji);
    };
    const [rawEmojiSections, setRawEmojiSections] = useState(Object.entries({
        stickers_picker_recently_used: parseRecentEmoji(api.cache.recentEmoji.get()),
        ...sections,
    }));
    const emojiSections = rawEmojiSections.filter(([, items]) => items.length);
    const readCache = async () => {
        const recentEmoji = api.cache.recentEmoji.get();
        if (!recentEmoji) {
            return;
        }
        setRecentEmoji(recentEmoji);
        setRawEmojiSections((sections) => {
            sections[0][1] = parseRecentEmoji(recentEmoji);
            return sections;
        });
    };
    useEffect(() => {
        if (isVisible) {
            return;
        }
        readCache();
        setSelectedEmoji(null);
    }, [api, isVisible]);
    return (_jsx(EmojiKeyboardContext.Provider, { value: {
            emojiSections,
            onEmojiInsert,
        }, ...props }));
}
//# sourceMappingURL=EmojiKeyboardProvider.js.map