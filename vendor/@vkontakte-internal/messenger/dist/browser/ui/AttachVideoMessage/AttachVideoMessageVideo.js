import React, { useRef, useEffect, forwardRef, } from 'react';
import { useDidUpdate, useViewer } from '../../hooks/misc';
/**
 * Компонент, который показывает превью видеосообщения, которое пока не
 * воспроизводится глобально (т.е. через `VideoMessagePlayer`).
 */
export const AttachVideoMessageVideo = forwardRef(({ poster, src, status, className, setIsLoading, onError }, ref) => {
    const viewer = useViewer();
    const $video = useRef(null);
    useEffect(() => {
        if (!$video.current) {
            return;
        }
        // Останавливаем видео-превью, т.к. отрисовывается `<canvas />`.
        if (status === 'playing' || status === 'paused') {
            $video.current.pause();
            $video.current.currentTime = 0;
        }
        // Перезапускаем остановленное видео-превью, т.к. это видео больше
        // глобально не воспроизводится.
        else if ($video.current.readyState >= $video.current.HAVE_ENOUGH_DATA &&
            $video.current.paused &&
            viewer.settings.videoMessageAutoplay) {
            $video.current.currentTime = 0;
            // Используем noop в catch кейсе для того, чтобы не отваливаться из-за
            // ошибок в духе:
            // The play() request was interrupted because video-only background media was paused to save power
            $video.current.play().catch(() => { });
        }
        // Только при смене статуса
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);
    useDidUpdate(() => {
        if (!$video.current) {
            return;
        }
        $video.current.currentTime = 0;
        if (viewer.settings.videoMessageAutoplay) {
            $video.current.play().catch(() => { });
        }
        else {
            $video.current.pause();
        }
    }, [viewer.settings.videoMessageAutoplay]);
    // Яндекс.Браузер добавил свой аттрибут для PiP. Чтоб не видеть этот ужас, мы его выключаем
    useEffect(() => {
        if ($video.current) {
            $video.current.setAttribute('pip', 'false');
        }
    }, []);
    return (React.createElement("video", { ref: (node) => {
            $video.current = node;
            if (!ref) {
                return;
            }
            if (typeof ref === 'function') {
                ref(node);
            }
            else {
                ref.current = node;
            }
        }, autoPlay: viewer.settings.videoMessageAutoplay, disablePictureInPicture: true, loop: true, muted: true, playsInline: true, poster: poster, src: src, className: className, onLoadStart: () => setIsLoading(true), onWaiting: () => setIsLoading(true), onStalled: () => setIsLoading(true), onLoadedData: () => setIsLoading(false), onCanPlayThrough: () => setIsLoading(false), onPlaying: () => setIsLoading(false), onError: () => {
            setIsLoading(false);
            onError();
        } }));
});
//# sourceMappingURL=AttachVideoMessageVideo.js.map