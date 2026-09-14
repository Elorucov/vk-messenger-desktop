import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"CustomScrollView":["@vkontakte-internal/vkcom-kit",{"className":1}],"div":["global",{"className":2,"style":2}]} */
import { useStore } from 'effector-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { chunkArray, classNames } from '@vkontakte/vkjs';
import { useEffect, useMemo, useRef } from 'react';
import { CustomScrollView } from '@vkontakte-internal/vkcom-kit';
import { ViewItem } from '../View/ViewItem/ViewItem';
import { EmojiKeyboardRow } from '../EmojiKeyboardRow/EmojiKeyboardRow';
import { EMOJI_SIZE } from '../EmojiKeyboardProvider/EmojiKeyboardProvider';
import { EmojiKeyboardHeader } from '../EmojiKeyboardHeader/EmojiKeyboardHeader';
import { $emojiPadding } from '../../model/emoji/variant';
import { $selectedEmojiPackIndex } from '../../model/emoji/selectedEmojiPackIndex';
import { useGrid } from '../../hooks/grid';
import { Tab } from '../../utils/cache/types';
import { useSticky } from '../../hooks/sticky';
import { useScrollView } from '../../hooks/scrollView';
import { useKeyboardEvent } from './hooks/keyboardEvent';
import { useEmojiKeyboard } from '../../hooks/emojiKeyboard';
import { useAvatarSuggestion } from '../../hooks/useAvatarSuggestion';
import { EmojiKeyboardElementType } from './types';
import { useCalculateSelectedEmojiPackIndex } from '../../hooks/useCalculateSelectedEmojiPackIndex';
import styles from './EmojiKeyboard.module.css';
export function EmojiKeyboard({ className, ...props }) {
    const { emojiSections, insertEmoji } = useEmojiKeyboard();
    const { bannerPackIndex, getAvatarSuggestionEmojiRow, avatarSuggestion, avatarSuggestionTab } = useAvatarSuggestion();
    const emojiPadding = useStore($emojiPadding);
    const selectedEmojiPackIndex = useStore($selectedEmojiPackIndex);
    const ref = useRef(null);
    const { setGridRef, columns } = useGrid({
        tab: Tab.EMOJI,
        itemWidth: EMOJI_SIZE + emojiPadding,
    });
    const rows = useMemo(() => {
        const rows = [];
        emojiSections.forEach(([key, emoji], index) => {
            rows.push({
                type: EmojiKeyboardElementType.HEADER,
                element: _jsx(EmojiKeyboardHeader, { title: key }, key),
                sticky: true,
            });
            if ((!bannerPackIndex && index === selectedEmojiPackIndex) || bannerPackIndex === index) {
                const avatarSuggestionStickerRow = getAvatarSuggestionEmojiRow(selectedEmojiPackIndex);
                if (avatarSuggestionStickerRow) {
                    rows.push(avatarSuggestionStickerRow);
                }
            }
            chunkArray(emoji, columns).forEach((emoji, rowIndex) => {
                rows.push({
                    type: EmojiKeyboardElementType.ROW,
                    element: (_jsx(EmojiKeyboardRow, { "data-section-index": index, "data-row-index": rowIndex, emoji: emoji, onEmojiClick: insertEmoji }, `${key}${emoji[0]}`)),
                });
            });
        });
        return rows;
    }, [columns, emojiSections, avatarSuggestion]);
    const headerIndexes = useMemo(() => rows.reduce((headerIndexes, { type }, index) => {
        if (type === EmojiKeyboardElementType.HEADER) {
            headerIndexes.push(index);
        }
        return headerIndexes;
    }, []), [rows]);
    const isHeader = (index) => headerIndexes.includes(index);
    const { rangeExtractor, isSticky } = useSticky({
        rows,
    });
    const virtualizer = useVirtualizer({
        overscan: 5,
        rangeExtractor,
        count: rows.length,
        getScrollElement: () => ref.current,
        estimateSize: () => EMOJI_SIZE,
    });
    useScrollView(ref);
    useKeyboardEvent({
        columns,
        virtualizer,
        headerIndexes,
    });
    useCalculateSelectedEmojiPackIndex(virtualizer, headerIndexes);
    useEffect(() => {
        if (bannerPackIndex !== null && avatarSuggestionTab === Tab.EMOJI && headerIndexes[bannerPackIndex]) {
            virtualizer.scrollToIndex(headerIndexes[bannerPackIndex], {
                align: 'start',
                behavior: 'auto',
            });
        }
    }, [bannerPackIndex]);
    const virtualItems = virtualizer.getVirtualItems().filter(Boolean);
    return (_jsx(ViewItem, { getRef: setGridRef, className: classNames(styles.keyboard, className), style: {
            '--emoji-size': `${EMOJI_SIZE}px`,
            '--emoji-padding': `${emojiPadding}px`,
            '--emoji-columns': columns,
        }, ...props, children: _jsx(CustomScrollView, { getRootRef: ref, className: styles.scroll, overscrollBehavior: "none", children: _jsx("div", { className: styles.in, style: {
                    height: virtualizer.getTotalSize(),
                }, children: virtualItems.map(({ key, index, start }) => (_jsx("div", { "data-index": index, ref: virtualizer.measureElement, className: classNames(styles.item, {
                        [styles.itemHeader]: isHeader(index),
                    }), style: isSticky(index)
                        ? {
                            position: 'sticky',
                        }
                        : {
                            position: 'absolute',
                            transform: `translateY(${start}px)`,
                        }, children: rows[index].element }, key))) }) }) }));
}
//# sourceMappingURL=EmojiKeyboard.js.map