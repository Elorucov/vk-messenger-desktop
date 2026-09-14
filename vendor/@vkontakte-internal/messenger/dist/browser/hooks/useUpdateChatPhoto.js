import { useBrowserEnv, useDispatch, useOwner, usePeers, useViewer, } from '../hooks/misc';
import { useCallback, useState } from 'react';
import * as Peer from '../../core/model/Peer';
export function useUpdateChatPhoto(convo) {
    const dispatch = useDispatch();
    const { id: ownerId } = useOwner();
    const { viewer } = useViewer();
    const { uploader } = useBrowserEnv();
    const peers = usePeers();
    const peer = Peer.safeGet(peers, convo.peerId);
    const isInfoEditable = convo.kind === 'ChatConvo' && convo.acl.canChangeInfo;
    const [isChatPhotoUploading, setChatPhotoUploading] = useState(false);
    const [chatPhoto, setChatPhoto] = useState(null);
    const removeChatPhoto = useCallback(() => {
        if (!isInfoEditable) {
            return;
        }
        dispatch({
            type: 'UserRemovedChatPhoto',
            peerId: convo.peerId,
        });
    }, [convo.peerId, dispatch, isInfoEditable]);
    const saveChatPhoto = useCallback(async (photoAttach) => {
        if (!chatPhoto || peer.kind !== 'Chat') {
            return;
        }
        try {
            setChatPhotoUploading(true);
            await uploader.uploadFiles([chatPhoto], { asChatPhoto: true }, {
                groupId: Peer.isGroupPeerId(ownerId) ? ownerId : undefined,
                viewerId: viewer.id,
                targetPeerId: peer.id,
            });
            dispatch({
                type: 'UserSetChatPhoto',
                peerId: peer.id,
                photo: photoAttach,
            });
        }
        catch (error) {
            console.error(error);
            // В случае неожиданной ошибки игнорируем её
        }
        finally {
            setChatPhotoUploading(false);
        }
    }, [
        setChatPhotoUploading,
        chatPhoto,
        dispatch,
        ownerId,
        peer,
        viewer,
        uploader,
    ]);
    return {
        isChatPhotoUploading,
        setChatPhoto,
        saveChatPhoto,
        removeChatPhoto,
    };
}
//# sourceMappingURL=useUpdateChatPhoto.js.map