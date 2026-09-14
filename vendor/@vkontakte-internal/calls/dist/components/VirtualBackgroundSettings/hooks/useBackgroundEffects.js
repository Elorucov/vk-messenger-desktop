import { useEffect, useMemo, useCallback } from 'react';
import { EffectBackground, EffectBlur, EffectOverlay, VideoEffects } from '@vkontakte/calls-video-effects';
import { EVideoEffectType } from '../../../constants';
/**
 * применяет настройки стрима в sdk
 */
export const useBackgroundEffects = ({ SDK }) => {
    const effects = useMemo(() => {
        return {
            background: new EffectBackground(),
            blur: new EffectBlur(),
            overlay: new EffectOverlay(),
            effect: new VideoEffects({ debug: true }),
        };
    }, []);
    /** on-mount */
    useEffect(() => {
        SDK.setVideoEffects(effects.effect);
        return () => {
            effects.background.destroy();
            effects.blur.destroy();
            effects.overlay.destroy();
            effects.effect.destroy();
        };
    }, []);
    const onSettingsChange = useCallback((settings) => {
        switch (settings.type) {
            case EVideoEffectType.BACKGROUND:
                effects.background.setBackgroundImage(settings.value).then(() => {
                    SDK.changeVideoEffect(effects.background);
                });
                break;
            case EVideoEffectType.OVERLAY:
                effects.overlay.setOverlayImage(settings.value).then(() => {
                    SDK.changeVideoEffect(effects.overlay);
                });
                break;
            case EVideoEffectType.BLUR:
                SDK.changeVideoEffect(effects.blur);
                break;
            case EVideoEffectType.NONE:
                SDK.changeVideoEffect(null);
                break;
            case EVideoEffectType.ADD:
                // do nothing
                break;
        }
    }, []);
    return {
        onSettingsChange,
    };
};
//# sourceMappingURL=useBackgroundEffects.js.map