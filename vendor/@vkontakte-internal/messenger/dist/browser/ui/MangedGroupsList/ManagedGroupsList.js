import './ManagedGroupsList.css';
import React, { useMemo, useState, useCallback } from 'react';
import { Button, Title, Subhead } from '@vkontakte/vkui';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import * as ManagedGroup from '../../../core/model/ManagedGroup';
import AutoSizer from 'react-virtualized-auto-sizer';
import cx from 'classnames';
import { VirtualizerCore, } from '../../ui/VirtualScroll/VirtualizerCore';
import { useMemoWithCustomCompare, isDepsShallowEqual, useBrowserEnv, useViewer, } from '../../hooks/misc';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import { useVirtualScroll } from '../../ui/VirtualScroll/useVirtualScroll';
import { MANAGED_GROUPS_PER_PAGE } from '../../../core/config/config';
import { VirtualScrollItem } from '../../ui/VirtualScroll/VirtualScrollItem';
import { VirtualScrollList } from '../../ui/VirtualScroll/VirtualScrollList';
import { ManagedGroupsListItem } from '../../ui/ManagedGroupsListItem/ManagedGroupsListItem';
import { Icon56MessageReadOutline, Icon56ErrorOutline } from '@vkontakte/icons';
import { useStatsOnMount } from '../../hooks/useStatsOnMount';
import { getLogEventLabel } from '../../../data/utils/typeMessagingActionItem';
const VIRTUALIZER_CONFIG = {
    sliceCount: MANAGED_GROUPS_PER_PAGE,
    preloadCount: MANAGED_GROUPS_PER_PAGE / 10,
    throttleDelay: 100,
    sliceCountIncrement: MANAGED_GROUPS_PER_PAGE / 2,
    sliceByViewAreaRatio: 2.5,
};
export const ManagedGroupsList = React.memo(function ManagedGroupsList({ selectedOrganiser, managedGroupsCache, onOrganiserChange, }) {
    const [isModalShown, setModalShown] = useState(false);
    const { settings } = useViewer();
    const { lang, stats, vkDomain } = useBrowserEnv();
    const { isOpen: isMainPanelOpen } = useCollapsibleContainer();
    useStatsOnMount({
        type: 'type_navgo',
        type_navgo: {
            screen: 'im_community_list',
            subtype: 'go',
        },
    });
    const managedGroupsList = useMemo(() => Array.from(managedGroupsCache.values()).filter((m) => {
        if (selectedOrganiser.filter === 'unread' &&
            !ManagedGroup.isUnread(m)) {
            return false;
        }
        return m.id !== 0;
    }), [managedGroupsCache, selectedOrganiser]);
    const unreadPlaceholderText = useMemo(() => {
        if (!isMainPanelOpen) {
            return lang.use('me_managed_group_list_collapse_placeholder_unread');
        }
        const unreadPlaceholderSet = lang
            .use('me_managed_group_list_placeholder_unread_set')
            .split('|');
        return unreadPlaceholderSet[Math.floor(Math.random() * unreadPlaceholderSet.length)]?.trim();
    }, [lang, isMainPanelOpen]);
    const [scrollableNode, setScrollableNode] = useState(null);
    const [content, setContent] = useState(null);
    const scrollableProps = useMemo(() => ({
        ref: setScrollableNode,
    }), []);
    const contentProps = useMemo(() => ({
        className: 'ManagedGroupsList__scrollbar-content',
        ref: setContent,
    }), []);
    const [virtualizerCore] = useState(() => new VirtualizerCore(VIRTUALIZER_CONFIG));
    const scrollPosition = useMemo(() => ({
        kind: 'Upper',
    }), []);
    const getKey = useCallback((managedGroup) => managedGroup.id.toString(), []);
    const handleClick = useCallback((e, managedGroup) => {
        if (!managedGroup.canManageBy2FA) {
            e.preventDefault();
            setModalShown(true);
        }
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'open_community_chats',
                    group_id: managedGroup.id,
                    label: getLogEventLabel(),
                },
            },
        });
    }, [stats]);
    const itemsKeys = useMemoWithCustomCompare(() => managedGroupsList.map(getKey), [managedGroupsList], isDepsShallowEqual);
    const { virtualizerState } = useVirtualScroll({
        virtualizerCore,
        wrapper: scrollableNode,
        content,
        options: {
            scrollPosition,
            itemsKeys,
            anchorAlign: 'scrollTop',
        },
    });
    const renderList = () => {
        if (managedGroupsList.length === 0) {
            return (React.createElement("div", { className: "ManagedGroupsList__empty" },
                React.createElement("div", { className: "ManagedGroupsList__empty-icon" },
                    React.createElement(Icon56MessageReadOutline, null)),
                React.createElement("div", null, unreadPlaceholderText),
                isMainPanelOpen && (React.createElement("button", { className: "ManagedGroupsList__link", onClick: () => {
                        onOrganiserChange({ ...selectedOrganiser, filter: 'all' });
                    } }, lang.use('me_managed_group_list_placeholder_unread_link')))));
        }
        return (React.createElement("div", { className: "ManagedGroupsList__items" },
            !isMainPanelOpen && (React.createElement("div", { className: "ConvoList__folderDropDownEmptySpace" })),
            React.createElement(AutoSizer, { disableWidth: true }, (size) => (React.createElement(ScrollbarProvider, { style: { height: size.height }, scrollableProps: scrollableProps, contentProps: contentProps, overflowX: "hidden" },
                React.createElement(VirtualScrollList, { virtualizerCore: virtualizerCore, virtualizerState: virtualizerState }, managedGroupsList.map((managedGroup) => {
                    const key = getKey(managedGroup);
                    return (React.createElement(VirtualScrollItem, { key: key, itemKey: key, className: "ManagedGroupsList__itemWrapper" },
                        React.createElement("div", { className: "ManagedGroupsList__item" },
                            React.createElement(ManagedGroupsListItem, { url: `${vkDomain}/gim${managedGroup.id}`, isAllMuted: !settings.groupsMessagesNotifySetting, onClick: handleClick, managedGroup: managedGroup, isCollapsed: !isMainPanelOpen }))));
                })))))));
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: cx('ManagedGroupsList', {
                'ManagedGroupsList--collapsed': !isMainPanelOpen,
            }) }, renderList()),
        isModalShown && (React.createElement(ManagedGroupsListModal, { onClose: () => setModalShown(false) }))));
});
export const ManagedGroupsListModal = ({ onClose }) => {
    const { lang, vkcom_me } = useBrowserEnv();
    const handleOpen2FA = () => {
        vkcom_me?.openVkid2faSettings();
    };
    return (React.createElement(ModalInterface, { withCustomLayout: true, title: "", headerClass: "ManagedGroupsListModal__header", backLabel: lang.use('me_back'), closeLabel: lang.use('me_close'), onClose: onClose },
        React.createElement("div", { className: "ManagedGroupsListModal__content" },
            React.createElement(Icon56ErrorOutline, { className: "ManagedGroupsListModal__icon", color: "var(--vkui--color_icon_secondary)" }),
            React.createElement(Title, { level: "2", weight: "1", className: "ManagedGroupsListModal__title", Component: "h3", useAccentWeight: true }, lang.use('me_managed_group_list_modal_title')),
            React.createElement(Subhead, { className: "ManagedGroupsListModal__subhead" }, lang.use('me_managed_group_list_modal_subtitle')),
            React.createElement(Button, { className: "ManagedGroupsListModal__button", size: "l", onClick: handleOpen2FA, mode: "primary" }, lang.use('me_managed_group_list_modal_button')))));
};
//# sourceMappingURL=ManagedGroupsList.js.map