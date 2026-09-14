/**
 * Меняет порядок элементов сдвигом влево, т. е. первый элемент станет последним, второй первыми т. д.
 * [0, 1, 2] => [1, 2, 0]
 */
export const turnItems = (items) => {
    const newItems = [...items];
    if (newItems.length > 1) {
        const first = newItems.shift();
        newItems.push(first);
    }
    return newItems;
};
//# sourceMappingURL=utils.js.map