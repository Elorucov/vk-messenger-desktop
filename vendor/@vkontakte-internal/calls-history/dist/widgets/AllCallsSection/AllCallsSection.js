import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { CallStatSource } from '@vkontakte-internal/calls-core';
import { createWidget } from '@vkontakte-internal/di';
import { useLangs } from '@vkontakte-internal/plugins';
import { Div, Group, Header, HeaderLayout, Link, Separator, Skeleton, Spacing, } from '@vkontakte-internal/vkcom-kit';
import { useCallback } from 'react';
import { CallHistoryScreenLanding, FriendsList } from './components';
import { CurrentCallsSection } from '../CurrentCallsSection';
import { CallHistorySection } from '../CallHistorySection';
import { AllCallsSectionModelProvider, useAllCallsSectionModel } from './models';
import { ScheduledCallsSection } from '../ScheduledCallsSection';
const AllCallsSectionView = observer(function AllCallsSectionView() {
    const langs = useLangs();
    const model = useAllCallsSectionModel();
    const { onCreateCallClick, onJoin } = model.actions;
    const { onShareQrCodeClick, onMenuItemClick } = model.currentProps;
    const onLinkClick = useCallback((event, section, href) => {
        event.preventDefault();
        onMenuItemClick(section, href);
    }, []);
    const onFriendItemClick = useCallback((e, vkId) => {
        if (e.ctrlKey || e.metaKey) {
            return true;
        }
        e.preventDefault();
        onJoin('', vkId, CallStatSource.HISTORY_FRIENDS_LIST, true);
        return false;
    }, []);
    return (_jsxs(_Fragment, { children: [model.isEmptyScreen && (_jsxs(Group, { children: [!model.friendsLoading && model.friends.length === 0 && _jsx(Spacing, { size: 100, mode: "horizontal" }), _jsx(CallHistoryScreenLanding, { onCreateCallClick: onCreateCallClick }), !model.friendsLoading && model.friends.length === 0 && _jsx(Spacing, { size: 100, mode: "horizontal" })] })), model.friendsLoading && (_jsx(Group, { children: _jsx(Skeleton, { height: 147, borderRadius: 12 }) })), !model.friendsLoading && model.friends.length > 0 && (_jsx(Group, { header: _jsx(HeaderLayout, { aside: _jsx(Link, { href: "/calls?section=friends", "aria-label": langs.getLang('calls_show_all_friends'), "data-testid": "calls_main_page_call_friends_show_all", onClick: (event) => onLinkClick(event, 'friends', 'calls?section=friends'), children: langs.getLang('calls_history_show_all_friends_header_link') }), children: _jsx(Header, { "data-testid": "calls_main_page_call_friends_header", children: langs.getLang('calls_history_friends_block_header') }) }), children: _jsx(Div, { mode: "vertical", spacing: 0, children: _jsx(FriendsList, { friends: model.friends, onFriendItemClick: onFriendItemClick }) }) })), _jsx(CurrentCallsSection, { maxCalls: 5, hideWhenEmpty: true, groupHeader: _jsxs(_Fragment, { children: [_jsx(HeaderLayout, { aside: model.currentCalls.length ? (_jsx(Link, { onClick: (event) => onLinkClick(event, 'current', 'calls?section=current'), href: "/calls?section=current", children: _jsx("span", { "data-testid": "calls_main_page_current_calls_show_all", children: langs.getLang('calls_history_show_all_header_link') }) })) : (''), children: _jsx(Header, { indicator: model.currentCalls.length, "data-testid": "calls_main_page_current_calls_header", children: langs.getLang('calls_history_current_list_header') }) }), _jsx(Separator, {})] }) }), _jsx(ScheduledCallsSection, { section: "preview", onShareQrCodeClick: onShareQrCodeClick, onLinkClick: onLinkClick, skeletonHeight: 300 }), _jsx(CallHistorySection, {})] }));
});
export const AllCallsSection = createWidget(AllCallsSectionModelProvider, AllCallsSectionView);
//# sourceMappingURL=AllCallsSection.js.map