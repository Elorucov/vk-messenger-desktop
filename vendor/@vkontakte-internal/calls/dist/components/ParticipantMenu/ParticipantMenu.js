import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon16DropdownOutline } from '@vkontakte/icons';
import { DropdownActionSheet, DropdownActionSubSheet, getColorClass, Switch, } from '@vkontakte-internal/vkcom-kit';
import { CallsDropdown } from '../CallsDropdown/CallsDropdown';
import { SmallIconButton } from '../SmallIconButton/SmallIconButton';
import { useLang } from '../../hooks/useLang';
import { Menu } from './Menu';
import { Provider, useModel } from './ParticipantMenuModel';
import { shift } from '@floating-ui/core';
import { ActionsIcon } from '../ParticipantHeader/ActionsIcon';
const customMiddlewares = [shift({ mainAxis: true, padding: 10 })];
const ParticipantMenu = observer(function ParticipantMenu() {
    const { actions, hasNewViewOfMuteActions, isMeAdmin, props } = useModel();
    const { buttonComponent: ButtonComponent, containerComponent: ContainerComponent, trigger, useLegacyDropdown, } = props;
    const hasActions = actions.length > 0;
    const menuRef = useRef(null);
    const portal = useRef(null);
    const { getLang } = useLang();
    const mapActions = useMemo(() => [
        ...actions.map((item, index) => renderDropdownItem({ item, index, isNewView: hasNewViewOfMuteActions, portal })),
        _jsx("div", { ref: portal }, "portal"),
    ], [actions, hasNewViewOfMuteActions]);
    // start: это нужно чтобы выпадающее меню изменяло размер корректно, когда меняется содержимое
    // обсуждали c vkcom-kit, пока что нет другой возможности
    const [shown, setShown] = useState(false);
    useEffect(() => {
        if (shown) {
            setShown(false);
            setTimeout(() => setShown(true), 0);
        }
    }, [isMeAdmin]);
    // end: ---
    const isLegacyDropdown = !hasNewViewOfMuteActions && useLegacyDropdown;
    if (hasActions && isLegacyDropdown) {
        return (_jsx(CallsDropdown, { className: "Participant__Dropdown", items: actions, open: shown, setOpen: setShown, placement: "auto", customMiddlewares: customMiddlewares, children: _jsx(ActionsIcon, { onClick: () => {
                    setShown((v) => !v);
                } }) }));
    }
    const menu = hasActions ? (_jsx(Menu, { getRootRef: menuRef, "data-testid": "calls_participant_list_item_menu_root", content: mapActions, size: "s", padding: "m", placement: "bottom-end", trigger: trigger, shown: shown, onShownChange: () => setShown((shown) => !shown), children: ButtonComponent ? (_jsx(ButtonComponent, { hasActions: true })) : (_jsx(SmallIconButton, { "data-testid": "calls_participant_list_item_menu_button", "aria-label": getLang('calls_actions'), children: _jsx(Icon16DropdownOutline, { className: getColorClass('color_icon_secondary') }) })) })) : ButtonComponent ? (_jsx(ButtonComponent, {})) : (_jsx(_Fragment, {}));
    return ContainerComponent ? _jsx(ContainerComponent, { children: menu }) : menu;
});
export const ParticipantMenuWidget = createWidget(Provider, ParticipantMenu);
function renderDropdownItem({ item, index, isNewView, keepOpen = false, portal }) {
    if ('separator' in item) {
        return _jsx(DropdownActionSheet.Separator, {}, item.key ?? `item-${index}`);
    }
    if ('items' in item) {
        const { items, ...itemOnly } = item;
        if (isNewView) {
            return (_jsx(Menu, { content: items.map((item, index) => renderDropdownItem({ item, index, isNewView, portal })), padding: "m", placement: "right", size: "s", usePortal: portal, children: renderDropdownItem({ item: itemOnly, index, isNewView, keepOpen: true }) }, item.key ?? `item-${index}`));
        }
        return (_jsx(DropdownActionSubSheet, { before: item.before, sheet: _jsx(_Fragment, { children: items.map((item, index) => renderDropdownItem({ item, index, isNewView, portal })) }), shown: false, 
            // сбрасываем хендлер onPointerLeave, чтобы подменю не закрывалось само при уведении курсора
            onPointerLeave: undefined, children: item.text }, item.key ?? `item-${index}`));
    }
    return (_jsx(DropdownActionSheet.Item, { ...getDropdownItemCommonProps(item, index, isNewView, keepOpen), children: item.text }));
}
function getDropdownItemCommonProps(item, index, isNewView, keepOpen = false) {
    return {
        'disabled': item.disabled,
        'key': item.key ?? `item-${index}`,
        'before': 'before' in item ? item.before : undefined,
        'href': 'href' in item ? item.href : undefined,
        'rel': 'href' in item ? 'noopener noreferrer' : undefined,
        'target': 'href' in item ? '_blank' : undefined,
        'onClick': 'onClick' in item ? item.onClick : undefined,
        'type': 'negative' in item ? 'destructive' : undefined,
        'keepOpen': keepOpen || ('isEnabled' in item && !('notKeepOpen' in item && item.notKeepOpen)),
        'multiline': isNewView ? true : undefined,
        'after': 'isEnabled' in item ? (_jsx(Switch, { tabIndex: -1, checked: item.isEnabled, onClick: (event) => event.stopPropagation(), readOnly: true })) : 'after' in item ? (item.after) : undefined,
        'data-testid': item.dataTestId,
    };
}
//# sourceMappingURL=ParticipantMenu.js.map