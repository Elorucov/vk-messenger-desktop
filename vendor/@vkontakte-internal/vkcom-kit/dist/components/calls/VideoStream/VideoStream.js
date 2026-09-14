import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useStableCallback } from '@vkontakte-internal/react-utils';
import { memo, useEffect, useRef } from 'react';
import { createVideoTag } from './utils/createVideoTag';
import styles from './VideoStream.module.css';
const streamCache = new WeakMap();
const VideoStreamComponent = ({ stream, videoId, mirrored, objectFit = 'cover', skipHideOnLoading, hasScreenShare, width, height, shape = 'rect', className, style, ...restProps }) => {
    const videoContainerElement = useRef(null);
    const videoElement = useRef(null);
    const currentStream = useRef(stream);
    const workaroundChromeMuteBugStable = useStableCallback(() => {
        if (!hasScreenShare) {
            return () => null;
        }
        const videoTrack = stream?.getVideoTracks()[0];
        const onMute = () => {
            if (videoElement.current) {
                // Reset stream to unmute track which was muted by Chrome
                // https://bugs.chromium.org/p/chromium/issues/detail?id=1371573
                videoElement.current.srcObject = videoElement.current.srcObject;
            }
        };
        videoTrack?.addEventListener('mute', onMute);
        return () => videoTrack?.removeEventListener('mute', onMute);
    });
    useEffect(() => {
        if (videoContainerElement.current?.lastElementChild && currentStream.current === stream) {
            return;
        }
        let isVisible = skipHideOnLoading;
        if (stream) {
            const cachedVideo = streamCache.get(stream);
            if (cachedVideo) {
                if (cachedVideo.closest('body') === null) {
                    videoElement.current = cachedVideo;
                    isVisible = true;
                }
                else {
                    videoElement.current = createVideoTag(stream, styles.visible);
                    videoElement.current.dataset.videoId = videoId;
                }
            }
            else {
                videoElement.current = createVideoTag(stream, styles.visible);
                videoElement.current.dataset.videoId = videoId;
                streamCache.set(stream, videoElement.current);
            }
        }
        /** В случае если stream перешел другому videoId, то нужно переинициализировать этот стрим в
         * в video теге, чтобы не остался последний кард от предыдущего пользователя.
         */
        if (videoElement.current && videoElement.current.dataset.videoId !== videoId) {
            videoElement.current.dataset.videoId = videoId;
            videoElement.current.srcObject = null;
            videoElement.current.srcObject = stream;
            const onVisible = () => {
                videoElement.current?.classList.add(styles.visible);
                videoElement.current?.removeEventListener('loadeddata', onVisible);
            };
            videoElement.current.addEventListener('loadeddata', onVisible);
            isVisible = false;
            videoElement.current.classList.remove(styles.visible);
        }
        if (videoElement.current &&
            videoContainerElement.current &&
            videoContainerElement.current.lastElementChild !== videoElement.current) {
            if (videoContainerElement.current.lastElementChild) {
                videoContainerElement.current.innerHTML = '';
            }
            videoElement.current.className = classNames(styles.video, (isVisible || videoElement.current.classList.contains(styles.visible)) && styles.visible);
            videoContainerElement.current.appendChild(videoElement.current);
            (async () => {
                try {
                    await videoElement.current?.play();
                }
                catch (err) {
                    console.error(err);
                }
            })();
        }
        const removeWorkaround = workaroundChromeMuteBugStable();
        const videoContainer = videoContainerElement.current;
        return () => {
            removeWorkaround();
            if (videoElement.current && stream && videoElement.current !== streamCache.get(stream)) {
                videoElement.current.srcObject = null;
                videoElement.current.src = '';
                videoElement.current.pause();
                videoElement.current.removeAttribute('src');
                videoElement.current.load();
            }
            if (videoContainer) {
                videoContainer.innerHTML = '';
            }
        };
    }, [skipHideOnLoading, stream, videoId, workaroundChromeMuteBugStable]);
    useEffect(() => {
        videoElement.current?.classList.toggle(styles.mirrored, mirrored);
        videoElement.current?.classList.toggle(styles.contain, objectFit === 'contain');
    }, [mirrored, objectFit]);
    return (_jsx("div", { ref: videoContainerElement, className: classNames(styles.root, shape === 'circle' && styles.circle, className), style: { ...style, width: width ?? style?.width, height: height ?? style?.height }, ...restProps }));
};
export const VideoStream = memo(VideoStreamComponent);
//# sourceMappingURL=VideoStream.js.map