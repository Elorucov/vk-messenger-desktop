import * as Attach from '../../../core/model/Attach';
import '../../ui/MediaViewer/MediaViewerVideo.css';
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useState, } from 'react';
import { VideoPlayer } from '../../env/VideoPlayer';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { LiveChecker } from '../../env/LiveChecker';
import { VideoPlayerChat } from '../../ui/VideoPlayerChat/VideoPlayerChat';
import { StickerCanvas } from '../../ui/MediaViewer/StickerCanvas';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { onElementKeyDownFactory } from '../../utils/elementKeyDown';
import { MediaViewerVideoRestriction } from '../../ui/MediaViewerVideoRestriction/MediaViewerVideoRestriction';
import { useRouter } from '../../ui/Router/Router';
export const MediaViewerVideo = memo(forwardRef(({ video }, ref) => {
    const [videoPlayer, setVideoPlayer] = useState(null);
    const { api, videoStickers } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const dispatch = useDispatch();
    const { modal } = useRouter();
    const [isChatShown, setChatShown] = useState(video?.type === 'live');
    const [ignoreRestriction, setIgnoreRestriction] = useState(false);
    const toggleChat = useCallback(() => setChatShown((prev) => !prev), []);
    const updateVideo = useCallback((video) => {
        if (modal && modal.kind === 'VideoModal') {
            dispatch({ type: 'VideoUpdateReceived', video, routeVideo: modal });
        }
    }, 
    // Делаем реинициализацию только при изменении video.id,
    // все остальные зависимости нас устраивают статичными на момент 1 рендера
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [video.id]);
    useEffect(() => {
        const liveChecker = Boolean(video.liveStatus)
            ? new LiveChecker(api, updateVideo)
            : undefined;
        const player = new VideoPlayer(video, liveChecker);
        setVideoPlayer(player);
        return () => {
            player.destroy();
        };
        // Делаем реинициализацию только при изменении video.id
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [video.id]);
    // Если событие KeyDown произошло на MediaViewerVideo – останавливаем его всплытие,
    // чтобы в MediaViewer не сработал переход
    const onKeyDown = onElementKeyDownFactory((keyCombo, event) => {
        // Но ESC – исключение, прокидываем событие выше, так как в этом случае, просмотрщик нужно закрыть
        if (keyCombo === 'Escape') {
            return;
        }
        return event.stopPropagation();
    });
    useImperativeHandle(ref, () => ({
        toggleChat,
    }), [toggleChat]);
    const isStickerCanvasShown = !isMobileLayout &&
        videoStickers &&
        isChatShown &&
        !videoPlayer?.isFullScreen &&
        document.visibilityState !== 'hidden' &&
        !videoStickers?.prefersReducedMotion;
    if (video.restriction && !ignoreRestriction) {
        const preview = Attach.preview(video, window.innerWidth);
        return (React.createElement("div", { className: "MediaViewerVideo" },
            React.createElement(MediaViewerVideoRestriction, { restriction: video.restriction, preview: preview?.url, onButtonClick: () => setIgnoreRestriction(true) })));
    }
    return (videoPlayer && (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "MediaViewerVideo", onKeyDown: onKeyDown },
            React.createElement("div", { className: "MediaViewerVideo__container", id: `MediaViewerVideoContainer_${video.id}`, ref: videoPlayer.initPlayer }, isStickerCanvasShown && React.createElement(StickerCanvas, null)),
            !isMobileLayout && (React.createElement(VideoPlayerChat, { video: video, isChatShown: isChatShown }))))));
}));
//# sourceMappingURL=MediaViewerVideo.js.map