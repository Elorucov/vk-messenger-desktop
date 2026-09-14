import { useCallback, useEffect, useState, useContext, } from 'react';
import { useBrowserEnv } from '../hooks/misc';
import { ConvoVideoMessagesPlaylistContext } from '../ui/Playlists/ConvoVideoMessagesPlaylistContext';
import * as IPlayer from '../../data/env/IPlayer';
/**
 * Сюда вынесена работа c глобальным `VideoMessagePlayer`ом.
 */
export const useVideoMessagePlayer = ({ id, rootRef, message, onPlayed, }) => {
    const { videoMessagePlayer } = useBrowserEnv();
    const getVideoMessagesPlaylist = useContext(ConvoVideoMessagesPlaylistContext);
    const [status, setStatus] = useState(videoMessagePlayer.getState().currentVideoMessageTrack?.id === id
        ? videoMessagePlayer.getState().status
        : 'stopped');
    const [progress, setProgress] = useState(0);
    const handleVideoMessagePlayerStateUpdated = useCallback((state) => {
        if (state.currentVideoMessageTrack?.id === id) {
            switch (state.status) {
                case 'playing': {
                    if (status !== state.status) {
                        onPlayed(message);
                    }
                    // VirtualScroll сделает reflow на следующем кадре, поэтому и
                    // видеосообщение визуально должно обновиться не моментально,
                    // чтобы не было рывка.
                    window.requestAnimationFrame(() => {
                        setStatus(state.status);
                        setProgress(state.currentVideoMessageTrack?.progress ?? 0);
                    });
                    break;
                }
                case 'ended':
                case 'paused': {
                    setStatus(state.status);
                    break;
                }
                default:
                    break;
            }
            // Если в плеере обновился стейт с любым другим видеосообщением.
        }
        else {
            // Если обновился стейт у любого другого видеосообщения, и у нашего
            // видеосообщения сатус не 'stopped', сбрасываем его. Здесь не нужно
            // обновлять reflowKey, так как если включится следующее видео, то
            // reflowKey обновится при его включении, а если плеер выключится
            // совсем, то reflowKey обновиться в условии ниже. Если добавить тут
            // обновление reflowKey, то в кейсе, когда есть переход на следующее
            // видео, reflowKey обновиться 2 раза, и мы получим некорректное
            // отображение VirtualScroll.
            if (status !== 'stopped') {
                window.requestAnimationFrame(() => {
                    setStatus('stopped');
                });
            }
        }
    }, [status, id, message, onPlayed]);
    const handleVideoPlayerScrollToMessage = useCallback((scrollToId) => {
        if (scrollToId === id) {
            // Необходимо время, чтобы видеосообщения изменили свой размер,
            // успел произойти reflow и scrollIntoView отскроллил к корректной позиции
            window.setTimeout(() => {
                // Намеренно не используем VirtualScroll scrollTo,
                // так как он не умеет скроллить до конкретного пересланного сообщения, а только до корневого
                rootRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 50);
        }
    }, [id, rootRef]);
    // Синхронизируем изначальное состояние.
    useEffect(() => {
        handleVideoMessagePlayerStateUpdated(videoMessagePlayer.getState());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        videoMessagePlayer.subscribe(IPlayer.VideoMessagePlayerEventTypes.STATE_UPDATED, handleVideoMessagePlayerStateUpdated);
        videoMessagePlayer.subscribe(IPlayer.VideoMessagePlayerEventTypes.SCROLL_TO_MESSAGE, handleVideoPlayerScrollToMessage);
        return () => {
            videoMessagePlayer.unsubscribe(IPlayer.VideoMessagePlayerEventTypes.STATE_UPDATED, handleVideoMessagePlayerStateUpdated);
            videoMessagePlayer.unsubscribe(IPlayer.VideoMessagePlayerEventTypes.SCROLL_TO_MESSAGE, handleVideoPlayerScrollToMessage);
        };
    }, [
        videoMessagePlayer,
        handleVideoMessagePlayerStateUpdated,
        handleVideoPlayerScrollToMessage,
    ]);
    useEffect(() => {
        if (status === 'playing') {
            // Обновляем текущий плейлист.
            videoMessagePlayer.setPlaylist(getVideoMessagesPlaylist?.());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);
    return { status, progress };
};
//# sourceMappingURL=useVideoMessagePlayer.js.map