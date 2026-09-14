import { Icon24DotsVertical, Icon24FolderOutline, Icon56FolderPlusBadgeOutline, } from '@vkontakte/icons';
import { Button, useAdaptivityWithJSMediaQueries } from '@vkontakte/vkui';
import * as Folders from '../../../core/model/Folder';
import React, { useCallback, useMemo } from 'react';
import { useRouter } from '../../ui/Router/Router';
import './FoldersSettings.css';
import { useBrowserEnv, useDispatch, useFeatureFlags } from '../../hooks/misc';
import { getFolderIcon } from '../../ui/FolderAvatar/FolderAvatar';
import { SortableList, useSortable } from '../../ui/ReorderList/ReorderList';
import cx from 'classnames';
import { FolderAddButton } from '../../ui/FolderAddButton/FolderAddButton';
import { FoldersViewSettings } from '../../ui/FoldersViewSettings/FoldersViewSettings';
import { FieldGroup, FieldGroupItem } from '../../ui/FieldGroup/FieldGroup';
import { Touch, Avatar } from '@vkontakte/vkui';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { TextWithEmoji } from '../../ui/TextWithEmoji/TextWithEmoji';
import { FoldersRecommended } from '../../ui/FoldersRecommended/FoldersRecommended';
export const FoldersSettings = ({ folders, recommendedFolders, locks, foldersView, }) => {
    const { navigate } = useRouter();
    const { lang } = useBrowserEnv();
    const { isTwoColumnLayout } = useLayoutData();
    const features = useFeatureFlags();
    const openNewFolderModal = useCallback(() => {
        navigate({ kind: 'NewFolderModal' });
    }, [navigate]);
    const onCreateFolderModal = useCallback((folderId) => {
        const folder = folders.find((item) => item.id === folderId);
        const isChannelFolder = Folders.isChannelFolder(folder?.type);
        /* Не показываем модалку редактирования для папки каналов, т.к. там все равно нечего редактировать */
        if (isChannelFolder) {
            return;
        }
        navigate({ kind: 'EditFolderModal', folderId });
    }, [folders, navigate]);
    const openEditFolderModal = useCallback((folderId) => {
        navigate({ kind: 'EditFolderModal', folderId });
    }, [navigate]);
    return (React.createElement(React.Fragment, null,
        isTwoColumnLayout && foldersView === 'auto' && (React.createElement(FieldGroup, { title: lang.use('me_folders_view_settings_title') },
            React.createElement(FoldersViewSettings, null))),
        React.createElement(FieldGroup, { title: lang.use('me_folders_title') }, folders.length ? (React.createElement(FoldersList, { isCompact: true, folders: folders, isReorderEnabled: !locks.reorderFolders, onFolderClick: openEditFolderModal, onAddClick: openNewFolderModal })) : (React.createElement(FoldersEmpty, { onAddClick: openNewFolderModal }))),
        features.vkm_recommended_folders ? (React.createElement(FoldersRecommended, { folders: folders, recommendedFolders: recommendedFolders, onCreate: onCreateFolderModal })) : null));
};
const FoldersEmpty = ({ onAddClick, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: "FoldersSettings__empty" },
        React.createElement(Icon56FolderPlusBadgeOutline, { className: "FoldersSettings__emptyIcon", "aria-label": lang.use('me_folder_list_modal_empty_icon_tooltip') }),
        React.createElement("p", { className: "FoldersSettings__emptyText" }, lang.use('me_folder_list_modal_empty')),
        React.createElement("div", { className: "FoldersSettings__emptyActions" },
            React.createElement(Button, { mode: "primary", onClick: onAddClick }, lang.use('me_folder_list_modal_empty_action_add')))));
};
const FoldersList = ({ folders, isReorderEnabled, isCompact, onFolderClick, onAddClick, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const foldersOrder = useMemo(() => folders.map((folder) => folder.id), [folders]);
    const handleOrderChange = (order) => {
        dispatch({
            type: 'UserReorderedFolders',
            order: order.map((id) => Folders.resolveId(id)),
        });
    };
    return (React.createElement("div", { className: cx('FoldersSettings__list', {
            'FoldersSettings__list--compact': isCompact,
        }) },
        React.createElement(FolderAddButton, { onClick: onAddClick }, lang.use('me_folder_list_modal_action_add')),
        React.createElement(SortableList, { items: foldersOrder, onChange: handleOrderChange, disabled: !isReorderEnabled }, folders.map((folder) => (React.createElement(FolderListItem, { key: folder.id, folder: folder, onClick: onFolderClick }))))));
};
const FolderListItem = ({ folder, onClick, }) => {
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const { active, isDragging, attrs, styles, setNodeRef, onMove, onStart, onEnd, } = useSortable({
        id: folder.id,
        lockAxis: 'y',
    });
    const handleClick = useCallback(() => {
        onClick(folder.id);
    }, [folder.id, onClick]);
    // @todo вернуть как бэк научится возвращать кол-во чатов для списка папок
    // const subtitle = useMemo(() => {
    //   const count = folder.all.peerIds.size
    //   return lang.use('me_folder_peers_count', {
    //     values: { num: count.toString() },
    //     num: count,
    //   })
    // }, [lang, folder.all.peerIds.size])
    return (React.createElement("div", { ref: setNodeRef, style: styles, ...attrs },
        React.createElement(FieldGroupItem, { hasActive: true, hasHover: true, className: cx('FoldersSettings__folder', {
                'FoldersSettings__folder--dragging': active,
                'FoldersSettings__folder--noHover': !active && isDragging,
            }), onClick: handleClick, 
            // subtitle={subtitle}
            before: React.createElement(Avatar, { noBorder: true, size: 40, fallbackIcon: getFolderIcon(folder.name) ?? React.createElement(Icon24FolderOutline, null) }), after: React.createElement(Touch, { Component: "span", onStart: onStart, onEnd: onEnd, onMove: onMove, className: "FoldersSettings__dragButton" },
                React.createElement(Icon24DotsVertical, { fill: 'var(--vkui--color_icon_secondary)' }),
                !hasPointer && React.createElement("div", { className: "FoldersSettings__dragTapArea" })) },
            React.createElement(TextWithEmoji, { text: folder.name }))));
};
//# sourceMappingURL=FoldersSettings.js.map