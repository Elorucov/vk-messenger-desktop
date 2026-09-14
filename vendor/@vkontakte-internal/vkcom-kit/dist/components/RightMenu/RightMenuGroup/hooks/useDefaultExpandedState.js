import { useUpdateEffect } from '@vkontakte-internal/react-utils';
import { useState } from 'react';
import { useSelectedState } from './useSelectedState';
/**
 * Хук, описывающие поведение группы в режиме по умолчанию:
 * - Группа развернута, когда выделен один из ее элементов (включая корневой);
 */
export function useDefaultExpandedState(id, items, selectedId, defaultExpanded) {
    const isSelected = useSelectedState(id, items, selectedId);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? isSelected);
    useUpdateEffect(() => {
        setIsExpanded(isSelected);
    }, [isSelected]);
    return isExpanded;
}
//# sourceMappingURL=useDefaultExpandedState.js.map