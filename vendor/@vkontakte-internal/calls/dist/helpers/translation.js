import { isAdmin, isCreator, peerIdToVkId, vkIdToPeerId } from '@vkontakte-internal/calls-core';
import { getMeId, isParticipantGroup } from './participant';
/**
 * Валидация, что мы можем остановить трансляцию
 * @param state
 */
export function canStopTranslation(state) {
    if (isAdmin(state.localDevice) || isCreator(state.localDevice)) {
        return true;
    }
    const meId = getMeId(state);
    if (!state.translation.host?.id) {
        return false;
    }
    const hostId = Number(state.translation.host.id);
    if (typeof meId === 'string') {
        return hostId === peerIdToVkId(meId);
    }
    return hostId === meId;
}
export function isMeRecordCreator(state) {
    if (isParticipantGroup(state.groupId)) {
        return state.groupId === state.translation.ownerId;
    }
    return !!state.translation.ownerId && state.me === vkIdToPeerId(state.translation.ownerId);
}
//# sourceMappingURL=translation.js.map