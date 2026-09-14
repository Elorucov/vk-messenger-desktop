import { v4 } from 'uuid';
export const getVirtualItemIndex = (virtualRowIndex, virtualColumnIndex, countInLine, rowsOffset = 0) => {
    return (virtualRowIndex - rowsOffset) * countInLine + virtualColumnIndex;
};
export const generateVirtualItemKey = (rowIndex, columnIndex, itemId = '') => {
    const id = itemId || v4();
    return `${rowIndex}-${columnIndex}-${id}`;
};
//# sourceMappingURL=helpers.js.map