import * as Organisers from '../../../core/model/Organisers';
import * as Folders from '../../../core/model/Folder';
import * as Tag from '../../../core/model/Tag';
import * as Viewer from '../../../core/model/Viewer';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { useBrowserEnv, useCommunityMessagingWithToggle, useFeatureFlags, useOrganisers, useViewer, } from '../../hooks/misc';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { UnreadCounter } from '../../ui/UnreadCounter/UnreadCounter';
import { UnreadCounterForManagedGroups } from '../../ui/UnreadCounter/UnreadCounterForManagedGroups';
import { Chip } from '../../ui/Chip/Chip';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { TextWithEmoji } from '../../ui/TextWithEmoji/TextWithEmoji';
import { OrganiserActionMenu } from '../../ui/OrganiserActionMenu/OrganiserActionMenu';
import { useRouter } from '../../ui/Router/Router';
import { Badge, HorizontalScroll } from '@vkontakte/vkui';
import { EllipsisText, Flex, TabsItem as UITabsItem, Tabs, } from '@vkontakte-internal/vkcom-kit';
import { Icon20GearOutline } from '@vkontakte/icons';
import { FoldersModalConfirmDelete } from '../../ui/FoldersModalConfirmDelete/FoldersModalConfirmDelete';
import './OrganiserViewHorizontal.css';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
import { OnboardingWrapper } from '../../ui/OnboardingWrapper/OnboardingWrapper';
import { DeferredRendering } from '../../ui/DeferredRendering/DeferredRendering';
const SCROLL_DEFAULT_OFFSET_WIDTH = 260;
const SCROLL_NAVIGATION_PADDINGS = 100;
export const OrganiserViewHorizontal = React.memo(({ items, activeIndex, onSelectOrganiser, channelsCount, channelsPrimaryCount, folders = [], isCounterHidden, onClickSettings, }) => {
    const { lang, vkcom_me } = useBrowserEnv();
    const { vkm_channels_onboarding } = useFeatureFlags();
    const { screenRoute } = useRouter();
    const $scrollContainer = useRef(null);
    const [deleteFolder, setDeleteFolder] = useState();
    const [isOrganiserBlocked, setIsOrganiserBlocked] = useState(false);
    const handleScrollToLeft = (i) => {
        const scrollWidth = ($scrollContainer.current?.offsetWidth ?? SCROLL_DEFAULT_OFFSET_WIDTH) -
            SCROLL_NAVIGATION_PADDINGS;
        return i - scrollWidth;
    };
    const handleScrollToRight = (i) => {
        const scrollWidth = ($scrollContainer.current?.offsetWidth ?? SCROLL_DEFAULT_OFFSET_WIDTH) -
            SCROLL_NAVIGATION_PADDINGS;
        return i + scrollWidth;
    };
    const handleDeleteItem = useCallback((organiser) => {
        if (organiser.kind === 'folders') {
            setDeleteFolder(folders.find((folder) => folder.id === organiser.id));
        }
    }, [folders]);
    return (React.createElement(DeferredRendering, { fallback: React.createElement("div", { className: "OrganiserViewHorizontal__fallback" }) },
        React.createElement(Tabs, { layoutFillMode: "auto", withScrollToSelectedTab: true, scrollBehaviorToSelectedTab: "center", mode: "accent", noMinWidth: true },
            React.createElement(HorizontalScroll, { getRef: $scrollContainer, getScrollToLeft: handleScrollToLeft, getScrollToRight: handleScrollToRight, arrowSize: "s" },
                React.createElement("div", { className: "OrganiserViewHorizontal" },
                    React.createElement("div", { className: "OrganiserViewHorizontal__tabs" }, items.map((item, i) => {
                        const isChannelsFolder = item.organiser.kind === 'folders' &&
                            item.organiser.type === 'channels';
                        const useVKCOMChannelsFolderTooltipOnboarding = isChannelsFolder &&
                            vkm_channels_onboarding &&
                            vkcom_me?.channelsFolderTooltipOnboardingRenderer;
                        if (useVKCOMChannelsFolderTooltipOnboarding) {
                            return vkcom_me.channelsFolderTooltipOnboardingRenderer?.(() => onSelectOrganiser(item.organiser), (scrollIntoView) => (React.createElement(TabsItem, { key: Organisers.getId(item.organiser), item: item, scrollIntoView: scrollIntoView, isSelected: activeIndex === i, channelsCount: channelsCount, channelsPrimaryCount: channelsPrimaryCount, isCounterHidden: isCounterHidden, onDelete: handleDeleteItem, onClick: onSelectOrganiser, setIsOrganiserBlocked: setIsOrganiserBlocked, "aria-setsize": items.length, "aria-posinset": i + 1, "aria-selected": activeIndex === i })), lang);
                        }
                        return (React.createElement(TabsItem, { key: Organisers.getId(item.organiser), item: item, isSelected: activeIndex === i, channelsCount: channelsCount, channelsPrimaryCount: channelsPrimaryCount, isCounterHidden: isCounterHidden, onDelete: handleDeleteItem, onClick: onSelectOrganiser, setIsOrganiserBlocked: setIsOrganiserBlocked, "aria-setsize": items.length, "aria-posinset": i + 1, "aria-selected": activeIndex === i }));
                    })),
                    onClickSettings && (React.createElement(OnboardingWrapper, { type: "tooltip", shown: screenRoute.kind === 'MainRoute', mode: "1", appearance: "lime", tilt: "left", tipPosition: "bottom-left", size: 48, content: lang.use('me_onboarding_folder_settings_button'), campaignName: "me_mvk:folder_settings_button", screen: "mvk_convo_list", enableQuarantine: true, onShowStart: () => {
                            /**
                             * Значение 100000 нужно только для проскролла до конца контейнера,
                             * иначе нет возможности получить полную ширину без задания нового ref для .OrganiserViewHorizontal
                             */
                            $scrollContainer.current?.scrollTo($scrollContainer.current.offsetWidth * 100000, 0);
                        } },
                        React.createElement("button", { type: "button", className: "OrganiserViewHorizontal__gear", onClick: onClickSettings, "aria-label": lang.use('me_folders_settings_gear_icon'), title: lang.use('me_folders_settings_gear_icon') },
                            React.createElement(Icon20GearOutline, null)))))),
            isOrganiserBlocked && (React.createElement("div", { className: "OrganiserViewHorizontal__Blocker" }))),
        deleteFolder && (React.createElement(FoldersModalConfirmDelete, { folder: deleteFolder, onDelete: () => setDeleteFolder(undefined), onClose: () => setDeleteFolder(undefined) }))));
});
const TabsItem = memo(({ item, isSelected, channelsCount = 0, channelsPrimaryCount = 0, scrollIntoView = false, isCounterHidden, onDelete, onClick, setIsOrganiserBlocked, ...ariaAttributes }) => {
    const { isContextMenuFastActionsOpened, openContextMenuFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const { settings } = useViewer();
    const featureFlags = useFeatureFlags();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const $tabItem = useRef(null);
    const $uiTabItem = useRef(null);
    const fastActionsTrigger = useFastActionsTrigger();
    const tabId = Organisers.getId(item.organiser);
    const isFolder = item.organiser.kind === 'folders';
    const isRecommendedFolder = item.organiser.kind === 'folders' && item.organiser.type !== 'default';
    const isChannelFolder = item.organiser.kind === 'folders'
        ? Folders.isChannelFolder(item.organiser.type)
        : false;
    const onContainerCapture = () => {
        setIsOrganiserBlocked(true);
        $tabItem.current?.firstElementChild?.scrollIntoView({
            behavior: 'smooth',
        });
    };
    const onContainerRelease = () => {
        setIsOrganiserBlocked(false);
    };
    useEffect(() => {
        if (scrollIntoView) {
            $uiTabItem.current?.scrollIntoView();
        }
    }, [scrollIntoView]);
    let after;
    if (!isCounterHidden?.(item)) {
        const isManagedGroupFolder = item.organiser.kind === 'folders'
            ? Folders.isManagedGroupFolder(item.organiser.type)
            : false;
        const managedGroupUnreadCount = !settings.groupsMessagesNotifySetting
            ? item.count
            : item.primaryCount === 0
                ? item.count
                : item.primaryCount;
        after =
            item.count > 0 ? (React.createElement(UnreadCounter, { count: item.primaryCount > 0 ? item.primaryCount : item.count, isMuted: item.primaryCount === 0, size: 18 })) : null;
        if (item.count && isManagedGroupFolder) {
            after = featureFlags.vkm_comm_counter_onboarding ? (React.createElement(UnreadCounterForManagedGroups, { count: managedGroupUnreadCount, isMuted: !settings.groupsMessagesNotifySetting || item.primaryCount === 0, size: 18, onContainerCapture: onContainerCapture, onContainerRelease: onContainerRelease })) : (React.createElement(UnreadCounter, { count: managedGroupUnreadCount, isMuted: !settings.groupsMessagesNotifySetting || item.primaryCount === 0, size: 18 }));
        }
        if (isChannelFolder && channelsCount) {
            after = (React.createElement(UnreadCounter, { count: channelsPrimaryCount || channelsCount, isMuted: !channelsPrimaryCount, size: 18 }));
        }
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "OrganiserViewHorizontal__itemContainer", ref: $tabItem },
            React.createElement(UITabsItem, { className: "OrganiserViewHorizontal__item", key: tabId, id: `${tabId}_label`, "aria-controls": tabId, selected: isSelected, after: after, onClick: () => onClick(item.organiser), getRootRef: $uiTabItem, ...ariaAttributes },
                React.createElement(TextWithEmoji, { text: item.name }))),
        (!isCommunityMessaging || isEdu) && fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { ref: $tabItem, allowNativeContextMenu: true, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, content: React.createElement(OrganiserActionMenu, { item: item.organiser, isFolder: isFolder, isRecommendedFolder: isRecommendedFolder, isChannelFolder: isChannelFolder, onDelete: () => onDelete(item.organiser) }) }))));
});
export function HorizontalTagList({ onSelectOrganiser, selectedOrganiser, }) {
    const organisers = useOrganisers();
    const currentMask = selectedOrganiser.item.kind === 'tags' ? selectedOrganiser.item.mask : 0;
    const tagMap = useMemo(() => {
        return Tag.convertMask(organisers.tags.items, currentMask);
    }, [currentMask, organisers.tags.items]);
    const $scrollContainer = useRef(null);
    const handleScrollToLeft = (i) => {
        const scrollWidth = ($scrollContainer.current?.offsetWidth ?? SCROLL_DEFAULT_OFFSET_WIDTH) -
            SCROLL_NAVIGATION_PADDINGS;
        return i - scrollWidth;
    };
    const handleScrollToRight = (i) => {
        const scrollWidth = ($scrollContainer.current?.offsetWidth ?? SCROLL_DEFAULT_OFFSET_WIDTH) -
            SCROLL_NAVIGATION_PADDINGS;
        return i + scrollWidth;
    };
    const handleToggleTag = (id) => {
        const mask = Tag.convertMask(organisers.tags.items, {
            ...tagMap,
            [id]: !tagMap[id],
        });
        onSelectOrganiser(mask
            ? { kind: 'tags', filter: 'all', mask }
            : { kind: 'filters', filter: 'all' });
    };
    return (React.createElement(HorizontalScroll, { arrowSize: "s", getRef: $scrollContainer, getScrollToLeft: handleScrollToLeft, getScrollToRight: handleScrollToRight },
        React.createElement(Flex, { gap: 6, noWrap: true }, organisers.tags.items.reduce((acc, tag) => {
            if (tagMap[tag.id]) {
                acc.push(React.createElement(Chip, { key: tag.id, fullName: tag.name, name: React.createElement(Flex, { align: "center", gap: 6 },
                        React.createElement(Badge, { style: { backgroundColor: `#${tag.color}` } }),
                        React.createElement(Flex.Item, null,
                            React.createElement(EllipsisText, { maxWidth: 200 }, tag.name))), onRemove: () => handleToggleTag(tag.id) }));
            }
            return acc;
        }, []))));
}
//# sourceMappingURL=OrganiserViewHorizontal.js.map