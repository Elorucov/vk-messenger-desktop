import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { useLangs } from '@vkontakte-internal/plugins';
import { Group, Header, Skeleton, Spacing } from '@vkontakte-internal/vkcom-kit';
import { CallHistoryList } from '../../components/CallHistoryList';
import { MissedCallsSectionModelProvider, useMissedCallsSectionModel } from './models';
const MissedCallsSectionView = observer(function MissedCallsSectionView() {
    const model = useMissedCallsSectionModel();
    const langs = useLangs();
    if (model.isLoading) {
        return (_jsx(Group, { children: _jsx(Skeleton, { height: 500, borderRadius: 12 }) }));
    }
    return (_jsxs(Group, { header: _jsx(Header, { separator: true, "data-testid": "calls_missed_calls_header", children: langs.getLang('calls_history_missed_list_header') }), children: [_jsx(Spacing, { size: 4, mode: "horizontal" }), _jsx(CallHistoryList, { profiles: model.profiles, onBroadcastClick: model.onBroadcastClick, calls: model.items, onMenuItemClick: model.onHistoryAction, stubText: langs.getLang('calls_history_missed_list_stub'), hasMore: model.canLoadMore, onLoadMore: () => model.loadMoreHistory() })] }));
});
export const MissedCallsSection = createWidget(MissedCallsSectionModelProvider, MissedCallsSectionView);
//# sourceMappingURL=MissedCallsSection.js.map