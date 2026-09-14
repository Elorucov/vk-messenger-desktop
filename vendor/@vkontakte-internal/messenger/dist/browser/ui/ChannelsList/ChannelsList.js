import './ChannelsList.css';
import '../../ui/ConvoList/ConvoList.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Channel from '../../../core/model/Channel';
import * as ChannelFilters from '../../../core/model/ChannelFilters';
import * as Viewer from '../../../core/model/Viewer';
import { useRouter } from '../../ui/Router/Router';
import { ChannelsListItem, ChannelsListRecommendedItem, } from '../../ui/ChannelsListItem/ChannelsListItem';
import cx from 'classnames';
import { isDev } from '../../../core/utils/misc';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { useBrowserEnv, useChannels, useDispatch, useFeatureFlags, useViewer, useStoreState, useChannel, useOrganisers, } from '../../hooks/misc';
import { EmptyChannelsList } from '../../ui/EmptyChannelsList/EmptyChannelsList';
import * as ChannelsConfig from '../../../core/model/ChannelsConfig';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import { VirtualScrollItem } from '../../ui/VirtualScroll/VirtualScrollItem';
import { IPerfStats } from '../../../data/env/IPerfStats';
import { useModal } from '../../hooks/useModal';
import { ModalDialog } from '../../ui/ModalDialog/ModalDialog';
import { Button, Header } from '@vkontakte/vkui';
import { ChannelsListInboundRequestsHeader } from '../../ui/ChannelsListInboundRequestsHeader/ChannelsListInboundRequestsHeader';
import { ChannelsListInboundRequest, ChannelsListRecommendedChannel, } from '../../ui/ChannelsListInboundRequest/ChannelsListInboundRequest';
import { CellButton, Counter } from '@vkontakte-internal/vkcom-kit';
import { useChannelsRecommendations } from '../../hooks/useChannelsRecommendations';
import { ChannelVkMeStubContent } from '../../ui/ChannelVkMeStub/ChannelVkMeStub';
import { ChannelItemViewAnalytics } from '../../ui/Analytics/ChannelItemViewAnalytics';
export const ChannelsListOld = React.memo(function ChannelsList({ channelsList, keys, inboundRequestsStartIndex, recommendedStartIndex, isChannelsRecommendationsVisible, hasMore, selectedOrganiser, canPinMoreChannels, }) {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const channelsConfigRecommendations = useStoreState('channelsConfig').recommendations;
    const { isOpen: isMainPanelOpen } = useCollapsibleContainer();
    const pinChannelErrorModal = useModal();
    const handlePinChannel = useCallback((channelId) => {
        if (canPinMoreChannels) {
            dispatch({
                type: 'UserChangedChannel',
                channelId,
                userAction: 'pin',
            });
        }
        else {
            pinChannelErrorModal.open();
        }
    }, [canPinMoreChannels, dispatch, pinChannelErrorModal]);
    const renderList = () => {
        if (channelsList.length === 0) {
            return hasMore ? (React.createElement(OptimizedSpinner, { className: "ChannelsList__loader", onIntersection: () => dispatch({
                    type: 'MoreChannelsNeeded',
                    organiser: selectedOrganiser,
                }) })) : (React.createElement(EmptyChannelsList, { organiser: selectedOrganiser }));
        }
        return (React.createElement(React.Fragment, null,
            !isMainPanelOpen && (React.createElement("div", { className: "ConvoList__folderDropDownEmptySpace" })),
            React.createElement("div", null,
                channelsList.map((channel, index) => {
                    const key = keys[index];
                    if (key === undefined) {
                        if (isDev) {
                            throw new Error('Передан массив ключей не соотвествующий списку каналов');
                        }
                        return null;
                    }
                    return (React.createElement(RowRenderer, { key: key, itemKey: key, index: index, channelId: channel.id, selectedOrganiser: selectedOrganiser, inboundRequestsStartIndex: inboundRequestsStartIndex, recommendedStartIndex: recommendedStartIndex, isChannelsRecommendationsVisible: isChannelsRecommendationsVisible, isAfterPinned: isChannelAfterPinned(channel, channelsList[index - 1]), recommendationsVersion: channelsConfigRecommendations.version, handlePinChannel: handlePinChannel }));
                }),
                hasMore && (React.createElement(OptimizedSpinner, { className: "ChannelsList__loader", onIntersection: () => {
                        dispatch({
                            type: 'MoreChannelsNeeded',
                            organiser: selectedOrganiser,
                        });
                    } }))),
            channelsList.length && !hasMore && !isMainPanelOpen && (React.createElement("div", { className: "ConvoList__emptySpace" }))));
    };
    return (React.createElement(React.Fragment, null,
        renderList(),
        pinChannelErrorModal.isActive && (React.createElement(ModalDialog, { title: lang.use('me_error_title'), content: lang.use('me_too_many_channels_pinned_error'), closeLabel: lang.use('me_close'), onClose: pinChannelErrorModal.close, buttons: React.createElement(Button, { onClick: pinChannelErrorModal.close }, lang.use('me_close')) }))));
});
const RowRenderer = ({ index, itemKey, selectedOrganiser, channelId, inboundRequestsStartIndex, recommendedStartIndex, recommendationsVersion, isChannelsRecommendationsVisible, isAfterPinned, handlePinChannel, }) => {
    const { navigate, screenRoute } = useRouter();
    const dispatch = useDispatch();
    const { lang, perfStats, stats } = useBrowserEnv();
    const { isOpen: isMainPanelOpen } = useCollapsibleContainer();
    const featureFlags = useFeatureFlags();
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const channel = useChannel(channelId, true);
    const onClick = useCallback(() => {
        const channelId = channel?.id;
        if (channelId === undefined) {
            return;
        }
        perfStats?.removeEvent(IPerfStats.EventType.openChannel);
        perfStats?.addEvent(IPerfStats.EventType.openChannel, {
            data: {
                start: perfStats.getCurrentTime(),
            },
        });
        navigate({
            kind: 'ChannelRoute',
            channelId,
            organiser: screenRoute.organiser,
        });
    }, [channel?.id, screenRoute.organiser, navigate, perfStats]);
    const onRecommendedClick = () => {
        const channelId = channel?.id;
        if (channelId === undefined) {
            return;
        }
        onClick();
        stats.logEvent({
            type: 'type_navgo',
            type_navgo: {
                screen: 'im_channels_list',
                subtype: 'go',
                screen_to: 'im_channel',
                destination_item: {
                    type: 'messenger_recommendation',
                    id: channelId,
                },
            },
        });
        stats.logEvent({
            type: 'type_click',
            screen: 'im_channels_list',
            type_click: {
                item: {
                    type: 'click_item',
                },
                type: 'type_groups_event_item',
                type_groups_event_item: {
                    group_id: channelId,
                    type: 'open_community',
                    source: 'messenger_recommendation',
                },
            },
        });
    };
    // Невозможные сценарии, т.к. перед отрисовкой этого компонента:
    // 1. Отрисовываются только доступные объекты каналов.
    // 2. Отфильтровываются заблокированные каналы.
    // Для TypeScript нужны эти проверки.
    if (!channel || channel.kind === 'ChannelRestricted') {
        return null;
    }
    const isActive = screenRoute.kind === 'ChannelRoute' && screenRoute.channelId === channel.id;
    const isRecommended = index >= recommendedStartIndex;
    const isFirstRecommended = index === recommendedStartIndex;
    const isInboundRequest = index >= inboundRequestsStartIndex;
    const isFirstInboundRequest = index === inboundRequestsStartIndex;
    const isSeparator = isFirstRecommended || isAfterPinned;
    let content;
    switch (true) {
        case isRecommended: {
            content = (React.createElement(React.Fragment, null,
                isFirstRecommended && isMainPanelOpen && (React.createElement("div", { className: "ChannelsList__recommendedHeader" },
                    !isEdu && featureFlags.vkm_channel_name_to_community
                        ? lang.use('me_recommended_channels_community_title')
                        : lang.use('me_recommended_channels_title'),
                    React.createElement("div", { role: "button", tabIndex: 0, className: "ChannelsList__recommendationToggle", onClick: () => {
                            dispatch({
                                type: 'UserChangedCollapsedVersion',
                                version: isChannelsRecommendationsVisible
                                    ? recommendationsVersion
                                    : 0,
                            });
                        } }, isChannelsRecommendationsVisible
                        ? lang.use('me_channels_hide_recommendations')
                        : lang.use('me_channels_show_recommendations')))),
                isChannelsRecommendationsVisible && (React.createElement("div", { className: "ChannelsList__item" },
                    React.createElement(ChannelsListRecommendedItem, { channel: channel, isActive: isActive, isCollapsed: !isMainPanelOpen, onClick: onRecommendedClick })))));
            break;
        }
        case isInboundRequest: {
            content = isMainPanelOpen ? (React.createElement("div", { className: cx('ChannelsList__item', 'ChannelsList__item--composite'), role: "presentation" },
                isFirstInboundRequest && React.createElement(ChannelsListInboundRequestsHeader, null),
                React.createElement(ChannelsListInboundRequest, { isActive: isActive, channel: channel, onClick: onClick }))) : (React.createElement(React.Fragment, null));
            break;
        }
        default: {
            content = (React.createElement("div", { className: "ChannelsList__item", role: "presentation" },
                React.createElement(ChannelsListItem, { channel: channel, isActive: isActive, isCollapsed: !isMainPanelOpen, handlePinChannel: handlePinChannel, withCounter: selectedOrganiser.filter !== 'archive', onClick: onClick })));
        }
    }
    return (React.createElement(VirtualScrollItem, { itemKey: itemKey, className: cx('ChannelsList__itemWrapper', {
            'ChannelsList__itemWrapper--separator': isSeparator,
        }) }, content));
};
/**
 * Запиненные беседы от незапиненных отделены сепаратором.
 * Поэтому это фукнция также проверяет, что предыдущая беседа
 * была последней запиненной.
 */
export function isChannelAfterPinned(channel, prevChannel) {
    return Boolean(prevChannel && Channel.isPinned(prevChannel) && !Channel.isPinned(channel));
}
export const useChannelsListItems = ({ isDisabled, channelIds, hasMore, shouldAddInboundRequests, }) => {
    const { withNewChannels } = useBrowserEnv();
    const channelsCache = useChannels(isDisabled);
    const channelsRecommendationsIds = useStoreState('channelsRecommendationsIds');
    const { inboundRequest } = useOrganisers().channelFilters;
    const channelsConfigRecommendations = useStoreState('channelsConfig').recommendations;
    const isChannelsRecommendationsVisible = ChannelsConfig.isRecommendationsVisible(channelsConfigRecommendations);
    const inboundRequestChannels = useMemo(() => {
        const result = [];
        if (hasMore || !shouldAddInboundRequests) {
            return result;
        }
        for (const channelId of inboundRequest.channelIds) {
            const channel = Channel.safeGet(channelsCache, channelId);
            if (channel.kind !== 'Channel' || channel.isMember) {
                continue;
            }
            void result.push(channel);
        }
        return !result.length ? result : result.sort(ChannelFilters.sorter);
    }, [
        hasMore,
        shouldAddInboundRequests,
        channelsCache,
        inboundRequest.channelIds,
    ]);
    if (isDisabled) {
        return {
            channelsList: [],
            recommendedStartIndex: 0,
            inboundRequestsStartIndex: 0,
            isChannelsRecommendationsVisible,
            keys: [],
        };
    }
    const channels = channelIds.reduce((acc, id) => {
        const channel = Channel.safeGet(channelsCache, id);
        if (channel.kind === 'Channel') {
            acc.push(channel);
        }
        return acc;
    }, []);
    const recommendedChannels = channelsRecommendationsIds.reduce((acc, channelId) => {
        const channel = Channel.safeGet(channelsCache, channelId);
        if (channel.kind !== 'ChannelRestricted' && !channel.isMember) {
            acc.push(channel);
        }
        return acc;
    }, []);
    const collapsedRecommendedChannels = isChannelsRecommendationsVisible
        ? recommendedChannels
        : recommendedChannels.slice(0, 1);
    const channelsList = [
        ...(channels ?? []),
        ...inboundRequestChannels,
        ...(hasMore ? [] : collapsedRecommendedChannels),
    ];
    const inboundRequestsStartIndex = (channels ?? []).length;
    const recommendedStartIndex = inboundRequestsStartIndex + inboundRequestChannels.length;
    const getKey = (channel) => channel.id.toString();
    const keys = channelsList.map(getKey);
    /**
     * Для списка новых каналов такой сложный хук не нужен (подсписки рекомендованных и инвайтов в каналы разнесены по отдельным компонентам)
     * но keys нужны для виртуального скролла
     */
    if (withNewChannels) {
        return {
            channelsList: channels,
            inboundRequestsStartIndex: channels.length,
            recommendedStartIndex: channels.length,
            isChannelsRecommendationsVisible: false,
            keys,
        };
    }
    return {
        channelsList,
        inboundRequestsStartIndex,
        recommendedStartIndex,
        isChannelsRecommendationsVisible,
        keys,
    };
};
const ChannelsListInboundRequests = ({ onClick, activeChannelId }) => {
    const channelsCache = useChannels();
    const dispatch = useDispatch();
    const { inboundRequest } = useOrganisers().channelFilters;
    const inboundRequestChannelsIds = inboundRequest.channelIds;
    const { lang } = useBrowserEnv();
    const [mode, setMode] = useState('preview');
    const [isLoadingMore, setIsloadingMore] = useState(false);
    const inboundRequestChannelsTotalCount = inboundRequest.totalCount;
    const inboundRequestChannels = useMemo(() => Array.from(inboundRequestChannelsIds)
        .map((channelId) => Channel.safeGet(channelsCache, channelId))
        .filter((channel) => channel.kind === 'Channel')
        .sort(ChannelFilters.sorter), [inboundRequestChannelsIds, channelsCache]);
    const REGULAR_OFFSET_STEP = 10;
    const PREVIEW_OFFSET = 2;
    const [visibleOffset, setVisibleOffset] = useState(REGULAR_OFFSET_STEP);
    const previewList = inboundRequestChannels.slice(0, PREVIEW_OFFSET);
    const allList = inboundRequestChannels.slice(0, visibleOffset);
    const list = mode === 'preview' ? previewList : allList;
    const noButtons = inboundRequestChannelsTotalCount <= PREVIEW_OFFSET;
    const hideAllButton = !noButtons && mode === 'all';
    const showAllButton = !noButtons &&
        mode === 'preview' &&
        inboundRequestChannelsTotalCount > PREVIEW_OFFSET;
    const showMoreButton = !noButtons &&
        mode === 'all' &&
        inboundRequestChannelsTotalCount > visibleOffset;
    const handleShowAll = () => {
        setMode('all');
    };
    const handleHideAll = () => {
        setMode('preview');
        setVisibleOffset(REGULAR_OFFSET_STEP);
    };
    const handleLoadMore = () => {
        setVisibleOffset((curOffset) => curOffset + REGULAR_OFFSET_STEP);
        if (inboundRequest.hasMore) {
            setIsloadingMore(true);
            dispatch({
                type: 'MoreChannelsNeeded',
                organiser: {
                    kind: 'channelFilters',
                    filter: 'inboundRequest',
                },
                onComplete: () => setIsloadingMore(false),
            });
        }
    };
    /**
     * Если в частично подгруженном списке инвайтов пользователь начинает отклонять или принимать инвайты
     * то подгружаем ему ещё пачку, на замену принятым/отклонённым
     */
    useEffect(() => {
        if (!inboundRequest.hasMore) {
            return;
        }
        if (isLoadingMore) {
            return;
        }
        const needMoreInPreviewMode = mode === 'preview' && inboundRequestChannels.length <= PREVIEW_OFFSET;
        const needMoreInAllMode = mode === 'all' && inboundRequestChannels.length <= visibleOffset;
        if (needMoreInPreviewMode || needMoreInAllMode) {
            setIsloadingMore(true);
            dispatch({
                type: 'MoreChannelsNeeded',
                organiser: {
                    kind: 'channelFilters',
                    filter: 'inboundRequest',
                },
                onComplete: () => setIsloadingMore(false),
            });
        }
    }, [
        isLoadingMore,
        inboundRequest.hasMore,
        mode,
        visibleOffset,
        dispatch,
        list.length,
        inboundRequestChannels.length,
    ]);
    return (React.createElement("div", null,
        React.createElement(Header, { className: "ChannelsList__inboundRequestsListHeader", size: "s", after: React.createElement(React.Fragment, null,
                hideAllButton && (React.createElement(Button, { mode: "link", onClick: handleHideAll }, lang.use('me_hide_all_channels_inbound_requests'))),
                showAllButton && (React.createElement(Button, { mode: "link", onClick: handleShowAll }, lang.use('me_show_more')))) },
            React.createElement("span", { className: "ChannelsList__inboundRequestsListHeaderTitle" },
                lang.use('me_channels_inbound_requests'),
                inboundRequestChannelsTotalCount > PREVIEW_OFFSET && (React.createElement(Counter, { className: "ChannelsList__inboundRequestsListHeaderCounter", mode: "primary", size: "s" }, inboundRequestChannelsTotalCount)))),
        list.map((channel) => (React.createElement("div", { className: cx('ChannelsList__item', 'ChannelsList__item--composite'), key: channel.id, role: "presentation" },
            React.createElement(ChannelsListInboundRequest, { isActive: activeChannelId === channel.id, channel: channel, onClick: () => onClick(channel.id, 'channel') })))),
        showMoreButton && (React.createElement(CellButton, { disabled: isLoadingMore, onClick: handleLoadMore, centered: true }, lang.use('me_show_more')))));
};
const ChannelsListRecommendedChannels = ({ onClick, activeChannelId }) => {
    const { lang, stats } = useBrowserEnv();
    const { channelsRecommendations, loadMore, hasMore } = useChannelsRecommendations();
    const handleClick = (channelId, trackCode) => {
        stats.logEvent({
            type: 'type_click',
            screen: 'im_channels_list',
            type_click: {
                type: 'type_channel_item',
                item: {
                    type: 'click_item',
                    track_code: trackCode,
                },
                type_channel_item: {
                    source: 'folder_recomm',
                },
            },
        });
        onClick(channelId, 'folder_recomm');
    };
    return (React.createElement("div", { "data-testid": "channels_list_recommended" },
        React.createElement(Header, { className: "ChannelsList__recommendedChannelsListHeader", size: "s" }, lang.use('me_channels_recommendations')),
        channelsRecommendations.map((channel) => (React.createElement(ChannelItemViewAnalytics, { screen: "im_channels_list", source: "folder_recomm", trackCode: channel.searchTrackCode, key: channel.id }, (ref) => (React.createElement("div", { className: cx('ChannelsList__item', 'ChannelsList__item--composite'), ref: ref, key: channel.id, role: "presentation" },
            React.createElement(ChannelsListRecommendedChannel, { isActive: activeChannelId === channel.id, channel: channel, onClick: () => handleClick(channel.id, channel.searchTrackCode), joinSource: "folder_recomm_plus" })))))),
        hasMore && (React.createElement(OptimizedSpinner, { className: "ChannelsList__loader", onIntersection: loadMore, 
            // Для очень высоких экранов после загрузки очередной страницы тригернём спиннер ещё раз,
            // чтобы убедиться что он действительно пропал из поля видимости
            key: channelsRecommendations.length }))));
};
export const ChannelsListNew = React.memo(function ChannelsList({ keys, channelsList, hasMore, selectedOrganiser, canPinMoreChannels, }) {
    const { lang, perfStats } = useBrowserEnv();
    const dispatch = useDispatch();
    const { navigate, screenRoute } = useRouter();
    const { vkm_channels_recomm } = useFeatureFlags();
    const { inboundRequest } = useOrganisers().channelFilters;
    const inboundRequestChannelsTotalCount = inboundRequest.totalCount;
    const activeChannelId = screenRoute.kind === 'ChannelRoute' ? screenRoute.channelId : undefined;
    const { isOpen: isMainPanelOpen } = useCollapsibleContainer();
    const pinChannelErrorModal = useModal();
    const handlePinChannel = useCallback((channelId) => {
        if (canPinMoreChannels) {
            dispatch({
                type: 'UserChangedChannel',
                channelId,
                userAction: 'pin',
            });
        }
        else {
            pinChannelErrorModal.open();
        }
    }, [canPinMoreChannels, dispatch, pinChannelErrorModal]);
    const openChannel = (channelId, entrypoint) => {
        perfStats?.removeEvent(IPerfStats.EventType.openChannel);
        perfStats?.addEvent(IPerfStats.EventType.openChannel, {
            data: {
                start: perfStats.getCurrentTime(),
            },
        });
        navigate({
            kind: 'ChannelRoute',
            channelId,
            organiser: screenRoute.organiser,
            entrypoint,
        });
    };
    const isNewInboundRequestChannelsVisible = Boolean(inboundRequestChannelsTotalCount &&
        (selectedOrganiser.filter === 'all' ||
            selectedOrganiser.filter === 'unread') &&
        isMainPanelOpen);
    const isRecommendedChannelsVisible = Boolean(vkm_channels_recomm &&
        (selectedOrganiser.filter === 'all' ||
            selectedOrganiser.filter === 'unread') &&
        isMainPanelOpen);
    const userDoesntHaveSubscribtions = channelsList.length === 0 && !hasMore;
    if (userDoesntHaveSubscribtions) {
        const showPlaceHolder = userDoesntHaveSubscribtions &&
            !isNewInboundRequestChannelsVisible &&
            !isRecommendedChannelsVisible;
        if (showPlaceHolder) {
            return React.createElement(EmptyChannelsList, { organiser: selectedOrganiser });
        }
        else {
            return (React.createElement(React.Fragment, null,
                isNewInboundRequestChannelsVisible && (React.createElement(ChannelsListInboundRequests, { activeChannelId: activeChannelId, onClick: openChannel })),
                isRecommendedChannelsVisible && (React.createElement(ChannelsListRecommendedChannels, { activeChannelId: activeChannelId, onClick: openChannel }))));
        }
    }
    return (React.createElement(React.Fragment, null,
        !isMainPanelOpen && (React.createElement("div", { className: "ConvoList__folderDropDownEmptySpace" })),
        isNewInboundRequestChannelsVisible && (React.createElement(ChannelsListInboundRequests, { activeChannelId: activeChannelId, onClick: openChannel })),
        React.createElement("div", null,
            isNewInboundRequestChannelsVisible && (React.createElement(Header, { className: "ChannelsList__header", size: "s" }, lang.use('me_my_channels'))),
            channelsList.map((channel, index) => {
                const key = keys[index];
                if (key === undefined) {
                    if (isDev) {
                        throw new Error('Передан массив ключей не соотвествующий списку каналов');
                    }
                    return null;
                }
                const isAfterPinned = isChannelAfterPinned(channel, channelsList[index - 1]);
                return (React.createElement(VirtualScrollItem, { key: key, itemKey: key, className: cx('ChannelsList__itemWrapper', {
                        'ChannelsList__itemWrapper--separator': isAfterPinned,
                    }) },
                    React.createElement("div", { className: "ChannelsList__item", role: "presentation" },
                        React.createElement(ChannelsListItem, { channel: channel, isActive: activeChannelId === channel.id, isCollapsed: !isMainPanelOpen, handlePinChannel: handlePinChannel, withCounter: selectedOrganiser.filter !== 'archive', onClick: () => openChannel(channel.id, 'channel') }))));
            }),
            hasMore ? (React.createElement(OptimizedSpinner, { className: "ChannelsList__loader", onIntersection: () => {
                    dispatch({
                        type: 'MoreChannelsNeeded',
                        organiser: selectedOrganiser,
                    });
                } })) : (isRecommendedChannelsVisible && (React.createElement(ChannelsListRecommendedChannels, { activeChannelId: activeChannelId, onClick: openChannel })))),
        !!channelsList.length && !hasMore && !isMainPanelOpen && (React.createElement("div", { className: "ConvoList__emptySpace" })),
        pinChannelErrorModal.isActive && (React.createElement(ModalDialog, { title: lang.use('me_error_title'), content: lang.use('me_too_many_channels_pinned_error'), closeLabel: lang.use('me_close'), onClose: pinChannelErrorModal.close, buttons: React.createElement(Button, { onClick: pinChannelErrorModal.close }, lang.use('me_close')) }))));
});
export const ChannelsList = ({ channelsList, keys, inboundRequestsStartIndex, recommendedStartIndex, isChannelsRecommendationsVisible, hasMore, selectedOrganiser, canPinMoreChannels, }) => {
    const { withNewChannels } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    // Заглушка для старых каналов (для web.vk.me)
    if (featureFlags.vkm_old_channels_mock && !withNewChannels) {
        return (React.createElement("div", { className: "ChannelsList__stub" },
            React.createElement(ChannelVkMeStubContent, null)));
    }
    return withNewChannels ? (React.createElement(ChannelsListNew, { keys: keys, channelsList: channelsList, hasMore: hasMore, selectedOrganiser: selectedOrganiser, canPinMoreChannels: canPinMoreChannels })) : (React.createElement(ChannelsListOld, { channelsList: channelsList, keys: keys, inboundRequestsStartIndex: inboundRequestsStartIndex, recommendedStartIndex: recommendedStartIndex, isChannelsRecommendationsVisible: isChannelsRecommendationsVisible, hasMore: hasMore, selectedOrganiser: selectedOrganiser, canPinMoreChannels: canPinMoreChannels }));
};
//# sourceMappingURL=ChannelsList.js.map