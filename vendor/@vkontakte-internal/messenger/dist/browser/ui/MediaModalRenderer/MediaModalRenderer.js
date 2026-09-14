import React, { useEffect } from 'react';
import { IRouter } from '../../../data/env/IRouter';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { MediaWrapper } from '../../ui/MediaWrapper/MediaWrapper';
import { ChannelMediaWrapper } from '../../ui/ChannelMediaWrapper/ChannelMediaWrapper';
import { PhotoWrapper } from '../../ui/PhotoWrapper/PhotoWrapper';
import { VideoPlayerWrapper } from '../../ui/VideoPlayerWrapper/VideoPlayerWrapper';
import { useBrowserEnv } from '../../hooks/misc';
import './MediaModalRenderer.css';
export const MediaModalRenderer = ({ modal, ...rest }) => {
    const { player, voicePlayer, videoMessagePlayer } = useBrowserEnv();
    // Выключаем скролл контента. Для vk.me не особо важно, а если встраиваемся, то такое надо
    useEffect(() => {
        document.body.classList.add('MediaModalDisableScroll');
        return () => {
            document.body.classList.remove('MediaModalDisableScroll');
        };
    });
    // Паузим другие плееры при открытии видео
    useEffect(() => {
        if (modal.kind === 'VideoModal') {
            player.pause();
            voicePlayer.pause();
            videoMessagePlayer.pause();
        }
    }, [modal.kind, player, videoMessagePlayer, voicePlayer]);
    // Сквозной просмотр в чате
    if (isModalSourceMessageWithMediaViewer(modal)) {
        return React.createElement(MediaWrapper, { modal: modal, ...rest });
    }
    // Сквозной просмотр в каналах
    if (isModalSourcePostWithMediaViewer(modal)) {
        return React.createElement(ChannelMediaWrapper, { modal: modal, ...rest });
    }
    switch (modal.kind) {
        case 'VideoModal':
            return (React.createElement(VideoPlayerWrapper, { routeVideo: modal, isHidden: rest.isHidden, onSetAccount: rest.onSetAccount, registerAccount: rest.registerAccount }));
        case 'PhotoModal':
            return React.createElement(PhotoWrapper, { photoModal: modal, ...rest });
        default:
            return exhaustivenessCheck(modal);
    }
};
function isModalSourceMessageWithMediaViewer(modal) {
    return (modal.source?.kind === IRouter.RouteSourceKind.Message &&
        !!modal.source.mediaViewerItemPosition);
}
function isModalSourcePostWithMediaViewer(modal) {
    return (modal.source?.kind === IRouter.RouteSourceKind.Post &&
        !!modal.source.mediaViewerItemPosition &&
        // пока только для фото
        modal.kind === 'PhotoModal');
}
//# sourceMappingURL=MediaModalRenderer.js.map