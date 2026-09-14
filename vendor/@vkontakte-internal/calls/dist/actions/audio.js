import { E_ACTION } from '../constants';
export const setNoiseCancellation = (type) => ({
    type: E_ACTION.SET_NOISE_CANCELLATION,
    data: type,
});
export const setEffectVoiceChanger = (voiceChanger) => ({
    type: E_ACTION.SET_EFFECT_VOICE_CHANGE,
    data: voiceChanger,
});
//# sourceMappingURL=audio.js.map