import '../../ui/OptionsListSelect/OptionsListSelect.css';
import React from 'react';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { Icon12Cancel, Icon12Dropdown, Icon16CheckOutline, } from '@vkontakte/icons';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { ReforgedCheckbox } from '../../ui/ReforgedCheckbox/ReforgedCheckbox';
import cx from 'classnames';
// Обертка над ActionsMenu для переиспользования
export const OptionsListSelect = ({ className, children, options, ...dropdownProps }) => {
    return (React.createElement(Dropdown, { enableFocusTrap: true, content: React.createElement(ActionsMenu, { className: className }, options), hideOnClick: true, openType: "click", ...dropdownProps }, children));
};
export const OptionsListSelectTrigger = ({ selectedKey, withIcon, colored, withCancelIcon, onCancelIconClick, ...attributes }) => {
    const handleCancelIconClick = (event) => {
        event.stopPropagation();
        onCancelIconClick?.();
    };
    return (React.createElement("button", { ...attributes, className: cx('OptionsListSelectTrigger', {
            'OptionsListSelectTrigger--colored': colored,
        }) },
        selectedKey,
        withIcon &&
            (withCancelIcon ? (React.createElement(Icon12Cancel, { onClick: handleCancelIconClick, className: "OptionsListSelectTrigger__icon OptionsListSelectTrigger__icon--cancel" })) : (React.createElement(Icon12Dropdown, { className: "OptionsListSelectTrigger__icon" })))));
};
export const OptionsListSelectItem = ({ title, isSelected, withCheckbox = false, disabled, onClick }) => {
    return (React.createElement(ActionsMenuAction, { className: cx('OptionsListSelectItem', {
            'OptionsListSelectItem--checkbox': withCheckbox,
            'OptionsListSelectItem--selected': isSelected,
        }), title: title, onClick: onClick, disabled: disabled, leftIcon: withCheckbox && (React.createElement(ReforgedCheckbox, { disabled: disabled, checked: isSelected })), rightIcon: !withCheckbox && React.createElement(Icon16CheckOutline, null) }));
};
//# sourceMappingURL=OptionsListSelect.js.map