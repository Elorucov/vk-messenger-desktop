const normalizeIndex = (index, length) => (index >= 0 ? index : length + index);
/**
 * Перемещает элементы массива, изменяя исходный массив
 */
const moveArrayElementMutable = ({ items, from, to }) => {
    if (!items.length) {
        return;
    }
    const start = normalizeIndex(from, items.length);
    const end = normalizeIndex(to, items.length);
    if (start === end) {
        return;
    }
    items.splice(end, 0, ...items.splice(from, 1));
};
/**
 * Перемещает элементы массива, возвращая новый массив
 */
export const moveArrayElement = ({ items, from, to }) => {
    const copy = [...items];
    moveArrayElementMutable({ items: copy, from, to });
    return copy;
};
//# sourceMappingURL=moveArrayElement.js.map