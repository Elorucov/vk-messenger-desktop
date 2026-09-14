import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":1}],"div":["global",{"className":2}],"DropdownActionSheet":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { ColorSchemeProvider, AppRootProvider, DropdownActionSheet, Link, Switch, Text, } from '@vkontakte-internal/vkcom-kit';
import { useRef } from 'react';
import { isUndefined } from '@vkontakte/vkjs';
import { Icon16Chevron, Icon20CheckAlt, Icon24Settings } from '@vkontakte/icons';
import { useLang } from '../../hooks/useLang';
import { CallsIconButton } from '../../components/CallsIconButton';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { CallSettingsDropdownModelProvider, useCallSettingsDropdownModel } from './CallSettingsDropdownModel';
/** По макету минимальная фиксированная ширина подменю */
const DEFAULT_SUBMENU_WIDTH = 171;
// Фиксит двойной клик если нажать по свитчу
const fixDoubleClick = (e) => e.stopPropagation();
const CallSettingsDropdown = observer(function CallSettingsDropdown() {
    const { getSubtitle, toggleCallSettingsDropdown, isCallSettingsDropdownShown, actions } = useCallSettingsDropdownModel();
    const { getLang } = useLang();
    const subPortal = useRef(null);
    const renderItemAfter = (action) => {
        if (!isUndefined(action.isEnabled) && !action.isAlternativeSwitch) {
            return (_jsx(Switch, { "data-testid": "calls_call_settings_item_switch", tabIndex: -1, checked: action.isEnabled, readOnly: true, disabled: action.isDisabled, onClick: fixDoubleClick }));
        }
        if (Boolean(action.subActions?.length) && !action.afterLinkText) {
            return (_jsx("span", { className: "CallSettingsDropdown__icon", children: _jsx(Icon16Chevron, {}) }));
        }
        if (Boolean(action.isSelected)) {
            return _jsx(Icon20CheckAlt, {});
        }
        if (action.afterLinkText) {
            return (_jsx(Link, { hasHover: false, "aria-hidden": true, children: _jsx(Text, { children: action.afterLinkText }) }));
        }
        return;
    };
    const renderActions = (actions, isKeepOpen = false, firstLevel = false) => {
        return (_jsxs(_Fragment, { children: [actions.map((action, index) => {
                    const { text = '', trigger: dropdownAction = 'hover' } = action;
                    if (action.isSeparator) {
                        return (_jsx("div", { className: "CallSettingsDropdown__separator", children: _jsx(DropdownActionSheet.Separator, {}) }, index));
                    }
                    const itemContent = (_jsx(DropdownActionSheet.Item, { "data-testid": `calls_call_settings_item_${action.key}`, after: renderItemAfter(action), onClick: action.onClick, disabled: action.isDisabled, subtitle: getSubtitle(action), keepOpen: action.isKeepOpen || isKeepOpen, multiline: true, type: action.type, href: action.href, target: action.target, rel: action.rel, children: text }, action.key));
                    if (action.subActions && action.subActions.length > 0) {
                        const isKeepOpenSubactions = dropdownAction === 'hover' && action.isKeepOpen;
                        return (_jsx(DropdownActionSheet, { "data-testid": `calls_call_settings_sub_item_${action.key}`, content: renderActions(action.subActions, isKeepOpenSubactions), className: "CallSettingsDropdown__second-lvl-dropdown", placement: action.placement || 'left-start', width: action.subMenuWidth || DEFAULT_SUBMENU_WIDTH, offsetByCrossAxis: action.customOffset?.horizontal || -9, offsetByMainAxis: action.customOffset?.vertical || -1, trigger: dropdownAction, usePortal: subPortal, children: itemContent }, action.key));
                    }
                    return itemContent;
                }), firstLevel && _jsx("div", { ref: subPortal })] }));
    };
    return (_jsx("div", { className: "CallSettingsDropdown__outer", children: _jsx(AppRootProvider, { children: _jsx(ColorSchemeProvider, { value: "dark", children: _jsx(DropdownActionSheet, { "data-testid": "calls_call_settings_root", content: renderActions(actions, false, true), shown: isCallSettingsDropdownShown, onShownChange: toggleCallSettingsDropdown, placement: "top-end", offsetByCrossAxis: 9, trigger: "click", width: 240, children: _jsx(CallsIconButton, { tooltip: getLang('calls_settings'), "data-testid": "calls_call_footer_button_settings", isTooltipShown: !isCallSettingsDropdownShown, onClick: toggleCallSettingsDropdown, children: _jsx(Icon24Settings, {}) }) }) }) }) }));
});
export const CallSettingsDropdownWidget = createWidget(CallSettingsDropdownModelProvider, CallSettingsDropdown);
//# sourceMappingURL=CallSettingsDropdownWidget.js.map