import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { memo, useEffect, useRef } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { createVideoTag } from '../../helpers/video';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
const streamMap = new WeakMap();
export const Video = memo(function Video({ stream, participantId, isMirrored = false, isContained = false, isStartWithVisible = false, isLocalSchreenShare = false, className, setIsVideoElementVisible, mediaType, }) {
    const videoContainerElement = useRef(null);
    const videoElement = useRef(null);
    const curStream = useRef(stream);
    useEffect(() => {
        if (videoContainerElement.current?.lastElementChild && curStream.current === stream) {
            return;
        }
        const testId = `calls_video_type_${(mediaType || '').toLowerCase()}`;
        let isVisible = isStartWithVisible;
        if (stream) {
            if (streamMap.has(stream)) {
                if (streamMap.get(stream)?.closest('body') === null) {
                    videoElement.current = streamMap.get(stream) ?? null;
                    isVisible = true;
                }
                else {
                    // если в  уже есть video с этим стримом, то создаем новый video тег.
                    videoElement.current = createVideoTag(stream);
                    videoElement.current.dataset.participantId = participantId;
                    videoElement.current.dataset.testid = testId;
                }
            }
            else {
                videoElement.current = createVideoTag(stream);
                videoElement.current.dataset.participantId = participantId;
                videoElement.current.dataset.testid = testId;
                streamMap.set(stream, videoElement.current);
            }
        }
        /** В случае если stream перешел другому participantId, то нужно переинициализировать этот стрим в
         * в video теге, чтобы не остался последний кард от предыдущего пользователя.
         */
        if (videoElement.current && videoElement.current.dataset.participantId !== participantId) {
            const video = videoElement.current;
            video.dataset.participantId = participantId;
            video.dataset.testid = testId;
            video.srcObject = null;
            video.srcObject = stream;
            const onVisible = () => {
                video.classList.add('Video--visible');
                video.removeEventListener('loadeddata', onVisible);
            };
            video.addEventListener('loadeddata', onVisible);
            isVisible = false;
            video.classList.remove('Video--visible');
        }
        if (videoElement.current &&
            videoContainerElement.current &&
            videoContainerElement.current.lastElementChild !== videoElement.current) {
            const isVideoVisible = isVisible || videoElement.current?.classList.contains('Video--visible');
            const classes = cx('Video', {
                'Video--contain': isContained,
                'Video--mirrored': isMirrored,
                'Video--visible': isVideoVisible,
            });
            setIsVideoElementVisible?.(isVideoVisible);
            if (videoContainerElement.current.lastElementChild) {
                videoContainerElement.current.innerHTML = '';
            }
            videoElement.current.className = classes;
            videoContainerElement.current.appendChild(videoElement.current);
            videoElement.current.play().catch((error) => {
                debugMessage(DebugMessageType.ERROR, { error, stream });
            });
        }
        const removeWorkaround = workaroundChromeMuteBug();
        return () => {
            removeWorkaround();
            if (videoElement.current && videoElement.current !== streamMap.get(stream)) {
                videoElement.current.srcObject = null;
                videoElement.current.src = '';
                videoElement.current.pause();
                videoElement.current.removeAttribute('src');
                videoElement.current.load();
            }
            if (videoContainerElement.current) {
                videoContainerElement.current.innerHTML = '';
                setIsVideoElementVisible?.(false);
            }
        };
        function workaroundChromeMuteBug() {
            if (!isLocalSchreenShare) {
                return () => null;
            }
            const videoTrack = stream.getVideoTracks()[0];
            const onMute = () => {
                if (videoElement.current) {
                    // Reset stream to unmute track which was muted by Chrome
                    // https://bugs.chromium.org/p/chromium/issues/detail?id=1371573
                    videoElement.current.srcObject = videoElement.current.srcObject;
                }
            };
            videoTrack?.addEventListener('mute', onMute);
            return () => videoTrack?.removeEventListener('mute', onMute);
        }
    }, [stream, videoContainerElement.current, participantId, setIsVideoElementVisible, mediaType]);
    /** эффект для класса mirrored */
    useEffect(() => {
        if (videoElement.current) {
            videoElement.current.classList.toggle('Video--mirrored', isMirrored);
        }
    }, [isMirrored]);
    return _jsx("div", { ref: videoContainerElement, className: className });
});
//# sourceMappingURL=Video.js.map