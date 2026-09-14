import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon16Dropdown } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { Collapsible } from '../../Collapsible/Collapsible';
import { Sortable } from '../../Sortable/Sortable';
import { RightMenuItem } from '../RightMenuItem/RightMenuItem';
import { RightMenuGroupItem } from './RightMenuGroupItem/RightMenuGroupItem';
import styles from './RightMenuGroupBase.module.css';
export const RightMenuGroupBase = ({ id: groupId, children, items, selectedId, before, after, expanded, draggable, withChevron, accessibility, onSelect, onReselect, onSortChange, ...restProps }) => {
    const renderedItems = items.map((config) => {
        const { id, fixed } = config;
        const groupItem = (_jsx(RightMenuGroupItem, { config: config, selectedId: selectedId, onSelect: onSelect, onReselect: onReselect }, id));
        if (onSortChange) {
            return (_jsx(Sortable.Item, { id: config.id, label: config.label, disabled: fixed, children: groupItem }, id));
        }
        return groupItem;
    });
    const sortChangeHandler = (sortedItems) => {
        onSortChange?.(sortedItems);
    };
    const content = (_jsx(Collapsible, { "data-testid": "right-menu-group-content", expanded: expanded, children: renderedItems }));
    return (_jsxs(_Fragment, { children: [_jsx(RightMenuItem, { ...restProps, mode: "primary", before: before, after: after, selected: groupId === selectedId, badgeAfterTitle: withChevron && (_jsx("div", { className: classNames(styles.chevron, expanded && styles.chevronFlipped), children: _jsx(Icon16Dropdown, {}) })), children: children }), onSortChange ? (_jsx(Sortable, { items: items, accessibility: accessibility, onSortChange: sortChangeHandler, children: content })) : (content)] }));
};
//# sourceMappingURL=RightMenuGroupBase.js.map