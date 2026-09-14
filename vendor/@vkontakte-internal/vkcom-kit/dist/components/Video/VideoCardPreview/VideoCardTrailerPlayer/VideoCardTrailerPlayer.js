import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useEffect, useRef } from 'react';
import { playErrorHandler } from './utils';
import styles from './VideoCardTrailerPlayer.module.css';
export const VideoCardTrailerPlayer = ({ active, src, alt, onLoadedData, }) => {
    const videoRef = useRef(null);
    useEffect(() => {
        if (!videoRef.current) {
            return;
        }
        if (active) {
            (async () => {
                try {
                    await videoRef.current?.play();
                }
                catch (err) {
                    playErrorHandler(err);
                }
            })();
        }
        else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [active]);
    if (!src) {
        return null;
    }
    return (_jsx("video", { loop: true, muted: true, ref: videoRef, crossOrigin: "anonymous", "aria-label": alt, className: classNames(styles.trailer, active && styles.trailerActive), src: src, onLoadedData: onLoadedData }));
};
//# sourceMappingURL=VideoCardTrailerPlayer.js.map