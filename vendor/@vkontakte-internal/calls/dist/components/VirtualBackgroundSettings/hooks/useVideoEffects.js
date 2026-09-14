import { useEffect, useCallback, useRef } from 'react';
import { EffectBackground, EffectBlur, EffectOverlay, VideoEffects, } from '@vkontakte/calls-video-effects';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { EVideoEffectType } from '../../../constants';
import { handlePromiseError } from '../../../helpers/logger';
/** хук контроллер локального превью видео эффектов */
export const useVideoEffects = ({ backgroundList, $video, userStream, previewMode, }) => {
    /** примененный эффект */
    const appliedEffect = useRef({
        id: EVideoEffectType.NONE,
        type: EVideoEffectType.NONE,
    });
    /** выбранный в ui эффект */
    const selectedEffect = useRef({
        id: EVideoEffectType.NONE,
        type: EVideoEffectType.NONE,
    });
    /** предустановленный эффект */
    const initialEffect = useRef({
        type: EVideoEffectType.NONE,
    });
    /** примененный предустановленный эффект */
    const appliedInitialEffect = useRef({
        type: EVideoEffectType.NONE,
    });
    const videoEffects = useRef(null);
    const effectBackground = useRef(null);
    const effectBlur = useRef(null);
    const effectOverlay = useRef(null);
    /** трек видео камеры пользователя */
    const userTrack = useRef(null);
    /** изменяет настройки текущего локального эффекта */
    const onUpdateVideoEffectsSettings = useCallback(async (nextSelectedEffect) => {
        selectedEffect.current = nextSelectedEffect;
        if (!userStream || !userTrack.current || !videoEffects.current) {
            return;
        }
        let effect = null;
        switch (nextSelectedEffect.type) {
            case EVideoEffectType.BLUR: {
                effect = effectBlur.current;
                break;
            }
            case EVideoEffectType.OVERLAY: {
                const photo = backgroundList.find(({ id }) => id === nextSelectedEffect.id);
                if (photo) {
                    effect = effectOverlay.current;
                    try {
                        await effect?.setOverlayImage(photo.originalUrl);
                    }
                    catch (e) {
                        handlePromiseError(e);
                        return;
                    }
                }
                break;
            }
            case EVideoEffectType.BACKGROUND: {
                const photo = backgroundList.find(({ id }) => id === nextSelectedEffect.id);
                if (photo) {
                    effect = effectBackground.current;
                    try {
                        await effect?.setBackgroundImage(photo.originalUrl);
                    }
                    catch (e) {
                        handlePromiseError(e);
                        return;
                    }
                }
                break;
            }
            case EVideoEffectType.ADD: {
                return;
            }
            case EVideoEffectType.NONE:
            default: {
                // do nothing
            }
        }
        if (selectedEffect.current !== nextSelectedEffect && !previewMode) {
            debugMessage(DebugMessageType.WARN, {
                message: 'Virtual background settings changed during load',
                currentEffect: selectedEffect.current,
                tryingEffect: nextSelectedEffect,
            });
            return;
        }
        if (!userTrack.current || userTrack.current.readyState === 'ended') {
            debugMessage(DebugMessageType.WARN, {
                message: "User's MediaStreamTrack is null or ended",
                userTrack: userTrack.current,
            });
            return;
        }
        // Тип эффекта не изменился, пропускаем videoEffects.current.setEffect
        if (nextSelectedEffect.type === appliedEffect.current.type && !previewMode) {
            appliedEffect.current = nextSelectedEffect;
            return;
        }
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
        videoEffects.current
            ?.setEffect(effect, userTrack.current)
            .then((newTrack) => {
            if (!$video.current) {
                throw new Error('Virtual background preview video element is not available');
            }
            if (selectedEffect.current !== nextSelectedEffect && !previewMode) {
                throw new Error('Virtual background settings changed during load');
            }
            $video.current.srcObject = effect ? new MediaStream([newTrack]) : userStream;
            appliedEffect.current = nextSelectedEffect;
            if (previewMode) {
                $video.current.muted = true;
                const playPromise = $video.current.play();
                playPromise &&
                    playPromise.catch((error) => {
                        debugMessage(DebugMessageType.ERROR, { error, newStream: $video.current?.srcObject });
                    });
            }
        })
            .catch((e) => {
            debugMessage(DebugMessageType.WARN, e);
        });
    }, [backgroundList, userStream, previewMode]);
    /** изменяет настройки текущего локального эффекта */
    const onUpdateVirtualBackground = useCallback(async (nextSelectedEffect) => {
        initialEffect.current = nextSelectedEffect;
        if (!userStream || !userTrack.current || !videoEffects.current) {
            return;
        }
        let effect = null;
        switch (nextSelectedEffect.type) {
            case EVideoEffectType.BLUR: {
                effect = effectBlur.current;
                break;
            }
            case EVideoEffectType.OVERLAY: {
                // not defined
                break;
            }
            case EVideoEffectType.BACKGROUND: {
                if (previewMode) {
                    effect = effectBackground.current;
                    try {
                        await effect?.setBackgroundImage(nextSelectedEffect.value);
                    }
                    catch (e) {
                        handlePromiseError(e);
                        return;
                    }
                }
                break;
            }
            case EVideoEffectType.ADD: {
                return;
            }
            case EVideoEffectType.NONE:
            default: {
                if (previewMode && $video.current) {
                    $video.current.srcObject = userStream;
                    $video.current.muted = true;
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
                    $video.current.play().catch((error) => {
                        debugMessage(DebugMessageType.ERROR, { error, userStream });
                    });
                }
            }
        }
        if (!userTrack.current || userTrack.current.readyState === 'ended') {
            debugMessage(DebugMessageType.WARN, {
                message: "User's MediaStreamTrack is null or ended",
                userTrack: userTrack.current,
            });
            return;
        }
        // Тип эффекта не изменился, пропускаем videoEffects.current.setEffect
        if (nextSelectedEffect.type === appliedEffect.current.type && !previewMode) {
            appliedInitialEffect.current = nextSelectedEffect;
            return;
        }
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
        videoEffects.current
            ?.setEffect(effect, userTrack.current)
            .then((newTrack) => {
            if (!$video.current) {
                throw new Error('Virtual background preview video element is not available');
            }
            if (selectedEffect.current !== nextSelectedEffect && !previewMode) {
                throw new Error('Virtual background settings changed during load');
            }
            $video.current.srcObject = effect ? new MediaStream([newTrack]) : userStream;
            appliedInitialEffect.current = nextSelectedEffect;
            if (previewMode) {
                $video.current.muted = true;
                const playPromise = $video.current.play();
                playPromise &&
                    playPromise.catch((error) => {
                        debugMessage(DebugMessageType.ERROR, { error, newStream: $video.current?.srcObject });
                    });
            }
        })
            .catch((e) => {
            debugMessage(DebugMessageType.WARN, e);
        });
    }, [backgroundList, userStream, previewMode]);
    /** on-userStream-update */
    useEffect(() => {
        if (!userStream) {
            return;
        }
        cleanup();
        videoEffects.current = new VideoEffects();
        effectBackground.current = new EffectBackground();
        effectBlur.current = new EffectBlur();
        effectOverlay.current = new EffectOverlay();
        userTrack.current = userStream.getVideoTracks()[0];
        if (selectedEffect.current.type !== EVideoEffectType.NONE) {
            onUpdateVideoEffectsSettings(selectedEffect.current);
        }
    }, [userStream]);
    useEffect(() => {
        return cleanup;
    }, []);
    function cleanup() {
        videoEffects.current?.destroy();
        effectBackground.current?.destroy();
        effectBlur.current?.destroy();
        effectOverlay.current?.destroy();
        userTrack.current?.stop();
    }
    return {
        onUpdateVideoEffectsSettings,
        onUpdateVirtualBackground,
    };
};
//# sourceMappingURL=useVideoEffects.js.map