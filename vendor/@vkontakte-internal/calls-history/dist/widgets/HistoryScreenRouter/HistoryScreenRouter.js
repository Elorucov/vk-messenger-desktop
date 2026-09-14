import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { useCallback, useMemo } from 'react';
import { Spacing } from '@vkontakte-internal/vkcom-kit';
import { CallHistoryScreen, AppDownloadBanner, ReactionsBanner } from './components';
import { useHistoryScreenLocation } from './hooks';
import { AllCallsSection } from '../AllCallsSection';
import { useLangs } from '@vkontakte-internal/plugins';
import { HistoryScreenSections, useCallsBridge, useVkmeContext } from '@vkontakte-internal/calls-core';
import { TranscribedCallsSection } from '../TranscribedCallsSection';
import { FriendsSection } from '../FriendsSection/FriendsSection';
import { createWidget } from '@vkontakte-internal/di';
import { HistoryScreenRouterModelProvider, useHistoryScreenRouterModel } from './models';
import { CurrentCallsSection } from '../CurrentCallsSection';
import { MissedCallsSection } from '../MissedCallsSection';
import { CallHistorySection } from '../CallHistorySection';
import { ScheduledCallsSection } from '../ScheduledCallsSection';
import { getHistorySectionUrl } from './helpers';
import { useHistoryConfig } from '../../services/HistoryConfig';
import { CallRecordsSection } from '../CallRecordsSection';
const TABS_HREFS = {
    [HistoryScreenSections.ALL]: 'calls',
    [HistoryScreenSections.FRIENDS]: getHistorySectionUrl(HistoryScreenSections.FRIENDS),
    [HistoryScreenSections.CURRENT]: getHistorySectionUrl(HistoryScreenSections.CURRENT),
    [HistoryScreenSections.SCHEDULED]: getHistorySectionUrl(HistoryScreenSections.SCHEDULED),
    [HistoryScreenSections.HISTORY]: getHistorySectionUrl(HistoryScreenSections.HISTORY),
    [HistoryScreenSections.MISS]: getHistorySectionUrl(HistoryScreenSections.MISS),
    [HistoryScreenSections.DECODING]: getHistorySectionUrl(HistoryScreenSections.DECODING),
    [HistoryScreenSections.RECORDS]: getHistorySectionUrl(HistoryScreenSections.RECORDS),
};
const HistoryScreenRouterView = observer(function HistoryScreenRouterView() {
    const vm = useHistoryScreenRouterModel();
    const { changeQuery, startedSection } = vm.currentProps;
    const langs = useLangs();
    const { isVkme } = useVkmeContext();
    const bridge = useCallsBridge();
    const { enableCallsRecords } = useHistoryConfig();
    const { section, setSection } = useHistoryScreenLocation(window.location, startedSection);
    const { onCreateCallClick, onPlanCalendarEvent, onJoinCallClick, onShareQrCodeClick } = vm.actions;
    const menuItems = useMemo(() => {
        return [
            {
                'type': 'item',
                'id': HistoryScreenSections.ALL,
                'label': langs.getLang('calls_page_menu_all_calls'),
                'aria-label': langs.getLang('calls_page_menu_all_calls'),
                'role': 'tab',
                'aria-selected': section === HistoryScreenSections.ALL,
            },
            {
                'type': 'item',
                'id': HistoryScreenSections.FRIENDS,
                'label': langs.getLang('calls_page_menu_friends_calls'),
                'aria-label': langs.getLang('calls_page_menu_friends_calls'),
                'role': 'tab',
                'aria-selected': section === HistoryScreenSections.FRIENDS,
            },
            {
                type: 'separator',
            },
            {
                'type': 'item',
                'id': HistoryScreenSections.CURRENT,
                'label': langs.getLang('calls_page_menu_current_calls'),
                'aria-label': langs.getLang('calls_page_menu_current_calls'),
                'role': 'tab',
                'aria-selected': section === HistoryScreenSections.CURRENT,
            },
            {
                'type': 'item',
                'id': HistoryScreenSections.SCHEDULED,
                'label': langs.getLang('calls_scheduled'),
                'aria-label': langs.getLang('calls_scheduled'),
                'role': 'tab',
                'aria-selected': section === HistoryScreenSections.SCHEDULED,
            },
            {
                type: 'separator',
            },
            {
                'type': 'item',
                'id': HistoryScreenSections.HISTORY,
                'label': langs.getLang('calls_history'),
                'aria-label': langs.getLang('calls_history'),
                'role': 'tab',
                'aria-selected': section === HistoryScreenSections.HISTORY,
            },
            {
                'type': 'item',
                'id': HistoryScreenSections.MISS,
                'label': langs.getLang('calls_page_menu_miss_calls'),
                'aria-label': langs.getLang('calls_page_menu_miss_calls'),
                'role': 'tab',
                'aria-selected': section === HistoryScreenSections.MISS,
            },
            {
                type: 'separator',
            },
            enableCallsRecords &&
                !isVkme && {
                'type': 'item',
                'id': HistoryScreenSections.RECORDS,
                'label': langs.getLang('calls_page_menu_call_records'),
                'role': 'tab',
                'aria-selected': section === HistoryScreenSections.RECORDS,
                'aria-label': langs.getLang('calls_page_menu_call_records'),
                'data-testid': 'calls-records-nav-menu-button',
            },
            {
                'type': 'item',
                'id': HistoryScreenSections.DECODING,
                'label': langs.getLang('calls_page_menu_decoding_calls'),
                'aria-label': langs.getLang('calls_page_menu_decoding_calls'),
                'role': 'tab',
                'aria-selected': section === HistoryScreenSections.DECODING,
            },
        ].filter(Boolean);
    }, [langs.getLang, section]);
    const onMenuItemClick = useCallback((tabId, href) => {
        changeQuery(href);
        setSection(tabId);
        vm.setLoading(true);
        // "перематываем" скролл наверх
        window.scrollTo({ top: 0 });
        return Promise.resolve();
    }, []);
    const onRightMenuItemClick = useCallback((selectedId) => {
        const tabId = selectedId === HistoryScreenSections.ALL ? '' : selectedId;
        const href = TABS_HREFS[selectedId];
        onMenuItemClick(tabId, href);
    }, []);
    const callScreenContent = useMemo(() => {
        if (section === HistoryScreenSections.RECORDS && enableCallsRecords && !isVkme) {
            return _jsx(CallRecordsSection, {});
        }
        switch (section) {
            case HistoryScreenSections.MISS:
                return _jsx(MissedCallsSection, {});
            case HistoryScreenSections.FRIENDS:
                return _jsx(FriendsSection, { isVkme: isVkme, bridge: bridge });
            case HistoryScreenSections.CURRENT:
                return _jsx(CurrentCallsSection, {});
            case HistoryScreenSections.HISTORY:
                return _jsx(CallHistorySection, {});
            case HistoryScreenSections.SCHEDULED:
                return _jsx(ScheduledCallsSection, { onShareQrCodeClick: onShareQrCodeClick, section: "scheduled" });
            case HistoryScreenSections.DECODING:
                return _jsx(TranscribedCallsSection, {});
            default:
                return _jsx(AllCallsSection, { onMenuItemClick: onMenuItemClick, onShareQrCodeClick: onShareQrCodeClick });
        }
    }, [section]);
    return (_jsx(CallHistoryScreen, { showCreateCall: vm.showCreateCall, onCreateCallClick: onCreateCallClick, activeMenuItem: section === '' ? HistoryScreenSections.ALL : section, menuItems: menuItems, onMenuItemClick: onRightMenuItemClick, loading: vm.loading, banner: _jsxs(_Fragment, { children: [_jsx(Spacing, { size: 16 }), _jsx(ReactionsBanner, {}), _jsx(Spacing, { size: 16 }), _jsx(AppDownloadBanner, {})] }), onPlanCalendarEvent: onPlanCalendarEvent, onJoinCallClick: onJoinCallClick, children: callScreenContent }));
});
export const HistoryScreenRouter = createWidget(HistoryScreenRouterModelProvider, HistoryScreenRouterView);
//# sourceMappingURL=HistoryScreenRouter.js.map