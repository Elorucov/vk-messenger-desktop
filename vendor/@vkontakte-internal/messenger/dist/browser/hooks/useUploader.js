import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBrowserEnv, useDispatch, useViewer } from './misc';
import { isChannelUpload, isConvoUpload, Uploader } from '../../data/env/Uploader';
import { produce } from 'immer';
import { useSnackbar } from '../hooks/useSnackbar';
/**
 * Удобный хук для работы с аттачами в композере
 *
 * Для загрузки аватаров и тп. использовать сам uploader
 */
export const useUploader = ({ groupId, channelParentId, targetPeerId, draft, isChannel, isComment, postCmid, isPostponed, }, { onUploadStart, onUploadFinish, onUploadAbort, onError, onConvertationError, onUploadProgressUpdate, } = {}, overwriteHandlers) => {
    const { viewer: { id: viewerId }, } = useViewer();
    const messengerData = useMemo(() => ({
        viewerId,
        groupId,
        targetPeerId,
        isChannel,
        isComment,
        channelParentId,
        isCommunityChannel: Boolean(channelParentId),
    }), [groupId, isChannel, targetPeerId, viewerId, isComment, channelParentId]);
    const snackbar = useSnackbar();
    const dispatch = useDispatch();
    const { uploadsTrackIds } = draft;
    const trackIdsArray = useMemo(() => Array.from(uploadsTrackIds.values()), [uploadsTrackIds]);
    const trackIdsArrayRef = useRef(trackIdsArray);
    trackIdsArrayRef.current = trackIdsArray;
    const { uploader, lang } = useBrowserEnv();
    /**
     * delayed потому-что апдейт будет на следующий рендер
     */
    const [delayedUploaderState, setDelayedUploaderState] = useState({});
    const clearState = useCallback((trackIds) => setDelayedUploaderState(produce((draft) => Uploader.clearOptimisticAttachments(draft, trackIds))), []);
    const initialHandlers = useMemo(() => {
        return {
            onError: (trackId) => {
                onError?.(trackId);
                snackbar({
                    message: lang.use('me_composer_attachments_error_uploading'),
                });
            },
            onConvertationError: (entity) => {
                onConvertationError?.(entity);
                snackbar({
                    message: lang.use('me_composer_attachments_error_uploading'),
                });
            },
            onUploadProgressUpdate: (fileType) => {
                onUploadProgressUpdate?.(fileType);
            },
            onUploadStart: (trackId) => {
                onUploadStart?.(trackId);
                const hasChannelUpload = isChannelUpload(targetPeerId, isChannel);
                if (hasChannelUpload && isComment && postCmid) {
                    dispatch({
                        type: 'UserChangedCommentsComposerDraft',
                        kind: 'startUploading',
                        trackIds: [trackId],
                        channelId: targetPeerId,
                        postCmid,
                    });
                }
                if (hasChannelUpload && !postCmid) {
                    dispatch({
                        type: 'UserChangedChannelComposerDraft',
                        kind: 'startUploading',
                        trackIds: [trackId],
                        channelId: targetPeerId,
                    });
                }
                if (isConvoUpload(targetPeerId, isChannel)) {
                    dispatch({
                        type: 'UserChangedComposerDraft',
                        kind: 'startUploading',
                        trackIds: [trackId],
                        peerId: targetPeerId,
                        isPostponed,
                    });
                }
            },
            onUploadAbort: (trackId) => {
                onUploadAbort?.(trackId);
                const hasChannelUpload = isChannelUpload(targetPeerId, isChannel);
                if (hasChannelUpload && isComment && postCmid) {
                    dispatch({
                        type: 'UserChangedCommentsComposerDraft',
                        kind: 'removeUploads',
                        trackIds: [trackId],
                        channelId: targetPeerId,
                        postCmid,
                    });
                }
                if (hasChannelUpload && !postCmid) {
                    dispatch({
                        type: 'UserChangedChannelComposerDraft',
                        kind: 'removeUploads',
                        trackIds: [trackId],
                        channelId: targetPeerId,
                    });
                }
                if (isConvoUpload(targetPeerId, isChannel)) {
                    dispatch({
                        type: 'UserChangedComposerDraft',
                        kind: 'removeUploads',
                        trackIds: [trackId],
                        peerId: targetPeerId,
                        isPostponed,
                    });
                }
            },
            onUploadFinish: (result) => {
                onUploadFinish?.(result);
                const trackIds = Array.from(result.keys());
                const attachesArray = Array.from(result.values());
                const attaches = Uploader.buildAttachments(attachesArray);
                const hasChannelUpload = isChannelUpload(targetPeerId, isChannel);
                if (hasChannelUpload && isComment && postCmid) {
                    dispatch({
                        type: 'UserChangedCommentsComposerDraft',
                        kind: 'addAttaches',
                        attaches,
                        trackIds,
                        channelId: targetPeerId,
                        postCmid,
                    });
                }
                if (hasChannelUpload && !postCmid) {
                    dispatch({
                        type: 'UserChangedChannelComposerDraft',
                        kind: 'addAttaches',
                        attaches,
                        trackIds,
                        channelId: targetPeerId,
                    });
                }
                if (isConvoUpload(targetPeerId, isChannel)) {
                    dispatch({
                        type: 'UserChangedComposerDraft',
                        kind: 'addAttaches',
                        attaches,
                        trackIds,
                        peerId: targetPeerId,
                        isPostponed,
                    });
                }
            },
            ...overwriteHandlers,
        };
    }, [
        overwriteHandlers,
        onError,
        snackbar,
        lang,
        onConvertationError,
        onUploadProgressUpdate,
        onUploadStart,
        targetPeerId,
        isChannel,
        isComment,
        postCmid,
        dispatch,
        isPostponed,
        onUploadAbort,
        onUploadFinish,
    ]);
    const uploadFiles = useCallback((files, options = {}, handlers = {}) => {
        // грязный костыль для новых каналов. Делаем это здесь, чтобы в драфте компзера не сломать загрузку в нужный канал.
        // пока аплоад работает через загрузчики wall для новых каналов (communty_channel)
        // то в качестве id шлем id родительского сообщества.
        // TODO: после переезда на свои методы - удалить этот хак
        const modifiedMessengerData = {
            ...messengerData,
            targetPeerId: channelParentId || targetPeerId,
        };
        uploader.uploadFiles(files, options, modifiedMessengerData, {
            ...initialHandlers,
            ...handlers,
        });
    }, [messengerData, uploader, initialHandlers, channelParentId, targetPeerId]);
    useEffect(() => {
        const orphans = uploader.getOrphans(trackIdsArrayRef.current);
        const hasChannelUpload = isChannelUpload(targetPeerId, isChannel);
        if (hasChannelUpload && isComment && postCmid) {
            dispatch({
                type: 'UserChangedCommentsComposerDraft',
                kind: 'removeUploads',
                trackIds: orphans,
                channelId: targetPeerId,
                postCmid,
            });
        }
        if (hasChannelUpload && !postCmid) {
            dispatch({
                type: 'UserChangedChannelComposerDraft',
                kind: 'removeUploads',
                trackIds: orphans,
                channelId: targetPeerId,
            });
        }
        if (isConvoUpload(targetPeerId)) {
            dispatch({
                type: 'UserChangedComposerDraft',
                kind: 'removeUploads',
                trackIds: orphans,
                peerId: targetPeerId,
                isPostponed,
            });
        }
        clearState(orphans);
    }, [
        clearState,
        dispatch,
        isChannel,
        isComment,
        postCmid,
        targetPeerId,
        uploader,
        isPostponed,
    ]);
    useEffect(() => {
        const unsubscribe = uploader.subscribe(trackIdsArray, (attaches) => {
            setDelayedUploaderState(attaches);
        });
        return () => {
            unsubscribe(clearState);
        };
    }, [clearState, trackIdsArray, uploader]);
    const isEditing = useMemo(() => {
        return 'editing' in draft && !!draft.editing;
    }, [draft]);
    /**
     * Очищаем загрузки, если начинаем редактировать сообщение
     */
    useEffect(() => {
        if (isEditing) {
            trackIdsArrayRef.current.forEach((trackId) => {
                uploader.abortUpload(trackId);
            });
            /**
             * Показываем сообщение один раз
             */
            if (trackIdsArrayRef.current.length > 0) {
                snackbar({
                    message: lang.use('me_composer_attachments_abort_uploading'),
                });
            }
        }
    }, [isEditing, lang, snackbar, uploader]);
    /**
     * Это копия объекта оптимистичных аттачей
     *
     * Она требуется для своевременной синхронизации trackId из драфта
     * и локального стейта
     *
     * Так как аплоадер обновит состояние оптимистичных аттачей только
     * на следующий рендер ввиду использования состояния, мы пропускаем
     * целый цикл, при котором оптимистичный аттач и настоящий аттач могут
     * отрисоваться одновременно
     *
     * Чтобы этого не происходило завязываемся на апдейт draft
     */
    const uploaderState = useMemo(() => trackIdsArray.reduce((acc, trackId) => {
        const { photos, videos, audios, docs, voice } = delayedUploaderState;
        photos?.forEach((photo) => {
            if (photo.id === trackId) {
                acc.photos = [...(acc.photos || []), photo];
            }
        });
        videos?.forEach((video) => {
            if (video.id === trackId) {
                acc.videos = [...(acc.videos || []), video];
            }
        });
        audios?.forEach((audio) => {
            if (audio.id === trackId) {
                acc.audios = [...(acc.audios || []), audio];
            }
        });
        docs?.forEach((doc) => {
            if (doc.id === trackId) {
                acc.docs = [...(acc.docs || []), doc];
            }
        });
        if (voice?.id === trackId) {
            acc.voice = voice;
        }
        return acc;
    }, {}), [delayedUploaderState, trackIdsArray]);
    return {
        uploaderState,
        uploadFiles,
    };
};
//# sourceMappingURL=useUploader.js.map