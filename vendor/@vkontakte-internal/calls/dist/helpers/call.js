import { CALLS_DESKTOP_APP_NOTIFICATION } from '../constants';
import { NoiseCancellationTypes, } from '@vkontakte-internal/calls-core';
import { ConversationOption } from '@vkontakte/calls-sdk';
import { localStorage } from '@vkontakte/vkjs';
export function isRequireAuthToJoin(state) {
    return state.conversationOptions.includes(ConversationOption.REQUIRE_AUTH_TO_JOIN);
}
export function isWaitingHallEnabled(state) {
    return state.conversationOptions.includes(ConversationOption.WAITING_HALL);
}
export function getDefaultConversation(getLang) {
    return {
        peerId: '',
        canAddMembers: true,
        tab: getLang('calls_new_call_title'),
    };
}
export function isAuthedByGroupId(groupId) {
    return !!groupId;
}
export function getCallsCount() {
    return Number(localStorage.getItem(CALLS_DESKTOP_APP_NOTIFICATION) ?? 0);
}
export function increaseCallsCount() {
    const number = Number(localStorage.getItem(CALLS_DESKTOP_APP_NOTIFICATION) ?? 0) + 1;
    localStorage.setItem(CALLS_DESKTOP_APP_NOTIFICATION, String(number));
}
export const getMediaModifiers = ({ noiseReductionMode, enableNoiseReductionMode, }) => {
    /**
     * 1 - server_strong
     * 2 - server_weak
     * 3 - client_weak
     */
    const noiseCancellationModes = {
        1: { denoise: true, denoiseAnn: true },
        2: { denoise: true, denoiseAnn: false },
        3: { denoise: false, denoiseAnn: false },
    };
    const noiseCancellationAutoMode = enableNoiseReductionMode && Boolean(noiseCancellationModes[noiseReductionMode])
        ? noiseCancellationModes[noiseReductionMode]
        : noiseCancellationModes['1'];
    const noiseCancellationModesByType = {
        [NoiseCancellationTypes.NEURAL]: noiseCancellationAutoMode,
        [NoiseCancellationTypes.SIMPLE]: noiseCancellationModes[2],
        [NoiseCancellationTypes.NONE]: noiseCancellationModes[3],
        [NoiseCancellationTypes.CLIENT]: noiseCancellationModes[3],
    };
    return {
        noiseCancellationModesByType,
    };
};
//# sourceMappingURL=call.js.map