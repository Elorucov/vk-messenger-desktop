import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"video":["global",{"className":1}]} */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PiPController } from './PiPController';
import { dropMediaSessionHandlers, setupMediaSessionHandlers, toggleMediaSessionIcons } from './mediaSession';
import { PiPCanvas } from './PiPCanvas';
import { downloadImage, drawAvatar, drawSelfPreview, drawVideo, drawVideoSuspendReason } from './renders';
import { createPortal } from 'react-dom';
import { useLang } from '../../../hooks/useLang';
import { VideoSuspendReason } from '@vkontakte-internal/calls-core';
import { MediaType } from '@vkontakte/calls-sdk';
import { getTypeSizeOfStream, pipLog } from '../utils';
import { classNames as cn } from '@vkontakte/vkjs';
import styles from '../styles.module.css';
import { useConfig } from '../../../services/config';
import { useSendStatsService } from '../../../stats/clickHouse';
export const PiPVideo = ({ isWithVideo, streamData, photo, enabledPiP, enablePiP, onToggleVideo, onToggleAudio, onHangup, onClosePiP, isLocalAudioEnabled, isLocalVideoEnabled, localOverlayStream, targetElement, shouldMirrorMainVideo, shouldMirrorOverlayVideo, videoSuspendReason, }) => {
    const { enableSimpleAutoPiP } = useConfig();
    const videoRef = useRef(null);
    const pipControllerRef = useRef(null);
    const [currentDisplayMode, setCurrentDisplayMode] = useState('general');
    const { getLang } = useLang();
    const sendStats = useSendStatsService();
    useLayoutEffect(() => {
        const pipController = new PiPController(new PiPCanvas());
        const video = videoRef.current;
        if (video) {
            pipController.updateVideoElement(video);
        }
        pipController.start();
        pipControllerRef.current = pipController;
        pipLog('Create PiPController. ', video && `Add a videoElement: ${video}`);
        return () => {
            // При размаунте компонента, ловить ошибки нет смысла.
            pipController.exit().catch(() => { });
            pipController.stop();
            dropMediaSessionHandlers();
        };
    }, []);
    /**
     * Отдельный эффект для пипа, потому что вызов пипа должен происходить синхронно после клика юзера
     */
    useLayoutEffect(() => {
        if (enabledPiP) {
            pipLog('enter to the pip');
            pipControllerRef.current?.enter().catch((err) => {
                pipLog('cannot enter to the pip, catch error', err.message);
                onClosePiP();
            });
        }
    }, [enabledPiP, onClosePiP]);
    useEffect(() => {
        const pipController = pipControllerRef.current;
        if (!pipController) {
            return;
        }
        pipController.onLeave = () => {
            pipLog('Leave the pip');
            onClosePiP();
        };
        if (!enabledPiP && document.hasFocus() && pipController.documentInPiP) {
            pipLog('Try to exit from the pip, because it disabled by state');
            pipController.exit().catch(() => { });
        }
    }, [enabledPiP, onClosePiP]);
    /**
     * Сеттим колбеки для кнопок внутри окна PiP. Работает только там где поддерживается.
     * Хром, Опера
     */
    useEffect(() => {
        // подключаем хендлеры при старте звонка,
        // media session focus решает за нас приоритет проставление хендлеров
        if (enableSimpleAutoPiP) {
            pipLog('setup mediasession handlers');
            setupMediaSessionHandlers({
                onAudio: onToggleAudio,
                onVideo: onToggleVideo,
                onHangup: () => {
                    pipControllerRef.current?.exit();
                    onHangup();
                },
                onRequestPictureInPicture: () => {
                    enablePiP();
                },
            });
            return () => {
                dropMediaSessionHandlers();
            };
        }
        // здесь мы autopip не подключаем и хендлеры вешаем только если открыли пип
        if (!enableSimpleAutoPiP && enabledPiP) {
            pipLog('setup mediasession handlers');
            setupMediaSessionHandlers({
                onAudio: onToggleAudio,
                onVideo: onToggleVideo,
                onHangup: () => {
                    pipControllerRef.current?.exit();
                    onHangup();
                },
                onRequestPictureInPicture: () => { },
            });
            return () => {
                dropMediaSessionHandlers();
            };
        }
    }, [enabledPiP, enablePiP, sendStats, onToggleAudio, onToggleVideo, onHangup, enableSimpleAutoPiP]);
    /**
     * Если поддерживается апи для кнопок, то нужно кнопки обновлять в соответствии со состоянием звонка
     */
    useEffect(() => {
        pipLog(`update icons in the pip, audio: ${isLocalAudioEnabled}, video: ${isLocalVideoEnabled}`);
        toggleMediaSessionIcons(isLocalAudioEnabled, isLocalVideoEnabled);
    }, [isLocalVideoEnabled, isLocalAudioEnabled]);
    useEffect(() => {
        const pipController = pipControllerRef.current;
        if (!pipController) {
            return;
        }
        const displayMode = getTypeSizeOfStream(streamData?.type ?? MediaType.CAMERA);
        if (pipController.getDisplayMode() !== displayMode) {
            pipLog('Setup videoType by stream', streamData?.type);
            pipController.updateDisplayMode(displayMode);
            setCurrentDisplayMode(displayMode);
        }
    }, [streamData]);
    /**
     * Если у текущего юзера нет видео, рендерим канвас с аватаром, в остальных случаях подставляем стрим
     */
    useEffect(() => {
        const pipController = pipControllerRef.current;
        if (!pipController) {
            return;
        }
        if (videoSuspendReason) {
            pipLog('video suspend, render suspend element');
            // By UI/UX decision we don't show message if video is suspended due to user settings
            const mediaSuspendText = videoSuspendReason === VideoSuspendReason.NETWORK ? getLang('calls_video_suspended_by_network') : '';
            pipController.onUpdate = drawVideoSuspendReason(mediaSuspendText);
            if (photo) {
                downloadImage(photo).then((img) => {
                    pipController.onUpdate = drawVideoSuspendReason(mediaSuspendText, drawAvatar(img));
                });
            }
        }
        else if (photo && !isWithVideo) {
            pipLog(`don't have a video, render photo only`);
            pipController.onUpdate = drawSelfPreview(drawAvatar(null), localOverlayStream?.data, shouldMirrorOverlayVideo);
            downloadImage(photo).then((img) => {
                pipController.onUpdate = drawSelfPreview(drawAvatar(img), localOverlayStream?.data, shouldMirrorOverlayVideo);
            });
        }
        else if (isWithVideo && streamData?.data) {
            pipLog('have a video, render video');
            pipController.onUpdate = drawSelfPreview(drawVideo(streamData.data, shouldMirrorMainVideo, currentDisplayMode === 'wide' ? 'contain' : 'cover'), localOverlayStream?.data, shouldMirrorOverlayVideo);
        }
    }, [
        enabledPiP,
        photo,
        isWithVideo,
        streamData?.data,
        localOverlayStream?.data,
        shouldMirrorMainVideo,
        shouldMirrorOverlayVideo,
        videoSuspendReason,
        currentDisplayMode,
    ]);
    /**
     * Если используем вставку в дом через портал, то ждем пока найдется контейнер для вставки,
     * находим контейнер и сохраняем его, а дальше после того портал вставился, мы обновили ссылку на видео элемент
     */
    const [target, setTarget] = useState(null);
    useEffect(() => {
        const el = document.getElementById(targetElement);
        setTarget(el);
        pipLog('setup video element to target', targetElement);
        return () => {
            setTarget(null);
        };
    }, [targetElement]);
    useEffect(() => {
        const video = videoRef.current;
        const pipController = pipControllerRef.current;
        if (video && pipController && !video.srcObject) {
            pipLog('target portal is updated, so update video element');
            pipController.updateVideoElement(video);
        }
    }, [target]);
    /**
     * Фикс для яндекса, чтоб не появлялся знак пип из-за невидимого видео
     */
    useEffect(() => {
        const video = videoRef.current;
        if (video && !target) {
            video.setAttribute('pip', 'false');
        }
        else if (video && target) {
            video.removeAttribute('pip');
        }
    }, [target]);
    return createPortal(_jsx("video", { ref: videoRef, className: cn(target ? styles.inlineVideo : styles.hiddenVideo, currentDisplayMode === 'wide' && styles.inlineWideVideo), autoPlay: true, muted: true, playsInline: true }), target ?? document.body);
};
//# sourceMappingURL=PiPVideo.js.map