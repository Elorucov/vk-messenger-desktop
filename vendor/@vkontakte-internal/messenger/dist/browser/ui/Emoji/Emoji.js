import '../../ui/Emoji/Emoji.css';
import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { unicodeToByteHex } from '@vkontakte-internal/sticker-picker/dist/utils/unicodeToByteHex';
import cx from 'classnames';
import { checkEmojiSupportViaCss, emptyImage, getEmojiSupportFromCache, } from '../../../shared/emoji';
export const Emoji = ({ emoji }) => {
    const [isEmojiSupported, setEmojiSupported] = useState(true);
    const renderCustomEmoji = useContext(RenderCustomEmojiContext);
    const $emoji = useRef(null);
    useLayoutEffect(() => {
        if (!$emoji.current) {
            return;
        }
        const emojiSupport = getEmojiSupportFromCache(emoji);
        const isEmojiSupported = emojiSupport !== 'unknown'
            ? emojiSupport === 'supported'
            : checkEmojiSupportViaCss($emoji.current);
        setEmojiSupported(isEmojiSupported);
    }, [emoji]);
    if (!renderCustomEmoji || !isEmojiSupported) {
        return React.createElement(React.Fragment, null, emoji);
    }
    /** На эту верстку есть завязка в регулярке внутри ComposerEditor->getHtmlWithEmojisAsText */
    return (React.createElement("img", { src: emptyImage, alt: emoji, className: cx('Emoji', '@' + unicodeToByteHex(emoji)), onError: () => setEmojiSupported(false), ref: $emoji }));
};
const RenderCustomEmojiContext = React.createContext(true);
export const RenderCustomEmojiProvider = RenderCustomEmojiContext.Provider;
//# sourceMappingURL=Emoji.js.map