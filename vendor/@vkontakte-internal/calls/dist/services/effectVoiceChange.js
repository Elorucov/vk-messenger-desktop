import { EVideoOptionType, NoiseCancellationTypes } from '@vkontakte-internal/calls-core';
import { EffectVoiceChange, EffectVoiceChangeMode } from '@vkontakte/calls-audio-effects';
import { changeAudioEffect, setAudioEffects, setMediaModifiers, debugMessage, DebugMessageType, } from '@vkontakte/calls-sdk';
import { setEffectVoiceChanger, setNoiseCancellation } from '../actions/audio';
import { videoOptionsStorage } from '../helpers/localStorage';
export async function updateClientDenoiser(enableClientNoiseReductionMode, noiseCancellation, noiseCancellationModesByType, effectVoiceChange, dispatch) {
    if (!enableClientNoiseReductionMode) {
        // Сбрасываем тип денойзера на серверный, если был клиентский и выключили ручку
        if (noiseCancellation === NoiseCancellationTypes.CLIENT) {
            const defaultNoiceCancellation = NoiseCancellationTypes.NEURAL;
            const defaultMediaModifiers = noiseCancellationModesByType[defaultNoiceCancellation];
            await setMediaModifiers(noiseCancellationModesByType[defaultNoiceCancellation]);
            debugMessage(DebugMessageType.LOG, { message: 'changing mediaModifiers', to: defaultMediaModifiers });
            videoOptionsStorage.saveOption(EVideoOptionType.NOISE_CANCELLATION_MODE, defaultNoiceCancellation);
            dispatch(setNoiseCancellation(defaultNoiceCancellation));
        }
        return;
    }
    else if (noiseCancellation === NoiseCancellationTypes.NEURAL) {
        // если ручка включена и до этого был тип серверный, то включаем клиентский
        const defaultNoiceCancellation = NoiseCancellationTypes.CLIENT;
        const defaultMediaModifiers = noiseCancellationModesByType[defaultNoiceCancellation];
        await setMediaModifiers(noiseCancellationModesByType[defaultNoiceCancellation]);
        debugMessage(DebugMessageType.LOG, { message: 'changing mediaModifiers', to: defaultMediaModifiers });
        videoOptionsStorage.saveOption(EVideoOptionType.NOISE_CANCELLATION_MODE, defaultNoiceCancellation);
        dispatch(setNoiseCancellation(defaultNoiceCancellation));
        noiseCancellation = NoiseCancellationTypes.CLIENT;
    }
    if (noiseCancellation === NoiseCancellationTypes.CLIENT) {
        let voiceChanger = effectVoiceChange;
        if (!voiceChanger) {
            voiceChanger = new EffectVoiceChange(EffectVoiceChangeMode.OUTPUT_STREAM, {
                badPerformanceThreshold: 10,
                onBadPerformanceCb: (val) => {
                    dispatch(setNoiseCancellation(NoiseCancellationTypes.NEURAL));
                    changeAudioEffect([], true);
                    setMediaModifiers(noiseCancellationModesByType[NoiseCancellationTypes.NEURAL]);
                    debugMessage(DebugMessageType.WARN, '[🎛 A️udioEffects] bad performance detected', val.toFixed(2));
                },
                logPerformanceChecks: true, // полезно для дебага
            });
            setAudioEffects(voiceChanger);
            dispatch(setEffectVoiceChanger(voiceChanger));
        }
        await changeAudioEffect(['denoise'], true);
    }
    else {
        if (effectVoiceChange) {
            await changeAudioEffect([], true);
        }
    }
}
//# sourceMappingURL=effectVoiceChange.js.map