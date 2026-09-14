import { Button } from '@vkontakte/vkui';
import * as Folders from '../../../core/model/Folder';
import React, { useCallback, useLayoutEffect, useMemo, useState, } from 'react';
import { useRouter } from '../../ui/Router/Router';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import './FoldersModalEdit.css';
import { useBrowserEnv, useDispatch, useFeatureFlags, useViewer, } from '../../hooks/misc';
import { FolderForm } from '../../ui/FolderForm/FolderForm';
import { ConvoPickerModal } from '../../ui/ConvoPickerModal/ConvoPickerModal';
import { FoldersModalConfirmDelete } from '../../ui/FoldersModalConfirmDelete/FoldersModalConfirmDelete';
const Modal = ({ selectedFolder, sublists, folders, locks, convos }) => {
    const { pop } = useRouter();
    const { lang, stats } = useBrowserEnv();
    const { settings } = useViewer();
    const { vkm_remove_hide_channel_folder } = useFeatureFlags();
    const [activeModal, setActiveModal] = useState('edit');
    const dispatch = useDispatch();
    const [addedPeers, setAddedPeers] = useState(new Set());
    const [removedPeers, setRemovedPeers] = useState(new Set());
    const [editedName, setEditedName] = useState('');
    const [hasFormError, setFormError] = useState(false);
    const [editedCountFolder, setEditedCountFolder] = useState(false);
    const isLoading = locks.updateFolder.has(selectedFolder.id);
    const isSelectedFolderRecommended = selectedFolder.type !== 'default';
    const isSelectedFolderChannels = selectedFolder.type === 'channels';
    const isFolderDeleteActionShown = !(isSelectedFolderChannels && vkm_remove_hide_channel_folder);
    const handleUpdateSubmit = useCallback(() => {
        if (hasFormError || isLoading) {
            return;
        }
        dispatch({
            type: 'UserUpdatedFolder',
            folderId: selectedFolder.id,
            name: editedName,
            addPeerIds: addedPeers,
            removePeerIds: removedPeers,
        });
        if (selectedFolder.type === 'channels' ||
            selectedFolder.type === 'managed_groups') {
            const settingName = selectedFolder.type === 'channels'
                ? 'countChannels'
                : 'countGroupDialogs';
            if (settings[settingName] !== editedCountFolder) {
                dispatch({
                    type: 'UserChangedSetting',
                    setting: settingName,
                    value: editedCountFolder,
                });
                stats.logEvent({
                    type: 'type_click',
                    type_click: {
                        item: {
                            type: 'click_item',
                        },
                        type: 'type_im_counter_settings_click',
                        type_im_counter_settings_click: {
                            event: editedCountFolder ? 'counter_enabled' : 'counter_disabled',
                            label: settingName === 'countGroupDialogs'
                                ? 'communities_counter_folder'
                                : 'channel_counter_folder',
                        },
                    },
                });
            }
        }
        pop();
    }, [
        stats,
        isLoading,
        editedCountFolder,
        editedName,
        hasFormError,
        addedPeers,
        removedPeers,
        settings,
        selectedFolder.id,
        selectedFolder.type,
        dispatch,
        pop,
    ]);
    useLayoutEffect(() => {
        setEditedName(selectedFolder.name);
        if (selectedFolder.type === 'channels') {
            setEditedCountFolder(settings.countChannels);
        }
        if (selectedFolder.type === 'managed_groups') {
            setEditedCountFolder(settings.countGroupDialogs);
        }
    }, [selectedFolder, settings.countChannels, settings.countGroupDialogs]);
    const handleDeletePeer = (id) => {
        if (addedPeers.delete(id)) {
            setAddedPeers(new Set([...addedPeers]));
        }
        else {
            setRemovedPeers(new Set([...removedPeers, id]));
        }
    };
    const onChangeFolderPeerIds = (peerIds) => {
        const allAddedPeers = peerIds.filter((id) => !selectedFolder.peerIds.has(id));
        const allRemovedPeers = Array.from(selectedFolder.peerIds).filter((id) => !peerIds.includes(id));
        addedPeers.forEach((id) => {
            if (!peerIds.includes(id)) {
                addedPeers.delete(id);
            }
        });
        removedPeers.forEach((id) => {
            if (peerIds.includes(id)) {
                removedPeers.delete(id);
            }
        });
        setAddedPeers(new Set([...addedPeers, ...allAddedPeers]));
        setRemovedPeers(new Set([...removedPeers, ...allRemovedPeers]));
        setActiveModal('edit');
    };
    const folderPeerIds = useMemo(() => {
        const ids = selectedFolder.peerIds;
        return [...addedPeers, ...ids].filter((id) => !removedPeers.has(id));
    }, [addedPeers, removedPeers, selectedFolder.peerIds]);
    const folderSublistsPeerIds = useMemo(() => {
        return Array.from(new Set(Folders.getSublistsPeerIds(selectedFolder, sublists)));
    }, [selectedFolder, sublists]);
    const modalButtons = useMemo(() => {
        const buttons = [
            React.createElement(Button, { key: "save", mode: "primary", onClick: handleUpdateSubmit, disabled: hasFormError, loading: isLoading }, lang.use('me_complete')),
        ];
        if (isFolderDeleteActionShown) {
            // Вставляем в начало
            buttons.unshift(React.createElement(Button, { key: "delete", mode: "tertiary", hasHover: false, onClick: () => setActiveModal('delete'), className: "FoldersModalEdit__deleteBtn" }, lang.use(isSelectedFolderRecommended
                ? 'me_folder_hide_action'
                : 'me_folder_delete_action')));
        }
        return buttons;
    }, [
        lang,
        isLoading,
        isFolderDeleteActionShown,
        isSelectedFolderRecommended,
        hasFormError,
        handleUpdateSubmit,
    ]);
    return (React.createElement(React.Fragment, null,
        activeModal === 'edit' && (React.createElement(ModalInterface, { title: lang.use('me_folder_update'), onClose: pop, closeLabel: lang.use('me_close'), backLabel: lang.use('me_back'), contextClass: "MEConfig", withCustomLayout: true, buttons: modalButtons },
            React.createElement("div", { className: "FoldersModalEdit__form" },
                React.createElement(FolderForm, { folderId: selectedFolder.id, folderType: selectedFolder.type, name: editedName, peerIds: folderPeerIds, listClassName: "FoldersModalEdit__convoList", onNameChange: setEditedName, onAddClick: () => setActiveModal('change'), onCountChange: setEditedCountFolder, convosCache: convos, folders: folders, sublists: sublists, countFolder: editedCountFolder, autoNameFocus: true, isRecommendedFolder: isSelectedFolderRecommended, onDeleteItem: handleDeletePeer, onValidChange: (isValid) => setFormError(!isValid), onSubmit: handleUpdateSubmit })))),
        activeModal === 'delete' && (React.createElement(FoldersModalConfirmDelete, { folder: selectedFolder, onDelete: pop, onClose: () => setActiveModal('edit') })),
        activeModal === 'change' && (React.createElement(ConvoPickerModal, { initialPeerIds: folderPeerIds, sublistsPeerIds: folderSublistsPeerIds, onClose: () => setActiveModal('edit'), onBack: () => setActiveModal('edit'), onSubmit: onChangeFolderPeerIds }))));
};
export const FoldersModalEdit = ({ folderId, folders, sublists, locks, convos }) => {
    const selectedFolder = useMemo(() => folders.find((f) => f.id === folderId), [folders, folderId]);
    return selectedFolder ? (React.createElement(Modal, { selectedFolder: selectedFolder, folders: folders, sublists: sublists, locks: locks, convos: convos })) : null;
};
//# sourceMappingURL=FoldersModalEdit.js.map