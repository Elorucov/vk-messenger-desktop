import { useCallback, useEffect, useState } from 'react';
import { VkIndexer } from '@vkontakte-internal/vkjs/lib/Indexer';
/**
 * @TODO: use version from vkjs when it's up
 *
 * @param newList Array<{}>
 * @param indexKeyFn Function для определения поля объекта, по которому будет совершаться поиск
 * @param indexIdFn Function для определения поля объекта, которое будет использоваться в качестве индекса
 */
export const useIndexer = (newList, indexKeyFn, indexIdFn) => {
    const [indexer] = useState(() => new VkIndexer(newList, indexKeyFn));
    const listMapper = useCallback((list) => list.reduce((acc, item) => {
        acc[indexIdFn(item)] = true;
        return acc;
    }, {}), [indexIdFn]);
    const [list, setList] = useState(newList);
    const [listMap, setListMap] = useState(listMapper(newList));
    useEffect(() => {
        const newListMap = listMapper(newList);
        const addedItems = newList.filter((item) => !listMap[indexIdFn(item)]);
        const removedItems = list.filter((item) => !newListMap[indexIdFn(item)]);
        if (addedItems.length || removedItems.length) {
            addedItems.forEach((item) => {
                indexer.add(item);
            });
            removedItems.forEach((item) => {
                indexer.remove(item);
            });
            setList(newList);
            setListMap(newListMap);
        }
    }, [newList]);
    return indexer;
};
//# sourceMappingURL=useIndexer.js.map