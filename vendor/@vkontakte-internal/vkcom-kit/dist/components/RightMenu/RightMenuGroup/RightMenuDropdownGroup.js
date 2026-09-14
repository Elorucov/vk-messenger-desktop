import { jsx as _jsx } from "react/jsx-runtime";
import { RightMenuGroupBase } from './RightMenuGroupBase';
import { useDropdownExpandedState } from './hooks/useDropdownExpandedState';
export const RightMenuDropdownGroup = ({ id, items, selectedId, expanded, defaultExpanded, withChevron = true, // eslint-disable-line @vkontakte-internal/vkcom-plugins/no-bool-props-defaults
onClick, onSelect, onReselect, ...restProps }) => {
    const [isExpanded, handleGroupClick] = useDropdownExpandedState(id, items, selectedId, defaultExpanded);
    const handleClick = (event) => {
        onClick?.(event);
        handleGroupClick();
        if (!event.isPropagationStopped()) {
            selectedId !== id ? onSelect?.(id) : onReselect?.(id);
        }
    };
    return (_jsx(RightMenuGroupBase, { id: id, items: items, selectedId: selectedId, expanded: expanded ?? isExpanded, withChevron: withChevron, onClick: handleClick, onSelect: onSelect, ...restProps }));
};
//# sourceMappingURL=RightMenuDropdownGroup.js.map