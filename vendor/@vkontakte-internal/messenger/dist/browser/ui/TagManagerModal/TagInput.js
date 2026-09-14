import React from 'react';
import { Icon16Cancel, Icon24SquareFilled } from '@vkontakte/icons';
import { Checkbox, Flex, FormItem, IconButton, Input, } from '@vkontakte-internal/vkcom-kit';
import { useBrowserEnv } from '../../hooks/misc';
import * as Tag from '../../../core/model/Tag';
export function TagInput({ color, id, isCheckboxDisabled, isDisabled, isSelectable, isSelected, onChange, onRemove, onSelect, value, }) {
    const { lang } = useBrowserEnv();
    const handleChane = ({ target }) => {
        onChange(target.value);
    };
    const handleSelect = ({ target }) => {
        onSelect?.(target.checked);
    };
    const isLonger = value.length > Tag.TAG_NAME_LIMIT;
    const fieldNameId = `tagNameInput${id}`;
    return (React.createElement(FormItem, { bottom: isLonger && lang.use('me_tag_manager_modal_input_error_max_length'), bottomId: fieldNameId, status: isLonger ? 'error' : 'default', noPadding: true },
        React.createElement(Flex, { align: "center", noWrap: true },
            React.createElement(Flex.Item, { flex: "grow" },
                React.createElement(Flex, { align: "center", gap: 8, noWrap: true },
                    isSelectable && (React.createElement(Checkbox, { checked: !!isSelected, disabled: isDisabled || isCheckboxDisabled, name: `tagSelectionCheckbox${id}`, noPadding: true, onChange: handleSelect })),
                    React.createElement(Flex.Item, { flex: "grow" },
                        React.createElement(Input, { after: React.createElement(Icon24SquareFilled, { color: `#${color}` }), "aria-describedby": fieldNameId, disabled: isDisabled, name: fieldNameId, onInput: handleChane, placeholder: lang.use('me_tag_manager_modal_input_placeholder'), value: value })))),
            React.createElement(IconButton, { disabled: isDisabled, height: 36, label: lang.use('me_remove'), onClick: onRemove, width: 36 },
                React.createElement(Icon16Cancel, null)))));
}
//# sourceMappingURL=TagInput.js.map