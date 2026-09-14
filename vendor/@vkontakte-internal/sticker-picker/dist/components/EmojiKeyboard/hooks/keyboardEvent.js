import { useEffect } from 'react';
import { useStore } from 'effector-react';
import { $isVisible } from '../../../model/visible';
import { $visibleTabState } from '../../../model/visibleTab';
import { $tabbarActiveTabState } from '../../../model/tabbarActiveTab';
import { $selectedEmoji, setSelectedEmoji } from '../../../model/emoji/selected';
import { useEmojiKeyboard } from '../../../hooks/emojiKeyboard';
var KeyboardKey;
(function (KeyboardKey) {
    KeyboardKey["ENTER"] = "Enter";
    KeyboardKey["ARROW_UP"] = "ArrowUp";
    KeyboardKey["ARROW_DOWN"] = "ArrowDown";
    KeyboardKey["ARROW_LEFT"] = "ArrowLeft";
    KeyboardKey["ARROW_RIGHT"] = "ArrowRight";
})(KeyboardKey || (KeyboardKey = {}));
const keyboardKeys = Object.values(KeyboardKey);
export function useKeyboardEvent({ columns, virtualizer, headerIndexes }) {
    const { emojiSections, insertEmoji } = useEmojiKeyboard();
    const isVisible = useStore($isVisible);
    const selectedEmoji = useStore($selectedEmoji);
    const { isEmojiVisibleTab } = useStore($visibleTabState);
    const { isEmojiActiveTab } = useStore($tabbarActiveTabState);
    const selectedEmojiIndex = selectedEmoji?.emojiIndex || 0;
    const selectedEmojiSectionIndex = selectedEmoji?.sectionIndex || 0;
    const selectedEmojiRowIndex = Math.floor(selectedEmojiIndex / columns);
    const selectEmoji = (sectionIndex, emojiIndex) => {
        const index = headerIndexes[selectedEmojiSectionIndex] + selectedEmojiRowIndex;
        virtualizer.scrollToIndex(index, {
            align: 'center',
            behavior: 'auto',
        });
        setSelectedEmoji({
            sectionIndex,
            emojiIndex,
        });
    };
    const cancelKeyboardEvent = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };
    useEffect(() => {
        if (!isVisible) {
            return;
        }
        const keydownHandler = (event) => {
            const { key } = event;
            const position = selectedEmoji;
            if (!keyboardKeys.includes(key) || (!isEmojiVisibleTab && !isEmojiActiveTab)) {
                return;
            }
            cancelKeyboardEvent(event);
            if (!position) {
                selectEmoji(0, 0);
                return;
            }
            switch (key) {
                case KeyboardKey.ENTER: {
                    if (!selectedEmoji) {
                        return;
                    }
                    const { sectionIndex, emojiIndex } = selectedEmoji;
                    const emoji = emojiSections[sectionIndex]?.[1][emojiIndex];
                    if (emoji) {
                        insertEmoji(emoji);
                    }
                    return;
                }
                case KeyboardKey.ARROW_UP: {
                    if (!selectedEmoji) {
                        return;
                    }
                    if (Number(position.emojiIndex) >= columns) {
                        selectEmoji(position.sectionIndex, position.emojiIndex - columns);
                        return;
                    }
                    if (position.sectionIndex) {
                        const prevSectionLength = emojiSections[position.sectionIndex - 1]?.[1].length || 0;
                        // Секция недавних эмодзи может быть пустой
                        if (prevSectionLength) {
                            const currentColumn = position.emojiIndex % columns;
                            const prevLastIndex = prevSectionLength - 1;
                            const prevMaxColumn = prevLastIndex % columns;
                            const index = prevLastIndex - (prevLastIndex % columns) + Math.min(currentColumn, prevMaxColumn);
                            selectEmoji(position.sectionIndex - 1, index);
                        }
                    }
                    return;
                }
                case KeyboardKey.ARROW_DOWN: {
                    const sectionLength = emojiSections[position.sectionIndex]?.[1].length || 0;
                    // Если текущий эмодзи не находится на последней строке
                    if (position.emojiIndex - (position.emojiIndex % columns) !==
                        sectionLength - 1 - ((sectionLength - 1) % columns)) {
                        selectEmoji(position.sectionIndex, Math.min(position.emojiIndex + columns, sectionLength - 1));
                        return;
                    }
                    if (position.sectionIndex !== emojiSections.length - 1) {
                        selectEmoji(position.sectionIndex + 1, position.emojiIndex % columns);
                    }
                    return;
                }
                case KeyboardKey.ARROW_LEFT: {
                    if (position.emojiIndex) {
                        selectEmoji(position.sectionIndex, position.emojiIndex - 1);
                        return;
                    }
                    if (position.sectionIndex) {
                        const prevSectionLength = emojiSections[position.sectionIndex - 1]?.[1].length || 0;
                        // Секция недавних эмодзи может быть пустой
                        if (prevSectionLength) {
                            selectEmoji(position.sectionIndex - 1, prevSectionLength - 1);
                        }
                    }
                    return;
                }
                case KeyboardKey.ARROW_RIGHT: {
                    const sectionLength = emojiSections[position.sectionIndex]?.[1].length || 0;
                    if (position.emojiIndex !== sectionLength - 1) {
                        selectEmoji(position.sectionIndex, position.emojiIndex + 1);
                        return;
                    }
                    if (position.sectionIndex !== emojiSections.length - 1) {
                        selectEmoji(position.sectionIndex + 1, 0);
                    }
                    return;
                }
            }
        };
        window.addEventListener('keydown', keydownHandler);
        return () => {
            window.removeEventListener('keydown', keydownHandler);
        };
    }, [isVisible, isEmojiActiveTab, isEmojiVisibleTab, selectedEmoji, emojiSections]);
}
//# sourceMappingURL=keyboardEvent.js.map