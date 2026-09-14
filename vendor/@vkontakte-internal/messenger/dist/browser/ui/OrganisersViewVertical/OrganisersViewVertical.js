import { Icon20FolderOutline, Icon20MessagesOutline } from '@vkontakte/icons';
import * as Organisers from '../../../core/model/Organisers';
import * as Folder from '../../../core/model/Folder';
import React, { useRef, useState } from 'react';
import cx from 'classnames';
import './OrganisersViewVertical.css';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { OrganiserActionMenu } from '../../ui/OrganiserActionMenu/OrganiserActionMenu';
import { FolderAvatar } from '../../ui/FolderAvatar/FolderAvatar';
import { useHasScroll } from '../../hooks/useHasScroll';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { UnreadCounter } from '../../ui/UnreadCounter/UnreadCounter';
import { getOrganiserUid } from '../../utils/misc';
import { TextWithEmoji } from '../../ui/TextWithEmoji/TextWithEmoji';
import { Icon20GearOutline } from '@vkontakte/icons';
import { FoldersModalConfirmDelete } from '../../ui/FoldersModalConfirmDelete/FoldersModalConfirmDelete';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const OrganisersViewVertical = React.memo(({ items, folders = [], activeIndex, onSelectOrganiser, channelsCount, channelsPrimaryCount, isCounterHidden, onClickSettings, }) => {
    const { lang } = useBrowserEnv();
    const $list = useRef(null);
    const [deleteFolder, setDeleteFolder] = useState();
    const hasUnreadFolder = Boolean(folders.find((folder) => folder.type === 'unread'));
    const height = activeIndex === -1
        ? 0
        : $list.current?.children[activeIndex]?.clientHeight ?? 0;
    const offsetTop = $list.current?.children[activeIndex]?.offsetTop ?? 0;
    const { setRef, directions } = useHasScroll();
    const handleDeleteItem = (organiser) => {
        if (organiser.kind === 'folders') {
            setDeleteFolder(folders.find((folder) => folder.id === organiser.id));
        }
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "OrganisersViewVertical", style: {
                '--organisers_view_vertical_offset': offsetTop + 'px',
                '--organisers_view_vertical_height': height + 'px',
            } },
            React.createElement("div", { className: cx('OrganisersViewVertical__overlay', {
                    'OrganisersViewVertical__overlay--upScroll': directions.up,
                }) }),
            React.createElement("div", { className: cx('OrganisersViewVertical__content', {
                    'OrganisersViewVertical__content--smallPadding': !hasUnreadFolder,
                }), ref: setRef },
                React.createElement("span", { className: "OrganisersViewVertical__activeSlide" }),
                React.createElement("ul", { className: "OrganisersViewVertical__list", ref: $list }, items.map((item, i) => {
                    const isChannelFolder = item.organiser.kind === 'folders' &&
                        item.organiser.type === 'channels';
                    return (React.createElement(OrganisersItem, { key: Organisers.getId(item.organiser), item: item, count: isChannelFolder ? channelsCount : item.count, primaryCount: isChannelFolder ? channelsPrimaryCount : item.primaryCount, active: activeIndex === i, isCounterHidden: isCounterHidden, onDelete: () => handleDeleteItem(item.organiser), onClick: () => onSelectOrganiser(item.organiser) }));
                }))),
            React.createElement("div", { className: cx('OrganisersViewVertical__settings', {
                    'OrganisersViewVertical__settings--small': !hasUnreadFolder,
                }) },
                React.createElement("button", { type: "button", className: "OrganisersViewVertical__gear", onClick: onClickSettings, title: lang.use('me_folders_settings_gear_icon') },
                    React.createElement(Icon20GearOutline, null)))),
        deleteFolder && (React.createElement(FoldersModalConfirmDelete, { folder: deleteFolder, onClose: () => setDeleteFolder(undefined), onDelete: () => setDeleteFolder(undefined) }))));
});
const OrganisersItem = ({ item, active, count = 0, isCounterHidden, primaryCount = 0, onDelete, onClick, }) => {
    const { isContextMenuFastActionsOpened, openContextMenuFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const { settings } = useViewer();
    const $ref = useRef(null);
    const fastActionsTrigger = useFastActionsTrigger();
    const isFolder = item.organiser.kind === 'folders';
    const isRecommendedFolder = item.organiser.kind === 'folders' && item.organiser.type !== 'default';
    const isChannelFolder = item.organiser.kind === 'folders'
        ? Folder.isChannelFolder(item.organiser.type)
        : false;
    let counter;
    if (!isCounterHidden?.(item)) {
        const isManagedGroupFolder = item.organiser.kind === 'folders'
            ? Folder.isManagedGroupFolder(item.organiser.type)
            : false;
        const managedGroupUnreadCount = !settings.groupsMessagesNotifySetting
            ? count
            : primaryCount === 0
                ? count
                : primaryCount;
        if (count > 0) {
            counter = !isManagedGroupFolder ? (React.createElement(UnreadCounter, { className: "OrganisersViewVertical__itemCounter", count: primaryCount > 0 ? primaryCount : count, isMuted: primaryCount === 0, size: 18 })) : (React.createElement(UnreadCounter, { count: managedGroupUnreadCount, isMuted: !settings.groupsMessagesNotifySetting || primaryCount === 0, size: 18 }));
        }
    }
    return (React.createElement("li", { className: "OrganisersViewVertical__listItem", key: getOrganiserUid(item.organiser) },
        React.createElement("article", { ref: $ref },
            React.createElement("button", { type: "button", title: item.name, className: cx('OrganisersViewVertical__item', {
                    'OrganisersViewVertical__item--active': active,
                }), onClick: onClick },
                React.createElement("span", { className: "OrganisersViewVertical__itemAvatar" },
                    React.createElement(FolderAvatar, { name: item.name, counter: counter, defaultIcon: item.organiser.kind === 'filters' ? (React.createElement(Icon20MessagesOutline, null)) : (React.createElement(Icon20FolderOutline, null)), style: {
                            color: active
                                ? 'var(--vkui--color_background_accent_themed)'
                                : undefined,
                        } })),
                React.createElement("span", { className: "OrganisersViewVertical__itemBottom" },
                    React.createElement("span", { className: "OrganisersViewVertical__itemTitle" },
                        React.createElement(TextWithEmoji, { text: item.name }))))),
        fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { ref: $ref, allowNativeContextMenu: true, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, content: React.createElement(OrganiserActionMenu, { item: item.organiser, isFolder: isFolder, isRecommendedFolder: isRecommendedFolder, isChannelFolder: isChannelFolder, onDelete: onDelete }) }))));
};
//# sourceMappingURL=OrganisersViewVertical.js.map