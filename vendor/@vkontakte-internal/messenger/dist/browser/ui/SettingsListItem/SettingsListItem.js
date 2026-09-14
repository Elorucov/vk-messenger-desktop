import '../../ui/SettingsListItem/SettingsListItem.css';
import React, { useId, useState } from 'react';
import cx from 'classnames';
import { Icon16ArrowsUpDown, Icon16CheckOutline } from '@vkontakte/icons';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
export const SettingsListItem = ({ name, selectedKey, items, className, }) => {
    const { isMobileLayout } = useLayoutData();
    const controlsId = useId();
    const [opened, setOpened] = useState(false);
    return (React.createElement(Dropdown, { position: "bottom", align: "right", enableFocusTrap: true, hideOnClick: true, open: opened, onOpen: () => setOpened(true), onClose: () => setOpened(false), openType: "click", adaptive: true, content: React.createElement("div", { className: cx('SettingsListItem__items', {
                'SettingsListItem__items--mobile': isMobileLayout,
            }), role: "listbox", id: controlsId }, items), classNames: {
            contentWrapper: 'SettingsListItem__dropdownContent',
            trigger: 'SettingsListItem__dropdownTrigger',
        } },
        React.createElement("button", { className: cx('SettingsListItem', className, {
                'SettingsListItem--dropdownOpened': opened,
            }), 
            /* Дропдаун открывается с задержкой анимации,
             * а темный фон на элементе хотим сразу, поэтому устанавливаем
             * значение дополнительно
             */
            onClick: () => setOpened(true), type: "button", role: "combobox", value: selectedKey, "aria-controls": controlsId, "aria-haspopup": "listbox", "aria-expanded": opened },
            React.createElement("div", { className: "SettingsListItem__main" },
                React.createElement("label", { className: "SettingsListItem__name" }, name),
                React.createElement("div", { className: "SettingsListItem__selectedKey" }, selectedKey)),
            React.createElement("div", { className: "SettingsListItem__aside" },
                React.createElement(Icon16ArrowsUpDown, null)))));
};
export const SettingsListSelectItem = ({ selected, children, className, ...props }) => {
    return (React.createElement("button", { ...props, className: cx('SettingsListItem__select', className) },
        children,
        selected && (React.createElement("div", { className: "SettingsListItem__select--check" },
            React.createElement(Icon16CheckOutline, null)))));
};
//# sourceMappingURL=SettingsListItem.js.map