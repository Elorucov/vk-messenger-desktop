import { promoteParticipant } from '@vkontakte/calls-sdk';
import { E_ACTION } from '../constants';
import { optionalDataActionCreator } from '../helpers/actionCreator';
import { inParallel } from '../helpers/async';
import { getExternalIdByUserId } from '../helpers/user';
export const setWaitingHall = optionalDataActionCreator(E_ACTION.SET_WAITING_HALL);
function baseRemoveUserFromWaitingHall(peerId, data) {
    data.totalCount -= 1;
    data.members.delete(peerId);
    return setWaitingHall(data);
}
function basePromoteUserAndRemoveFromWaitingHall(peerId, data, dispatch) {
    const externalId = getExternalIdByUserId(peerId);
    return promoteParticipant(externalId).then(() => {
        dispatch?.(baseRemoveUserFromWaitingHall(peerId, data));
    });
}
export function promoteUserAndRemoveFromWaitingHall(peerId, data, dispatch) {
    return basePromoteUserAndRemoveFromWaitingHall(peerId, data, dispatch);
}
export async function promoteUsersAndRemoveFromWaitingHall(peerIds, data, dispatch, limit = 5) {
    const newData = {
        ...data,
        members: new Map(data.members),
    };
    await inParallel(peerIds.map((peerId) => () => basePromoteUserAndRemoveFromWaitingHall(peerId, newData)), limit);
    dispatch(setWaitingHall(newData));
}
export function removeUserFromWaitingHall(peerId, data) {
    return baseRemoveUserFromWaitingHall(peerId, data);
}
export function resetWaitingHallNew(data) {
    data.hasNew = false;
    return setWaitingHall(data);
}
//# sourceMappingURL=waitingHall.js.map