import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { Group, Header, Placeholder, Skeleton, Spacing } from '@vkontakte-internal/vkcom-kit';
import { useLangs } from '@vkontakte-internal/plugins';
import { createWidget } from '@vkontakte-internal/di';
import { CurrentCallsSectionProvider, useCurrentCallsSection } from './models';
import { CurrentCallsListItem } from './components';
const CurrentCallsSectionView = observer(function CurrentCallsSectionView() {
    const langs = useLangs();
    const model = useCurrentCallsSection();
    const { loading, currentCalls, profiles, groupHeader, hideWhenEmpty, actions } = model;
    if (loading) {
        return (_jsx(Group, { children: _jsx(Skeleton, { height: 300, borderRadius: 12 }) }));
    }
    if (hideWhenEmpty && !loading && currentCalls.length === 0) {
        return _jsx(_Fragment, {});
    }
    return (_jsxs(Group, { header: groupHeader ?? (_jsx(Header, { separator: true, "data-testid": "calls_currents_calls_page_header", children: langs.getLang('calls_history_current_list_header') })), children: [_jsx(Spacing, { size: 4, mode: "horizontal" }), currentCalls.map((call, index) => (_jsx(CurrentCallsListItem, { call: call, onJoin: actions.onJoin, profiles: profiles }, index))), currentCalls.length === 0 && (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: 20 }), _jsx(Placeholder, { children: langs.getLang('calls_history_current_calls_list_stub') }), _jsx(Spacing, { size: 20 })] }))] }));
});
export const CurrentCallsSection = createWidget(CurrentCallsSectionProvider, CurrentCallsSectionView);
//# sourceMappingURL=CurrentCallsSection.js.map