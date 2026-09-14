import { jsx as _jsx } from "react/jsx-runtime";
import { RightMenuGroupBase } from './RightMenuGroupBase';
import { useAccordionExpandedState } from './hooks/useAccordionExpandedState';
export const RightMenuAccordionGroup = ({ id, items, selectedId, expanded, defaultExpanded, withChevron = true, // eslint-disable-line @vkontakte-internal/vkcom-plugins/no-bool-props-defaults
onClick, ...restProps }) => {
    const [isExpanded, handleGroupClick] = useAccordionExpandedState(id, items, selectedId, defaultExpanded);
    const handleClick = (event) => {
        onClick?.(event);
        handleGroupClick();
    };
    return (_jsx(RightMenuGroupBase, { id: id, items: items, selectedId: selectedId, expanded: expanded ?? isExpanded, withChevron: withChevron, onClick: handleClick, ...restProps }));
};
//# sourceMappingURL=RightMenuAccordionGroup.js.map