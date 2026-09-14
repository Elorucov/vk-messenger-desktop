import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"Flex":["@vkontakte-internal/vkcom-kit",{"className":1,"style":1}],"ModalScrollView":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { createWidget } from '@vkontakte-internal/di';
import { Flex, ModalScrollView, Search, Tabs, TabsItem } from '@vkontakte-internal/vkcom-kit';
import { observer } from 'mobx-react-lite';
import { AddParticipantsItem } from './AddParticipantsItem';
import { AddParticipantsViewModelProvider, useAddParticipantsViewModel } from './AddParticipantsViewModel';
import { useLang } from '../../hooks/useLang';
import { ETabName } from './interfaces';
import styles from './AddParticipants.module.css';
const AddParticipants = observer(function AddParticipants() {
    const { handleClickItem, handleChangeTab, handleChangeSearchQuery, handleShowMoreMembers, hasFoundMembersResult, height, hasMoreMembers, isContactsLoading, isItemDisabled, isItemSelected, isLoading, isSearching, itemHeight, members, moreMembersItem, notFoundMembersItem, searchQuery, setScrollViewRootRef, tab, tabs, } = useAddParticipantsViewModel();
    const { getLang } = useLang();
    return (_jsxs(Flex, { className: styles.wrapper, direction: "column", noWrap: true, style: { height }, children: [_jsxs("div", { children: [_jsx(Search, { "data-testid": "calls_add_participants_search", onChange: handleChangeSearchQuery, placeholder: getLang('calls_search_participants_placeholder'), value: searchQuery }), _jsx(Tabs, { children: tabs.map(({ id, label, counter }) => (_jsx(TabsItem, { onClick: () => handleChangeTab(id), selected: id === tab, status: counter, children: label }, id))) })] }), _jsx(ModalScrollView, { className: styles.scrollWrapper, getRootRef: setScrollViewRootRef, children: isSearching || (tab === ETabName.Contacts && isContactsLoading) ? (_jsx(Search.Skeleton, {})) : (_jsxs(_Fragment, { children: [members.map((item) => (_jsx(AddParticipantsItem, { height: itemHeight, isDisabled: isItemDisabled(item.peerId), isSelected: isItemSelected(item.peerId), member: item, onClick: () => handleClickItem(item.peerId) }, item.peerId))), hasMoreMembers && !hasFoundMembersResult && moreMembersItem && (_jsx(AddParticipantsItem, { data: moreMembersItem, isLoading: isLoading, isMoreButtonDisabled: isLoading, onClick: handleShowMoreMembers })), hasFoundMembersResult && notFoundMembersItem && !members.length && (_jsx(AddParticipantsItem, { data: notFoundMembersItem }))] })) })] }));
});
export const AddParticipantsWidget = createWidget(AddParticipantsViewModelProvider, AddParticipants);
//# sourceMappingURL=AddParticipantsWidget.js.map