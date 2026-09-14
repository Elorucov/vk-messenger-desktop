import { useCallback } from 'react';
import { useDispatch } from '../../hooks/misc';
import { useUploader } from '../../hooks/useUploader';
export const useComposerAttachments = ({ composerDraft, peerId, channelId, postCmid, isChannel, isComment, isPostponed, onUploadProgressUpdate, onUploadStart, groupId, channelParentId, }) => {
    const dispatch = useDispatch();
    const { uploaderState, uploadFiles } = useUploader({
        targetPeerId: channelId ?? peerId,
        draft: composerDraft,
        isChannel,
        isComment,
        postCmid,
        groupId,
        channelParentId,
        isPostponed,
    }, {
        onUploadProgressUpdate,
        onUploadStart,
    });
    const addAttaches = useCallback((attaches) => {
        if (channelId && postCmid) {
            dispatch({
                type: 'UserChangedCommentsComposerDraft',
                kind: 'addAttaches',
                channelId,
                postCmid,
                attaches,
            });
        }
        if (channelId && !postCmid) {
            dispatch({
                channelId,
                type: 'UserChangedChannelComposerDraft',
                kind: 'addAttaches',
                attaches,
            });
        }
        if (peerId) {
            dispatch({
                peerId,
                type: 'UserChangedComposerDraft',
                kind: 'addAttaches',
                attaches,
                isPostponed,
            });
        }
    }, [channelId, dispatch, peerId, postCmid, isPostponed]);
    const rearrangeAttaches = useCallback((key, currentPosition, newPosition) => {
        if (channelId && postCmid) {
            dispatch({
                type: 'UserChangedCommentsComposerDraft',
                kind: 'rearrangeAttaches',
                channelId,
                postCmid,
                key,
                newPosition,
                currentPosition,
            });
        }
        if (channelId && !postCmid) {
            dispatch({
                channelId,
                type: 'UserChangedChannelComposerDraft',
                kind: 'rearrangeAttaches',
                key,
                newPosition,
                currentPosition,
            });
        }
        if (peerId) {
            dispatch({
                peerId,
                type: 'UserChangedComposerDraft',
                kind: 'rearrangeAttaches',
                key,
                newPosition,
                currentPosition,
                isPostponed,
            });
        }
    }, [channelId, dispatch, peerId, postCmid, isPostponed]);
    const removeAttaches = useCallback((attach, index) => {
        if (channelId && postCmid) {
            dispatch({
                type: 'UserChangedCommentsComposerDraft',
                kind: 'removeAttach',
                channelId,
                postCmid,
                attach,
                index,
            });
        }
        if (channelId && !postCmid) {
            dispatch({
                channelId,
                type: 'UserChangedChannelComposerDraft',
                kind: 'removeAttach',
                attach,
                index,
            });
        }
        if (peerId) {
            dispatch({
                peerId,
                type: 'UserChangedComposerDraft',
                kind: 'removeAttach',
                attach,
                index,
                isPostponed,
            });
        }
    }, [channelId, dispatch, peerId, postCmid, isPostponed]);
    return {
        attaches: composerDraft.attaches,
        uploaderState,
        uploadFiles,
        addAttaches,
        removeAttaches,
        rearrangeAttaches,
    };
};
//# sourceMappingURL=useComposerAttachments.js.map