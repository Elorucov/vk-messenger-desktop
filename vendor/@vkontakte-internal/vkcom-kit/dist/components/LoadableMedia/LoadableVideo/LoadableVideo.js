import { jsx as _jsx } from "react/jsx-runtime";
import { useUpdateEffect } from '@vkontakte-internal/react-utils';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-css-module, css-modules/no-unused-class
import commonStyles from '../LoadableMedia.module.css';
import { LoadableMediaContent } from '../LoadableMediaContent/LoadableMediaContent';
import styles from './LoadableVideo.module.css';
/** Компонент для проигрывания онбординг видео (без звука) */
export const LoadableVideo = memo(function Video({ src, label, visible = true, ...restProps }) {
    const ref = useRef(null);
    const [loadingState, setLoadingState] = useState('loading');
    useEffect(() => {
        if (!ref.current) {
            return;
        }
        ref.current.defaultMuted = true;
        ref.current.muted = true;
    }, []);
    useEffect(() => {
        if (visible && loadingState === 'loaded') {
            setTimeout(async () => {
                try {
                    await playVideo(ref.current);
                }
                catch {
                    // мы эту ошибку никак не используем, но если ее не обработать
                    // можно получить рандомные падения тестов
                }
            }, 0);
        }
    }, [visible, src, loadingState]);
    useUpdateEffect(() => {
        if (visible) {
            rewindVideo(ref.current);
        }
    }, [visible]);
    const onReload = useCallback(() => reloadVideo(ref.current), []);
    return (_jsx(LoadableMediaContent, { "data-testid": "loadablevideo", ...restProps, reloadKey: src, className: commonStyles.media, onReload: onReload, onLoadingStateChange: setLoadingState, children: (onLoadedData, onError) => (_jsx("video", { className: styles.video, src: src, "aria-label": label, "aria-hidden": !label, width: "100%", preload: "metadata", controls: false, playsInline: true, muted: true, loop: true, ref: ref, onLoadedData: onLoadedData, onError: onError })) }));
});
async function playVideo(video) {
    if (!video) {
        throw new Error("Unable to play video, because it's not defined!");
    }
    return video.play();
}
async function reloadVideo(video) {
    if (!video) {
        throw new Error("Unable to reload video, because it's not defined!");
    }
    video.load();
    try {
        await playVideo(video);
    }
    catch (error) {
        throw new Error(`Unable to play reloaded video!`);
    }
}
function rewindVideo(video) {
    if (!video) {
        return;
    }
    video.pause();
    video.currentTime = 0;
}
//# sourceMappingURL=LoadableVideo.js.map