import { useState } from 'react';
import { useSelectedState } from './useSelectedState';
/**
 * Хук, определяющий поведение группы в режиме аккордеона:
 * - Группа сворачивается/разворачивается по клику на корневом элементе группы;
 * - Корневой элемент группы выделить нельзя;
 */
export function useAccordionExpandedState(id, items, selectedId, defaultExpanded) {
    const isSelected = useSelectedState(id, items, selectedId);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? isSelected);
    const handleToggle = () => {
        setIsExpanded((expanded) => !expanded);
    };
    return [isExpanded, handleToggle];
}
//# sourceMappingURL=useAccordionExpandedState.js.map