import { createContext, useContext } from 'react';
import { setRecentEmoji } from '../model/emoji/recent';
import { useAPI } from './api';
export const EmojiKeyboardContext = createContext({});
const MAX_RECENT_EMOJI_COUNT = 50;
export function useEmojiKeyboard() {
    const api = useAPI();
    const emojiKeyboardContext = useContext(EmojiKeyboardContext);
    const { onEmojiInsert } = emojiKeyboardContext;
    const addRecentEmoji = (emoji) => {
        const recentEmojiUsage = new Map(api.cache.recentEmoji.get());
        const currentUsageCounter = recentEmojiUsage.get(emoji) || 0;
        recentEmojiUsage.set(emoji, currentUsageCounter + 1);
        const updatedRecentEmoji = [...recentEmojiUsage].reverse().slice(0, MAX_RECENT_EMOJI_COUNT);
        setRecentEmoji(updatedRecentEmoji);
        api.cache.recentEmoji.set(updatedRecentEmoji);
    };
    const insertEmoji = (emoji) => {
        onEmojiInsert?.(emoji);
        addRecentEmoji(emoji);
    };
    return {
        ...emojiKeyboardContext,
        insertEmoji,
    };
}
//# sourceMappingURL=emojiKeyboard.js.map