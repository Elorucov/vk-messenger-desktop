import '../../ui/SearchTabs/SearchTabs.css';
import React, { useMemo, useRef, useState } from 'react';
import { Tabs } from '@vkontakte/vkui';
import { CONVO_TAB_PANEL_ID, SearchConvoTab, } from '../../ui/SearchConvoTab/SearchConvoTab';
import { MESSAGE_TAB_PANEL_ID, SearchMessageTab, } from '../../ui/SearchMessagesTab/SearchMessageTab';
import * as Viewer from '../../../core/model/Viewer';
import { useBrowserEnv, useConvos, useConvosSearchIndex, useDebounced, useFeatureFlags, useOrganisers, useOwner, useViewer, useStoreState, } from '../../hooks/misc';
import { SEARCH_DEBOUNCE_MS } from '../../../core/config/config';
import { useFilters } from '../../hooks/useFilters';
import { SearchChannelsTab } from '../../ui/SearchChannelsTab/SearchChannelsTab';
import { TabsItem } from '@vkontakte-internal/vkcom-kit';
export var SearchResultsTab;
(function (SearchResultsTab) {
    SearchResultsTab["Convos"] = "Convos";
    SearchResultsTab["Messages"] = "Messages";
    SearchResultsTab["Channels"] = "Channels";
})(SearchResultsTab || (SearchResultsTab = {}));
export const SearchTabs = ({ setNavigationParams, changeQueryForced, selectedConvoId, handleContextMenuAction, handleRejectMRAction, toggleSearchPanel, initialTab, ...props }) => {
    const convos = useConvos();
    const owner = useOwner();
    const organisers = useOrganisers();
    const { selectedFilter: { convos: defaultConvos }, } = useFilters(convos, organisers.filters, 'all');
    const importantUsers = useStoreState('importantUsers');
    const { envFeatureFlags, lang } = useBrowserEnv();
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const featureFlags = useFeatureFlags();
    const convosSearchIndex = useConvosSearchIndex();
    const [activeTab, setActiveTab] = useState(initialTab);
    const { debounced: debouncedQuery } = useDebounced(props.query, SEARCH_DEBOUNCE_MS);
    const tabProps = {
        ...props,
        convosCache: convos,
        debouncedQuery,
    };
    const activeTabPanelRef = useRef(null);
    const activeTabPanelProps = useMemo(() => ({
        tabPanelRef: activeTabPanelRef,
        setNavigationParams,
    }), [setNavigationParams]);
    const tabsPropsMap = [
        {
            value: SearchResultsTab.Convos,
            id: CONVO_TAB_ID,
            'aria-controls': CONVO_TAB_PANEL_ID,
            label: lang.use('me_convo_list_search_convo_tab'),
        },
        {
            value: SearchResultsTab.Messages,
            id: MESSAGES_TAB_ID,
            'aria-controls': MESSAGE_TAB_PANEL_ID,
            label: lang.use('me_convo_list_search_message_tab'),
        },
    ];
    const isChannelsTabAvailable = !featureFlags.vkm_disable_channels_folder ||
        envFeatureFlags.isChannelsFolderAvailable;
    if (owner.kind !== 'Group' && isChannelsTabAvailable) {
        tabsPropsMap.push({
            value: SearchResultsTab.Channels,
            id: CHANNELS_TAB_ID,
            'aria-controls': CHANNELS_TAB_ID,
            label: !isEdu && featureFlags.vkm_channel_name_to_community
                ? lang.use('me_convo_list_search_channel_community_tab')
                : lang.use('me_convo_list_search_channel_tab'),
        });
    }
    return (React.createElement("div", { className: "SearchTabs" },
        React.createElement("div", { className: "SearchTabs__tabsContainer" },
            React.createElement(Tabs, { mode: "accent" }, tabsPropsMap.map(({ value, id, label, ...rest }) => (React.createElement(TabsItem, { key: id, onClick: () => setActiveTab(value), onMouseDown: (event) => {
                    // Добавляем onMouseDown, чтобы инпут поиска не терял фокус
                    // и это не приводило бы к закрытию поиска, если инпут пустой.
                    event.preventDefault();
                }, selected: value === activeTab, id: id, ...rest }, label))))),
        React.createElement("div", { className: "SearchTabs__tabPanel" },
            React.createElement(SearchConvoTab, { activeTabPanelProps: activeTab === SearchResultsTab.Convos
                    ? activeTabPanelProps
                    : undefined, importantUsers: importantUsers, convosSearchIndex: convosSearchIndex, defaultResults: defaultConvos, selectedConvoId: selectedConvoId, handleContextMenuAction: handleContextMenuAction, handleRejectMRAction: handleRejectMRAction, toggleSearchPanel: toggleSearchPanel, ...tabProps }),
            React.createElement(SearchMessageTab, { activeTabPanelProps: activeTab === SearchResultsTab.Messages
                    ? activeTabPanelProps
                    : undefined, changeQueryForced: changeQueryForced, hideToLeft: activeTab === SearchResultsTab.Channels, ...tabProps }),
            React.createElement(SearchChannelsTab, { query: props.query, isActive: activeTab === SearchResultsTab.Channels, activeTabPanelProps: activeTab === SearchResultsTab.Channels
                    ? activeTabPanelProps
                    : undefined, toggleSearchPanel: toggleSearchPanel }))));
};
export const CONVO_TAB_ID = 'search_convos_tab';
export const MESSAGES_TAB_ID = 'search_messages_tab';
export const CHANNELS_TAB_ID = 'search_channels_tab';
//# sourceMappingURL=SearchTabs.js.map