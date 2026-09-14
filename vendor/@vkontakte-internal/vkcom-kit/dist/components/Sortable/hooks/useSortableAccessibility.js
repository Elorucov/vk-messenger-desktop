import { moveArrayElement } from '@vkontakte-internal/utils';
import { useRef } from 'react';
export const useSortableAccessibility = ({ items, onSortChange, accessibility, setAnnouncement, }) => {
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const selectedIdRef = useRef(undefined);
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const selectedInitialIndexRef = useRef(undefined);
    const onKeyDown = (event) => {
        const { code, target } = event;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        const targetId = target.dataset.sortableId;
        if (!targetId) {
            return;
        }
        const selectedId = selectedIdRef.current;
        const selectedIndex = items.findIndex(({ id }) => id === selectedId);
        let selectedInitialIndex = selectedInitialIndexRef.current;
        let newIndex = selectedIndex;
        if (selectedInitialIndex === undefined && selectedId !== undefined) {
            selectedInitialIndex = selectedIndex;
            selectedInitialIndexRef.current = selectedIndex;
        }
        switch (code) {
            // Поднятие/отпускание перетаскиваемого элемента
            case 'Space':
                if (targetId === selectedId) {
                    selectedIdRef.current = undefined;
                    selectedInitialIndexRef.current = undefined;
                    if (accessibility) {
                        setAnnouncement(accessibility.onDragEnd({
                            active: items[selectedIndex],
                            over: items[selectedIndex - 1],
                        }));
                    }
                }
                else {
                    selectedIdRef.current = targetId;
                    if (accessibility) {
                        setAnnouncement(accessibility.onDragStart({
                            active: items[items.findIndex(({ id }) => id === selectedIdRef.current)],
                        }));
                    }
                }
                break;
            // Отмена перемещения и возврат элемента на исходную позицию
            case 'Tab':
            case 'Escape':
                if (selectedId === undefined) {
                    break;
                }
                selectedIdRef.current = undefined;
                selectedInitialIndexRef.current = undefined;
                if (selectedInitialIndex !== undefined) {
                    onSortChange(moveArrayElement({ items, from: selectedIndex, to: selectedInitialIndex }));
                }
                if (accessibility) {
                    setAnnouncement(accessibility.onDragCancel());
                }
                break;
            // Перемещение элемента в начало списка
            case 'ArrowLeft':
            case 'ArrowUp':
                if (selectedId === undefined ||
                    (target.previousElementSibling instanceof HTMLElement &&
                        !target.previousElementSibling.dataset.sortableItem)) {
                    break;
                }
                newIndex--;
                break;
            // Перемещение элемента в конец списка
            case 'ArrowRight':
            case 'ArrowDown':
                if (selectedId === undefined ||
                    (target.nextElementSibling instanceof HTMLElement &&
                        !target.nextElementSibling.dataset.sortableItem)) {
                    break;
                }
                newIndex++;
                break;
        }
        event.stopPropagation();
        if (newIndex < 0 || newIndex >= items.length || newIndex === selectedIndex) {
            return;
        }
        const reorderedArray = moveArrayElement({ items, from: selectedIndex, to: newIndex });
        onSortChange(reorderedArray);
        if (accessibility) {
            setAnnouncement(accessibility.onDragOver({
                active: reorderedArray[newIndex],
                over: reorderedArray[newIndex - 1],
            }));
        }
    };
    return {
        onKeyDown,
    };
};
//# sourceMappingURL=useSortableAccessibility.js.map