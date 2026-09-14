import { jsx as _jsx } from "react/jsx-runtime";
import { RightMenuGroupBase } from './RightMenuGroupBase';
import { useDefaultExpandedState } from './hooks/useDefaultExpandedState';
export const RightMenuDefaultGroup = ({ id, items, selectedId, expanded, defaultExpanded, onClick, onSelect, onReselect, ...restProps }) => {
    const isExpanded = useDefaultExpandedState(id, items, selectedId, defaultExpanded);
    const handleClick = (event) => {
        onClick?.(event);
        if (!event.isPropagationStopped()) {
            selectedId !== id ? onSelect?.(id) : onReselect?.(id);
        }
    };
    return (_jsx(RightMenuGroupBase, { id: id, items: items, selectedId: selectedId, expanded: expanded ?? isExpanded, onClick: (onClick || onSelect) && handleClick, onSelect: onSelect, onReselect: onReselect, ...restProps }));
};
//# sourceMappingURL=RightMenuDefaultGroup.js.map