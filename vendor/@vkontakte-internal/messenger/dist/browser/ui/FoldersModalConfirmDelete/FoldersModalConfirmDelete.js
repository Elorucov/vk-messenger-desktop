import { Button } from '@vkontakte/vkui';
import * as Folders from '../../../core/model/Folder';
import React, { useCallback, useMemo } from 'react';
import * as Viewer from '../../../core/model/Viewer';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import './FoldersModalConfirmDelete.css';
import { useBrowserEnv, useDispatch, useFeatureFlags, useViewer, } from '../../hooks/misc';
export const FoldersModalConfirmDelete = ({ folder, onClose, onDelete, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const isChannelFolder = Folders.isChannelFolder(folder.type);
    const viewer = useViewer();
    const isSelectedFolderRecommended = folder.type !== 'default';
    const isEdu = Viewer.isEdu(viewer.profileType);
    const featureFlags = useFeatureFlags();
    const modalText = useMemo(() => {
        if (isChannelFolder) {
            // Текст подтверждения скрытия папки с каналами
            return !isEdu && featureFlags.vkm_channel_name_to_community
                ? lang.use('me_channels_community_folder_hide_confirmation_modal_text')
                : lang.use('me_channels_folder_hide_confirmation_modal_text');
        }
        else if (isSelectedFolderRecommended) {
            // Текст подтверждения скрытия папки с чатами
            return lang.use('me_chat_folder_hide_confirmation_modal_text');
        }
        else {
            // Текст подтверждения удаления папки с чатами
            return lang.use('me_chat_folder_delete_confirmation_modal_text');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSelectedFolderRecommended, isChannelFolder, lang]);
    const handleDeleteFolder = useCallback(() => {
        dispatch({
            type: 'UserDeletedFolder',
            folderId: folder.id,
        });
        onDelete();
    }, [dispatch, folder, onDelete]);
    return (React.createElement(ModalInterface, { title: lang.use(isSelectedFolderRecommended
            ? 'me_folder_hide_confirmation_modal_title'
            : 'me_folder_delete_confirmation_modal_title'), onClose: onClose, closeLabel: lang.use('me_close'), contextClass: "MEConfig", buttons: [
            React.createElement(Button, { key: "cancel", onClick: onClose, mode: "tertiary" }, lang.use('me_cancel')),
            React.createElement(Button, { key: "delete", onClick: handleDeleteFolder, mode: "primary" }, lang.use(isSelectedFolderRecommended
                ? 'me_folder_action_hide'
                : 'me_folder_action_delete')),
        ] },
        React.createElement("div", { className: "FoldersModalConfirmDelete__delete" }, modalText)));
};
//# sourceMappingURL=FoldersModalConfirmDelete.js.map