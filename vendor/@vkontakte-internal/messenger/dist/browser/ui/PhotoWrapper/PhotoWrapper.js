import '../../ui/MediaViewer/MediaViewer.css';
import React, { useCallback, useEffect, useState } from 'react';
import { useBrowserEnv, useFeatureFlags, useViewer } from '../../hooks/misc';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { MediaViewer } from '../../ui/MediaViewer/MediaViewer';
import { Spinner } from '@vkontakte/vkui';
import * as Message from '../../../core/model/Message';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import * as Channel from '../../../core/model/Channel';
import * as History from '../../../core/model/History';
import * as Post from '../../../core/model/Post';
import { exhaustivenessCheck, isDev } from '../../../core/utils/misc';
import { fromApiPhoto, fromApiWallAttach } from '../../../data/converter/AttachConverter';
import { IRouter } from '../../../data/env/IRouter';
import { useApiFetch } from '../../hooks/useApiFetch';
import { fromApiMessage } from '../../../data/converter/MessageConverter';
import { fromApiComment } from '../../../data/converter/CommentConverter';
import { MediaViewerToolbar } from '../../ui/MediaViewerToolbar/MediaViewerToolbar';
export const PhotoWrapper = ({ photoModal, contextClass, portalTarget, convos, channels, composerDrafts, channelComposerDrafts, commentsComposerDrafts, isHidden, }) => {
    const viewer = useViewer();
    const { router } = useBrowserEnv();
    const { screenRoute } = router;
    const apiFetch = useApiFetch();
    const featureFlags = useFeatureFlags();
    const [photoViewer, setPhotoViewer] = useState({
        photos: [],
        idx: 0,
    });
    const closePhotoViewer = useCallback(() => router.pop(), [router]);
    const peerId = screenRoute.kind === 'ConvoRoute' ? screenRoute.peerId : undefined;
    const channelId = screenRoute.kind === 'ChannelRoute' ? screenRoute.channelId : undefined;
    const postCmid = screenRoute.kind === 'ChannelRoute' ? screenRoute.postCmid : undefined;
    const convo = peerId && convos.get(peerId);
    const isForwardingDisabled = !!convo && Convo.isMessagesForwardingDisabled(convo);
    /** Осуществляет переход к следующей фотографии */
    const handleMediaViewerMove = useCallback((newMedia) => {
        if (!photoModal || newMedia.id === photoModal?.id) {
            return;
        }
        setPhotoViewer((prev) => ({
            ...prev,
            idx: prev.photos.findIndex((photo) => photo.id === newMedia.id) ?? 0,
        }));
        router.replace({ ...photoModal, id: newMedia.id });
    }, [router, photoModal]);
    /** Передает на отображение в PhotoViewer загруженные фотографии */
    const setLoadedPhotos = useCallback((loadedPhotos, photoModal) => {
        const targetPhotoIdx = loadedPhotos.findIndex((attachPhoto) => attachPhoto.id === photoModal.id);
        if (targetPhotoIdx === -1) {
            return closePhotoViewer();
        }
        setPhotoViewer({
            photos: loadedPhotos,
            idx: targetPhotoIdx,
        });
    }, [closePhotoViewer]);
    /**
     * Загрузка фотографий по messageId из messageAccessKey
     */
    const loadPhotosByMessageAccessKey = useCallback(async (messageAccessKey, photoId) => {
        const { messageIdMatch } = /mail(?<messageIdMatch>\d+-\d+)/gi.exec(messageAccessKey)?.groups || {};
        if (!messageIdMatch) {
            throw new Error('Передан некорректный messageAccessKey');
        }
        const [rawPeerId, rawCmid] = messageIdMatch.split('-');
        const peerId = Peer.resolveId(Number(rawPeerId));
        const cmid = Message.resolveCmid(Number(rawCmid));
        const response = await apiFetch('messages.getById', {
            peer_id: peerId,
            cmids: cmid.toString(),
            extended: 1,
            group_id: Peer.isGroupPeerId(viewer.id) ? Peer.toRealId(viewer.id) : 0,
        });
        const apiMessage = response.items[0];
        if (!apiMessage) {
            throw new Error('Не удалось получить сообщение');
        }
        const message = fromApiMessage(featureFlags, apiMessage).message;
        if (message.kind !== 'Normal') {
            return undefined;
        }
        return getPhotosFromMessage(message, photoId);
    }, [apiFetch, featureFlags, viewer]);
    /**
     * Загрузка фотографий по postCmid
     */
    const loadPhotosByPostCmid = useCallback(async (source) => {
        const response = await apiFetch('channels.getMessagesById', {
            channel_id: source.channelId,
            extended: 1,
            cmids: source.cmid.toString(),
        });
        const apiPostWall = response.items?.[0]?.attachments?.[0]?.wall;
        if (!apiPostWall) {
            throw new Error('Не удалось получить пост');
        }
        return fromApiWallAttach(apiPostWall).photos;
    }, [apiFetch]);
    /**
     * Загрузка фотографий по commentCmid
     */
    const loadPhotosByCommentCmid = useCallback(async (source, photoId, isPostFromCommunityChannel) => {
        let apiComment;
        if (isPostFromCommunityChannel) {
            const response = await apiFetch('channels.getComment', {
                channel_id: source.channelId,
                comment_id: source.commentCmid,
                extended: 1,
            });
            apiComment = response.items[0];
        }
        else {
            //TODO: comments: метод wall.getComment тоже существует. Надо подумать над переездом на него
            const response = await apiFetch('wall.getComments', {
                owner_id: source.channelId,
                post_id: source.postCmid,
                start_comment_id: source.commentCmid,
                count: 1,
                offset: 0,
                extended: 1,
            });
            apiComment = response.items[0];
        }
        if (!apiComment) {
            throw new Error('Не удалось получить комментарий');
        }
        const comment = fromApiComment(apiComment, source.channelId, source.postCmid);
        if (comment.kind !== 'Normal') {
            return undefined;
        }
        return getPhotosFromComment(comment, photoId);
    }, [apiFetch]);
    /**
     * Загрузка фотографий по photoId
     */
    const loadPhotosById = useCallback(async (photoModal) => {
        const { ownerId, id, accessKey } = photoModal;
        try {
            const response = await apiFetch('photos.getById', {
                photos: `${ownerId}_${id}${accessKey ? `_${accessKey}` : ''}`,
                extended: 1,
                photo_sizes: 1,
            });
            const loadedPhotos = response.reduce((acc, apiPhoto) => {
                const photo = fromApiPhoto({ apiPhoto });
                if (photo) {
                    acc.push(photo);
                }
                return acc;
            }, []);
            setLoadedPhotos(loadedPhotos, photoModal);
        }
        catch (err) {
            if (isDev) {
                throw err;
            }
            closePhotoViewer();
        }
    }, [apiFetch, closePhotoViewer, setLoadedPhotos]);
    useEffect(() => {
        if (!photoModal) {
            return closePhotoViewer();
        }
        const { source } = photoModal;
        if (!source) {
            loadPhotosById(photoModal);
            return () => { };
        }
        const loadPhotosFromApi = async (photosPromise) => {
            try {
                const apiPhotos = await photosPromise;
                if (!apiPhotos) {
                    return closePhotoViewer();
                }
                setLoadedPhotos(apiPhotos, photoModal);
            }
            catch (err) {
                loadPhotosById(photoModal);
                if (isDev) {
                    throw err;
                }
            }
        };
        switch (source.kind) {
            case IRouter.RouteSourceKind.Message: {
                const convo = convos.get(source.peerId);
                const message = convo && Convo.findMessageByCmid(convo, source.cmid);
                if (!message) {
                    if (source.messageAccessKey) {
                        loadPhotosFromApi(loadPhotosByMessageAccessKey(source.messageAccessKey, photoModal.id)).catch(() => {
                            // @todo разобраться почему прилетает неправильный source.messageAccessKey
                            loadPhotosById(photoModal);
                        });
                        break;
                    }
                    loadPhotosById(photoModal);
                    break;
                }
                if (message.kind === 'Service' || message.kind === 'Expired') {
                    return closePhotoViewer();
                }
                const messagePhotos = getPhotosFromMessage(message, photoModal.id);
                if (!messagePhotos) {
                    return closePhotoViewer();
                }
                setLoadedPhotos(messagePhotos, photoModal);
                break;
            }
            // TODO: ME-56524 пересмотреть метод в ходе добавления модели отложенных
            case IRouter.RouteSourceKind.PostponedMessage: {
                const convo = convos.get(source.peerId);
                const message = convo && Convo.findMessageByCmid(convo, source.cmid);
                if (!message) {
                    if (source.messageAccessKey) {
                        loadPhotosFromApi(loadPhotosByMessageAccessKey(source.messageAccessKey, photoModal.id)).catch(() => {
                            // @todo разобраться почему прилетает неправильный source.messageAccessKey
                            loadPhotosById(photoModal);
                        });
                        break;
                    }
                    loadPhotosById(photoModal);
                    break;
                }
                if (message.kind === 'Service' || message.kind === 'Expired') {
                    return closePhotoViewer();
                }
                const messagePhotos = getPhotosFromMessage(message, photoModal.id);
                if (!messagePhotos) {
                    return closePhotoViewer();
                }
                setLoadedPhotos(messagePhotos, photoModal);
                break;
            }
            case IRouter.RouteSourceKind.Post: {
                const channel = channels.get(source.channelId);
                if (channel === undefined) {
                    loadPhotosFromApi(loadPhotosByPostCmid(source));
                    break;
                }
                if (channel.kind === 'ChannelRestricted') {
                    return closePhotoViewer();
                }
                const nodeData = History.findNodeByCmid(channel.history, source.cmid);
                if (nodeData.status === 'NotLoaded') {
                    loadPhotosFromApi(loadPhotosByPostCmid(source));
                    break;
                }
                if (nodeData.status === 'Deleted') {
                    return closePhotoViewer();
                }
                const post = nodeData.node.item;
                setLoadedPhotos(spreadAttachPhotos(post.attaches), photoModal);
                break;
            }
            case IRouter.RouteSourceKind.PostponedPost: {
                const channel = channels.get(source.channelId);
                if (!channel || channel.kind === 'ChannelRestricted') {
                    return closePhotoViewer();
                }
                const post = Channel.findPostInPostponedByCmid(channel, source.cmid);
                if (!post) {
                    return closePhotoViewer();
                }
                setLoadedPhotos(spreadAttachPhotos(post.attaches), photoModal);
                break;
            }
            case IRouter.RouteSourceKind.Comment: {
                const channel = channels.get(source.channelId);
                if (!channel) {
                    return closePhotoViewer();
                }
                if (channel.kind === 'ChannelRestricted') {
                    return closePhotoViewer();
                }
                const nodeData = History.findNodeByCmid(channel.history, source.postCmid);
                if (nodeData?.status === 'Deleted') {
                    return closePhotoViewer();
                }
                const post = nodeData?.status === 'Node' && nodeData.node.item;
                const comment = post && Post.findCommentByCmid(post, source.commentCmid);
                if (!comment) {
                    const isCommunityChannel = Channel.isCommunityChannel(channel);
                    loadPhotosFromApi(loadPhotosByCommentCmid(source, photoModal.id, isCommunityChannel));
                    break;
                }
                if (comment.kind === 'Deleted') {
                    return closePhotoViewer();
                }
                const commentPhotos = getPhotosFromComment(comment, photoModal.id);
                if (!commentPhotos) {
                    return closePhotoViewer();
                }
                setLoadedPhotos(commentPhotos, photoModal);
                break;
            }
            case IRouter.RouteSourceKind.Composer: {
                if (!peerId) {
                    return closePhotoViewer();
                }
                const composerPeerDrafts = composerDrafts[peerId];
                const composerDraft = composerPeerDrafts &&
                    composerPeerDrafts[composerPeerDrafts.length - 1];
                if (!composerDraft) {
                    return closePhotoViewer();
                }
                setLoadedPhotos(spreadAttachPhotos(composerDraft.attaches), photoModal);
                break;
            }
            case IRouter.RouteSourceKind.ChannelComposer: {
                if (!channelId) {
                    return closePhotoViewer();
                }
                const composerDraft = channelComposerDrafts[channelId];
                if (!composerDraft) {
                    return closePhotoViewer();
                }
                setLoadedPhotos(spreadAttachPhotos(composerDraft.attaches), photoModal);
                break;
            }
            case IRouter.RouteSourceKind.CommentsComposer: {
                if (!channelId || !postCmid) {
                    return closePhotoViewer();
                }
                const composerDraft = commentsComposerDrafts[`${channelId}-${postCmid}`];
                if (!composerDraft) {
                    return closePhotoViewer();
                }
                setLoadedPhotos(spreadAttachPhotos(composerDraft.attaches), photoModal);
                break;
            }
            default:
                exhaustivenessCheck(source);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const $mediaViewerPhoto = React.useRef();
    return (React.createElement(ModalView, { onEscape: closePhotoViewer, contextClass: contextClass, portalTarget: portalTarget, isHidden: isHidden },
        React.createElement(ModalBackdrop, { onClick: closePhotoViewer, className: "MediaViewer__modalBackdrop" }, photoViewer.photos.length ? (React.createElement(MediaViewer, { mediaItems: photoViewer.photos, initialIdx: photoViewer.idx, onPrev: handleMediaViewerMove, onNext: handleMediaViewerMove, onClose: closePhotoViewer, mediaViewerPhotoRef: $mediaViewerPhoto, toolbar: React.createElement(MediaViewerToolbar, { mediaItems: photoViewer.photos, index: photoViewer.idx, mediaViewerPhotoRef: $mediaViewerPhoto, canShare: !isForwardingDisabled, canSave: !isForwardingDisabled }), withPhotoContextMenu: !isForwardingDisabled })) : (React.createElement(Spinner, null)))));
};
/** Вытаскивает фотографии из всех уровней атачей */
const spreadAttachPhotos = (attaches) => {
    return [
        ...(attaches.photos || []),
        ...(attaches.wall?.attaches.photos || []),
        ...(attaches.wallReply?.attaches.photos || []),
    ];
};
const getPhotosFromMessage = (message, photoId) => findPhotoLayer(message, (item) => {
    const layer = [];
    if (item.forwardedMessages) {
        layer.push(...item.forwardedMessages);
    }
    if (item.replyMessage && item.replyMessage.kind !== 'ForeignExpired') {
        layer.push(item.replyMessage);
    }
    return layer;
}, photoId);
const getPhotosFromComment = (comment, photoId) => findPhotoLayer(comment, (item) => item.replies.history.filter((reply) => reply.kind === 'Normal') || [], photoId);
/** Собирает фотографии с переданного объекта, имеющего attaches */
const findPhotoLayer = (root, getItemTree, photoId) => {
    const queue = [root];
    while (queue.length !== 0) {
        const currentItem = queue.shift();
        if (!currentItem) {
            // Невозможный сценарий
            return undefined;
        }
        queue.push(...getItemTree(currentItem));
        const spreadedPhotos = spreadAttachPhotos(currentItem.attaches);
        const hasTargetPhoto = spreadedPhotos.findIndex((attachPhoto) => attachPhoto.id === photoId) !==
            -1;
        if (hasTargetPhoto) {
            return spreadedPhotos;
        }
    }
    return undefined;
};
//# sourceMappingURL=PhotoWrapper.js.map