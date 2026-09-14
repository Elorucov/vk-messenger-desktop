import { useEffect } from 'react';
import { useStore } from 'effector-react';
import { $selectedEmojiPackIndex, setSelectedEmojiPackIndex } from '../model/emoji/selectedEmojiPackIndex';
export const useCalculateSelectedEmojiPackIndex = (virtualizer, headerIndexes) => {
    const { range } = virtualizer;
    const selectedEmojiPackIndex = useStore($selectedEmojiPackIndex);
    useEffect(() => {
        const range = virtualizer.calculateRange();
        if (!range) {
            return;
        }
        const { startIndex } = range;
        const nextCategoryHeaderIndex = headerIndexes.findIndex((index) => index >= startIndex);
        const currentCategoryHeaderIndex = nextCategoryHeaderIndex - 1;
        const nextCategoryHeader = headerIndexes[nextCategoryHeaderIndex];
        const currentCategoryHeader = headerIndexes[currentCategoryHeaderIndex];
        const rowsAfterCurrentHeader = Math.abs(currentCategoryHeader - startIndex);
        const rowsBeforeNextHeader = Math.abs(nextCategoryHeader - startIndex);
        const closestHeaderIndex = rowsAfterCurrentHeader < rowsBeforeNextHeader ? currentCategoryHeaderIndex : nextCategoryHeaderIndex;
        if (selectedEmojiPackIndex !== closestHeaderIndex) {
            setSelectedEmojiPackIndex(closestHeaderIndex);
        }
    }, [range, headerIndexes]);
};
//# sourceMappingURL=useCalculateSelectedEmojiPackIndex.js.map