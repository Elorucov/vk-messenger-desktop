import { useUpdateEffect } from '@vkontakte-internal/react-utils';
import { useState } from 'react';
import { useSelectedState } from './useSelectedState';
/**
 * Хук, описывающий поведение группы в режиме выпадающего списка (dropdown):
 * - Группа развернута, если выделен один из ее дочерних элементов;
 * - Также, группа разворачивается/сворачивается при клике на корневом элементе группы,
 *   если он уже выделен;
 * - Группа сворачивается, когда теряет выделение;
 */
export function useDropdownExpandedState(id, items, selectedId, defaultExpanded) {
    const isRootSelected = id === selectedId;
    const isActive = useSelectedState(id, items, selectedId);
    const isChildSelected = isActive && !isRootSelected;
    const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? isChildSelected);
    useUpdateEffect(() => {
        if (isChildSelected) {
            setIsExpanded(true);
        }
        else if (!isActive) {
            setIsExpanded(false);
        }
    }, [isActive, isChildSelected]);
    const handleToggle = () => {
        if (isRootSelected) {
            // Переключаем состояние группы только если главный элемент выделен
            setIsExpanded((expanded) => !expanded);
        }
    };
    return [isExpanded, handleToggle];
}
//# sourceMappingURL=useDropdownExpandedState.js.map