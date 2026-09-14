import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Placeholder, Spacing, Group } from '@vkontakte-internal/vkcom-kit';
import { InfiniteScroll } from '../InfiniteScroll';
import { CallHistoryListItem } from '../CallHistoryListItem';
export const CallHistoryList = ({ calls, onMenuItemClick, onBroadcastClick, stubText, hasMore, onLoadMore, selectedOwnerId = 0, profiles, }) => {
    return (_jsx(InfiniteScroll, { hasMore: hasMore, loadMore: onLoadMore, children: _jsxs(Group, { mode: "plain", children: [calls.map((call, key) => (_jsx(CallHistoryListItem, { selectedOwnerId: selectedOwnerId, onMenuItemClick: onMenuItemClick, call: call, index: key, profiles: profiles, onBroadcastClick: onBroadcastClick }, call.id))), calls.length === 0 && (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: 20 }), _jsx(Placeholder, { children: stubText }), _jsx(Spacing, { size: 20 })] }))] }) }));
};
//# sourceMappingURL=CallHistoryList.js.map