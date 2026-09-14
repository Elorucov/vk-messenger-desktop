import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { useLangs } from '@vkontakte-internal/plugins';
import { Button, DropdownActionSheet, getColorClass, Group, Header, HeaderLayout, Placeholder, Separator, Skeleton, Spacing, Spinner, Text, } from '@vkontakte-internal/vkcom-kit';
import { Icon12Dropdown, Icon20DeleteOutline } from '@vkontakte/icons';
import { useMemo } from 'react';
import { CallHistoryList } from '../../components/CallHistoryList';
import { CallHistorySectionModelProvider, useCallHistorySectionModel } from './models';
export const CallHistorySectionView = observer(function CallHistorySectionView() {
    const model = useCallHistorySectionModel();
    const langs = useLangs();
    const textStub = useMemo(() => {
        if (model.selectedOwnerId === 0) {
            return langs.getLang('calls_history_list_stub');
        }
        return langs.getLang('calls_history_list_groups_stub');
    }, [model.selectedOwnerId]);
    /** показывать блок с заголовком */
    /** "История звонков" */
    const textListHeader = langs.getLang('calls_history_list_header');
    if (model.loading) {
        return (_jsx(Group, { children: _jsx(Skeleton, { height: 500, borderRadius: 12 }) }));
    }
    const buttonTitle = model.currentOwnerName;
    const dropdownContent = model.ownerOptions.map(({ id, name }) => (_jsx(DropdownActionSheet.Item, { onClick: () => model.onGroupSelectChange(id), children: _jsx(Text, { weight: "3", className: getColorClass('color_text_link'), children: name }) }, id)));
    const groupSelector = model.ownerOptions.length > 1 ? (_jsx(DropdownActionSheet, { maxHeight: 350, width: 200, trigger: "click", content: dropdownContent, children: _jsx(Button, { mode: "tertiary", size: "s", appearance: "accent", "data-testid": "calls_history_list_select_owner", after: _jsx(Icon12Dropdown, {}), children: buttonTitle }) })) : null;
    // блок с информацией, если вернулся пустой список
    if (model.showEmptyPlaceholder) {
        return (_jsxs(Group, { header: _jsxs(_Fragment, { children: [_jsx(HeaderLayout, { aside: groupSelector, children: _jsx(Header, { children: textListHeader }) }), _jsx(Separator, {})] }), children: [_jsx(Spacing, { size: 20 }), _jsx(Placeholder, { children: textStub }), _jsx(Spacing, { size: 20 })] }));
    }
    const headerLayoutAside = (_jsxs(_Fragment, { children: [groupSelector, _jsx(Spacing, { size: 4, mode: "vertical" }), model.enableNewHistoryDeletion && (_jsx(DropdownActionSheet, { maxHeight: 100, width: 268, trigger: "click", content: _jsx(_Fragment, { children: _jsx(DropdownActionSheet.Item, { before: _jsx(Icon20DeleteOutline, { className: getColorClass('color_icon_negative') }), onClick: model.onFullCallsDelete, disabled: model.isEmptyHistory, children: langs.getLang('calls_history_list_mass_deletion') }) }), children: _jsx(Button, { mode: "tertiary", size: "s", appearance: "accent", "data-testid": "calls_history_list_menu", after: _jsx(Icon12Dropdown, {}), children: langs.getLang('calls_history_list_more') }) }))] }));
    return (_jsxs(Group, { header: _jsxs(_Fragment, { children: [_jsx(HeaderLayout, { aside: headerLayoutAside, children: _jsx(Header, { "data-testid": "calls_history_list_header", children: textListHeader }) }), _jsx(Separator, {})] }), children: [_jsx(Spacing, { size: 4, mode: "horizontal" }), model.ownerLoading && (_jsx(Placeholder, { children: _jsx(Spinner, { className: getColorClass('color_icon_accent') }) })), !model.ownerLoading && (_jsx(CallHistoryList, { onBroadcastClick: model.onBroadcastClick, profiles: model.profiles, selectedOwnerId: model.selectedOwnerId, calls: model.historyCalls, onMenuItemClick: model.onHistoryAction, stubText: textStub, hasMore: model.showMoreHistory, onLoadMore: model.onShowMoreHistory }))] }));
});
export const CallHistorySection = createWidget(CallHistorySectionModelProvider, CallHistorySectionView);
//# sourceMappingURL=CallHistorySection.js.map