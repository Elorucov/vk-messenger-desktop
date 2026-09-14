import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { Group, Header, Placeholder, Search, Skeleton, Spacing, Spinner, } from '@vkontakte-internal/vkcom-kit';
import { vou, useNavigationContext, useVkmeContext, useIndexer, } from '@vkontakte-internal/calls-core';
import { useLangs } from '@vkontakte-internal/plugins';
import { InfiniteScroll } from '../../components/InfiniteScroll';
import { CallParticipantListItem } from './components';
import { createWidget } from '@vkontakte-internal/di';
import { useHistoryScreenSectionFriendsViewModel, HistoryScreenSectionFriendsViewModelProvider, } from './models';
import { useCallback } from 'react';
const FriendsSectionView = observer(function FriendsSectionView() {
    const langs = useLangs();
    const { navigateToConvo } = useNavigationContext();
    const { isVkme } = useVkmeContext();
    const vm = useHistoryScreenSectionFriendsViewModel();
    const nameGetter = useCallback((member) => member.name, []);
    const idGetter = useCallback((member) => member.peerId, []);
    // Передаем пустой массив, так как локальный поиск не будет использовать в случае needServerSearch
    const searchIndex = useIndexer(vm.loading || vm.needServerSearch ? [] : vm.allFriends, nameGetter, idGetter);
    if (vm.loading) {
        return (_jsx(Group, { children: _jsx(Skeleton, { height: 500, borderRadius: 12 }) }));
    }
    const participants = vm.searchQuery && !vm.needServerSearch ? searchIndex.search(vm.searchQuery) : vm.friends;
    return (_jsxs(Group, { header: _jsx(Header, { separator: true, "data-testid": "calls_call_friends_page_header", children: langs.getLang('calls_page_menu_friends_calls') }), children: [_jsx("div", { "data-testid": "calls_call_friends_page_search", children: _jsx(Search, { onChange: (event) => vm.setSearchQuery(event.target.value), placeholder: langs.getLang('global_search') }) }), _jsx(InfiniteScroll, { hasMore: vm.hasMoreFriends, loadMore: vm.loadMoreFriends, children: _jsx(Group, { mode: "plain", children: vm.isSearching ? (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: 20 }), _jsx(Spinner, {}), _jsx(Spacing, { size: 20 })] })) : participants.length === 0 ? (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: 20 }), _jsx(Placeholder, { children: langs.getLang('calls_page_friends_not_found') }), _jsx(Spacing, { size: 20 })] })) : (_jsx(_Fragment, { children: participants.map((friend) => (_jsx(CallParticipantListItem, { friend: friend, description: vm.getDescription(friend), badgePreset: vou(friend.onlineInfo?.is_online, 'online'), onFriendItemClick: vm.callFriend, onNavigateToConvo: navigateToConvo, isVkme: isVkme }, friend.peerId))) })) }) })] }));
});
export const FriendsSection = createWidget(HistoryScreenSectionFriendsViewModelProvider, FriendsSectionView);
//# sourceMappingURL=FriendsSection.js.map