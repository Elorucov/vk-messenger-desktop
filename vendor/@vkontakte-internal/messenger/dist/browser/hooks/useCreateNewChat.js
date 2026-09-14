import { useState } from 'react';
import { useBrowserEnv, useDeviceId, useOwner, useViewer, } from '../hooks/misc';
import { NORMAL_CHAT_SETTINGS } from '../ui/ChatSettings/ChatSettings';
import * as Peer from '../../core/model/Peer';
import { getOwnerGroupId } from '../../data/store/State';
import { getLengthWithEmoji } from '../../core/utils/emoji';
import * as Viewer from '../../core/model/Viewer';
import { MAX_CHAT_NAME_LENGTH } from '../ui/ChatCreation/ChatCreation';
import { useApiFetch } from '../hooks/useApiFetch';
export function useCreateNewChat(onCreate, handleError, initialPeerIds, initialPhoneNumbers) {
    const { uploader } = useBrowserEnv();
    const viewerObject = useViewer();
    const { viewer } = viewerObject;
    const owner = useOwner();
    const deviceId = useDeviceId();
    const apiFetch = useApiFetch();
    const [file, setFile] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [peerIds, setPeerIds] = useState(initialPeerIds || []);
    const [phoneNumbers, setPhoneNumbers] = useState(initialPhoneNumbers || []);
    const [name, setName] = useState('');
    const [nameBeyondLimit, setNameBeyondLimit] = useState(false);
    const [isCreatingChat, setCreatingState] = useState(false);
    const [failedPhoneNumbers, setFailedPhoneNumbers] = useState([]);
    const [permissions, setPermissions] = useState(NORMAL_CHAT_SETTINGS);
    const isUploadingImage = file && !photo;
    const isValidForm = Boolean((name.trim().length > 0 || peerIds.length > 0) &&
        !isUploadingImage &&
        !nameBeyondLimit);
    const onNameChange = (event) => {
        const length = getLengthWithEmoji(event.target.value);
        setName(event.target.value);
        setNameBeyondLimit(length > MAX_CHAT_NAME_LENGTH);
    };
    const clearName = () => {
        setName('');
        setNameBeyondLimit(false);
    };
    const clearImage = () => {
        setFile(null);
        setPhoto(null);
    };
    const onPermissionsChange = (permissions) => {
        setPermissions(permissions);
    };
    const createChat = async () => {
        const usersIds = [viewer.id, ...peerIds];
        let chatId = null;
        const { stickers_popup_autoplay, ...restPermissions } = permissions;
        setCreatingState(true);
        try {
            try {
                const response = await apiFetch('messages.createChat', {
                    user_ids: Viewer.isService(viewerObject)
                        ? undefined
                        : usersIds.join(),
                    /** для сервисных учеток отправляем пир айди
                     * тк в юзер айди может быть только пользователь и друг
                     * а они обращаются только с контактами
                     * так же не преобразуем id  чтобы бэк понял что это контакт
                     */
                    peer_ids: Viewer.isService(viewerObject)
                        ? usersIds.join()
                        : undefined,
                    phone_numbers: phoneNumbers
                        .map((phone) => phone.replace(/[^0-9.]/g, ''))
                        .join(','),
                    title: name.trim(),
                    permissions: JSON.stringify(restPermissions || {}),
                    group_id: getOwnerGroupId(owner.id),
                    device_id: deviceId,
                    is_disable_stickers_popup_autoplay: stickers_popup_autoplay === 'off' ? 1 : 0,
                });
                if (!response.chat_id) {
                    throw new Error('Сервер не вернул идентификатор созданного чата');
                }
                chatId = Peer.resolveRealId('Chat', response.chat_id);
                if (response.failed_phone_numbers) {
                    setFailedPhoneNumbers(response.failed_phone_numbers);
                }
            }
            catch (error) {
                handleError(error);
                return;
            }
            if (file && chatId) {
                try {
                    await uploader.uploadFiles([file], { asChatPhoto: true }, {
                        viewerId: viewer.id,
                        targetPeerId: chatId,
                    });
                }
                catch (error) {
                    console.error(error);
                    // В случае неожиданной ошибки игнорируем её
                }
            }
        }
        finally {
            setCreatingState(false);
        }
        if (chatId === null) {
            return;
        }
        onCreate(chatId);
    };
    return {
        name,
        failedPhoneNumbers,
        peerIds,
        phoneNumbers,
        permissions,
        isValidForm,
        isCreatingChat,
        nameBeyondLimit,
        setFile,
        setPhoto,
        clearName,
        setPeerIds,
        setPhoneNumbers,
        createChat,
        clearImage,
        onNameChange,
        onPermissionsChange,
    };
}
//# sourceMappingURL=useCreateNewChat.js.map