import { Button } from '@vkontakte/vkui';
import React, { useCallback, useState, useEffect } from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import './FoldersModalNew.css';
import { useRouter } from '../../ui/Router/Router';
import { useBrowserEnv, usePrevious } from '../../hooks/misc';
import { FolderForm } from '../../ui/FolderForm/FolderForm';
import { ConvoPickerModal } from '../../ui/ConvoPickerModal/ConvoPickerModal';
import { useCreateFolder } from '../../hooks/useCreateFolder';
/**
 * Избегаемся от лишних пересчетов пропа selection
 * для ConvoPicker внутри ConvoPickerModal.
 * Подробнее см. описание МРа https://jira.mvk.com/browse/ME-62010.
 */
const EMPTY_PEER_IDS = [];
export const FoldersModalNew = ({ folders, convos, addedPeers: initialAddedPeers, }) => {
    const { pop } = useRouter();
    const { lang } = useBrowserEnv();
    const { createFolder, isLoading: newFolderLock } = useCreateFolder();
    const [activeModal, setActiveModal] = useState('new');
    const prevNewFolderLock = usePrevious(newFolderLock);
    const [addedPeers, setAddedPeers] = useState(initialAddedPeers);
    const [editedName, setEditedName] = useState('');
    const [hasFormError, setFormError] = useState(false);
    const handleNewSubmit = () => {
        if (hasFormError || newFolderLock) {
            return;
        }
        createFolder({
            folderName: editedName,
            folderType: 'default',
            addedPeers: Array.from(addedPeers),
        });
    };
    const handleDeletePeer = useCallback((id) => {
        setAddedPeers(addedPeers.filter((peerId) => peerId !== id));
    }, [addedPeers, setAddedPeers]);
    const onChangeFolderPeerIds = useCallback((peerIds) => {
        setAddedPeers(peerIds);
        setActiveModal('new');
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addedPeers, setActiveModal]);
    useEffect(() => {
        // Если поменялся лок с true на false, то запрос на создание папки закончился
        // и можем спокойно закрывать модалку
        if (!newFolderLock && prevNewFolderLock) {
            pop();
        }
    }, [newFolderLock, prevNewFolderLock, pop]);
    return (React.createElement(React.Fragment, null,
        activeModal === 'new' && (React.createElement(ModalInterface, { title: lang.use('me_folder_create'), onClose: pop, closeLabel: lang.use('me_close'), backLabel: lang.use('me_back'), contextClass: "MEConfig", withCustomLayout: true, buttons: React.createElement(Button, { mode: "primary", onClick: handleNewSubmit, disabled: hasFormError, loading: newFolderLock }, lang.use('me_complete')) },
            React.createElement("div", { className: "FoldersModalNew__form" },
                React.createElement(FolderForm, { name: editedName, peerIds: addedPeers, onNameChange: setEditedName, onAddClick: () => setActiveModal('change'), listClassName: "FoldersModalNew__convoList", convosCache: convos, folders: folders, autoNameFocus: true, onDeleteItem: handleDeletePeer, onValidChange: (isValid) => setFormError(!isValid), onSubmit: handleNewSubmit })))),
        activeModal === 'change' && (React.createElement(ConvoPickerModal, { withChips: true, initialPeerIds: addedPeers, sublistsPeerIds: EMPTY_PEER_IDS, onClose: () => setActiveModal('new'), onBack: () => setActiveModal('new'), onSubmit: onChangeFolderPeerIds }))));
};
//# sourceMappingURL=FoldersModalNew.js.map