import './VideoPlayerWrapper.css';
import '../../ui/MediaViewer/MediaViewer.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API_ERROR_MESSAGES_SHOULD_BE_EDU } from '@vkontakte-internal/api-schema-typescript';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import * as Viewer from '../../../core/model/Viewer';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalView } from '../../ui/ModalView/ModalView';
import { useBrowserEnv, useConvos, useFeatureFlags, useViewer, } from '../../hooks/misc';
import { exhaustivenessCheck, isDev } from '../../../core/utils/misc';
import { fromApiVideo } from '../../../data/converter/AttachConverter';
import { MediaViewer } from '../../ui/MediaViewer/MediaViewer';
import { useApiFetch } from '../../hooks/useApiFetch';
import { Button, Spinner } from '@vkontakte/vkui';
import { IRouter } from '../../../data/env/IRouter';
import { fromApiMessage } from '../../../data/converter/MessageConverter';
import { MediaViewerToolbar } from '../../ui/MediaViewerToolbar/MediaViewerToolbar';
import { IApi } from '../../../data/env/IApi';
import { Icon56PhoneOutline } from '@vkontakte/icons';
import { UnifiedServiceModal } from '../../ui/UnifiedServiceModal/UnifiedServiceModal';
import { findMessageVideoLayer } from '../../../core/utils/video';
export const VideoPlayerWrapper = ({ routeVideo, contextClass, portalTarget, isHidden, onSetAccount, registerAccount, }) => {
    const apiFetch = useApiFetch();
    const featureFlags = useFeatureFlags();
    const viewer = useViewer();
    const convos = useConvos();
    const convo = routeVideo?.source && 'peerId' in routeVideo.source
        ? convos.get(routeVideo.source.peerId)
        : undefined;
    const isForwardingDisabled = !!convo && Convo.isMessagesForwardingDisabled(convo);
    const { isEduAvailable, router, lang } = useBrowserEnv();
    const [video, setVideo] = useState(null);
    const [isAccessDeniedEduCall, setAccessDeniedEduCall] = useState(false);
    const onClose = useCallback(() => router.pop(), [router]);
    const eduAccount = Viewer.eduAccount(viewer);
    const switchAccount = () => {
        if (!eduAccount) {
            if (registerAccount) {
                registerAccount('edu');
            }
            return;
        }
        if (onSetAccount) {
            onSetAccount(eduAccount.id, false);
        }
    };
    const setLoadedVideo = useCallback((loadedApiVideos, video) => {
        const targetVideo = loadedApiVideos.find((attachVideo) => attachVideo.id === video.id);
        if (!targetVideo) {
            return onClose();
        }
        setVideo(targetVideo);
    }, [onClose]);
    const loadVideoByMessageCmid = useCallback(async (peerId, cmid, videoId) => {
        const response = await apiFetch('messages.getByConversationMessageId', {
            peer_id: peerId,
            conversation_message_ids: cmid.toString(),
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
        return findMessageVideoLayer(message, videoId);
    }, [apiFetch, featureFlags, viewer.id]);
    const loadVideoById = useCallback(async (video) => {
        setAccessDeniedEduCall(false);
        const { ownerId, id, accessKey } = video;
        try {
            const response = await apiFetch('video.get', {
                owner_id: ownerId,
                videos: `${ownerId}_${id}${accessKey ? `_${accessKey}` : ''}`,
                extended: 0,
            });
            const loadedVideos = response.items.reduce((acc, apiVideo) => {
                const video = fromApiVideo({ apiVideo });
                if (video) {
                    acc.push(video);
                }
                return acc;
            }, []);
            setLoadedVideo(loadedVideos, video);
        }
        catch (err) {
            if (isDev) {
                throw err;
            }
            if (err instanceof IApi.RequestError) {
                if (err.code === API_ERROR_MESSAGES_SHOULD_BE_EDU && isEduAvailable) {
                    setAccessDeniedEduCall(true);
                    return;
                }
            }
            onClose();
        }
    }, [apiFetch, onClose, setLoadedVideo, isEduAvailable]);
    useEffect(() => {
        if (!routeVideo) {
            return onClose();
        }
        const { source } = routeVideo;
        if (!source) {
            loadVideoById(routeVideo);
            return () => { };
        }
        const loadVideoFromApi = async (videoPromise) => {
            try {
                const apiVideo = await videoPromise;
                if (!apiVideo) {
                    return onClose();
                }
                setLoadedVideo([apiVideo], routeVideo);
            }
            catch (err) {
                loadVideoById(routeVideo);
                if (isDev) {
                    throw err;
                }
            }
        };
        switch (source.kind) {
            case IRouter.RouteSourceKind.Message:
            case IRouter.RouteSourceKind.PostponedMessage: {
                // TODO: ME-56524 пересмотреть метод в ходе добавления модели отложенных
                const nodeData = convo && Convo.findHistoryNodeByCmid(convo, source.cmid);
                if (nodeData === undefined ||
                    nodeData.status === 'NotLoaded' ||
                    // Удаленное сообщение может быть закреплено и поэтому стоит загрузить
                    nodeData.status === 'Deleted') {
                    loadVideoFromApi(loadVideoByMessageCmid(source.peerId, source.cmid, routeVideo.id));
                    break;
                }
                if (nodeData.node.item.kind !== 'Normal') {
                    return onClose();
                }
                const message = nodeData.node.item;
                const videoAttach = findMessageVideoLayer(message, routeVideo.id);
                if (!videoAttach) {
                    return onClose();
                }
                if (!videoAttach.files) {
                    loadVideoById(routeVideo);
                    break;
                }
                setLoadedVideo([videoAttach], routeVideo);
                break;
            }
            case IRouter.RouteSourceKind.Post:
            case IRouter.RouteSourceKind.PostponedPost:
            case IRouter.RouteSourceKind.Comment:
            case IRouter.RouteSourceKind.Composer:
            case IRouter.RouteSourceKind.ChannelComposer:
            case IRouter.RouteSourceKind.CommentsComposer: {
                loadVideoById(routeVideo);
                break;
            }
            default:
                exhaustivenessCheck(source);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const mediaItems = useMemo(() => (video ? [video] : []), [video]);
    const $mediaViewerPhoto = React.useRef();
    const $mediaViewerVideo = React.useRef();
    if (isAccessDeniedEduCall && isEduAvailable) {
        const actionButton = (React.createElement(Button, { onClick: switchAccount, stretched: true, size: "l", className: "VideoPlayerWrapper__button" }, lang.use('me_proceed')));
        const icon = (React.createElement("div", { className: "VideoPlayerWrapper__icon" },
            React.createElement(Icon56PhoneOutline, null)));
        return (React.createElement(UnifiedServiceModal, { handleModalClose: onClose, title: lang.use('me_video_edu_account_error_caption'), subtitle: lang.use('me_video_edu_account_error_description'), image: icon, footer: actionButton }));
    }
    return (React.createElement(ModalView, { onEscape: onClose, contextClass: contextClass, portalTarget: portalTarget, isHidden: isHidden },
        React.createElement(ModalBackdrop, { onClick: onClose, isBodyScrollDisabled: true, className: "MediaViewer__modalBackdrop" },
            video && (React.createElement(MediaViewer, { mediaItems: mediaItems, onClose: onClose, mediaViewerPhotoRef: $mediaViewerPhoto, mediaViewerVideoRef: $mediaViewerVideo, toolbar: React.createElement(MediaViewerToolbar, { mediaItems: mediaItems, mediaViewerPhotoRef: $mediaViewerPhoto, mediaViewerVideoRef: $mediaViewerVideo, canShare: !isForwardingDisabled, canSave: !isForwardingDisabled }), withPhotoContextMenu: !isForwardingDisabled })),
            routeVideo && !video && (React.createElement(Spinner, { className: "VideoPlayerWrapper__spinner" })))));
};
//# sourceMappingURL=VideoPlayerWrapper.js.map