import { ModalType, modalHasType, externalIdToString, getDefaultExternalId, } from '@vkontakte-internal/calls-core';
import { getAllPeerDeviceIds } from '../helpers/participant';
import { deepClone } from '../helpers/helpers';
import { getModal } from '../selectors';
function getMyNewPeerDeviceId(state, peerId) {
    return externalIdToString(state.externalId ? { ...state.externalId, id: peerId } : getDefaultExternalId(peerId));
}
function getParticipantNewPeerDeviceId(state, oldPeerDeviceId, peerId) {
    const device = state.devices[oldPeerDeviceId];
    if (!device) {
        return undefined;
    }
    return externalIdToString({ ...device.externalId, id: peerId });
}
function replaceParticipant(prevParticipants, prevPeerId, peerId) {
    const prevParticipant = prevParticipants[prevPeerId];
    const participants = {
        ...prevParticipants,
        [peerId]: {
            ...prevParticipant,
            peerId,
        },
    };
    delete participants[prevPeerId];
    return participants;
}
function replacePeerIdInCallData(callData, prevPeerId, peerId) {
    if (callData.conversation?.peerId === prevPeerId) {
        callData = deepClone(callData);
        callData.conversation.peerId = peerId;
    }
    return callData;
}
function replacePeerIdInDevices(state, prevPeerId, peerId) {
    const nextDevices = { ...state.devices };
    const peerDeviceIds = getAllPeerDeviceIds(state, prevPeerId);
    peerDeviceIds.forEach((id) => {
        if (id in nextDevices) {
            const nextExternalId = { ...nextDevices[id].externalId, id: peerId };
            nextDevices[externalIdToString(nextExternalId)] = {
                ...nextDevices[id],
                externalId: nextExternalId,
            };
            delete nextDevices[id];
        }
    });
    return nextDevices;
}
function replacePeerIdInMaps(state, prevPeerId, peerId) {
    const { maps } = state;
    const deviceSet = maps.peerIdToDevices.get(prevPeerId);
    // maps has mutable collections inside
    if (deviceSet) {
        const nextIds = [...deviceSet].reduce((acc, id) => {
            const device = state.devices[id];
            if (device) {
                acc.add(externalIdToString({
                    ...device.externalId,
                    id: peerId,
                }));
            }
            return acc;
        }, new Set());
        maps.peerIdToDevices.delete(prevPeerId);
        maps.peerIdToDevices.set(peerId, nextIds);
    }
    return maps;
}
export function getUpdatedSpeakerPeerId(state, speakers, prevPeerId, peerId) {
    const isMe = state.me === prevPeerId;
    const peerDeviceIds = getAllPeerDeviceIds(state, prevPeerId);
    const result = Array.from(peerDeviceIds)
        .map((oldPeerDeviceId) => {
        const newPeer = isMe
            ? getMyNewPeerDeviceId(state, peerId)
            : getParticipantNewPeerDeviceId(state, oldPeerDeviceId, peerId);
        if (newPeer && oldPeerDeviceId in speakers) {
            return [oldPeerDeviceId, newPeer];
        }
    })
        .filter(Boolean)[0];
    return result;
}
function replaceMediaSharer(state, prevPeerId, peerId) {
    const mediaSharers = { ...state.mediaSharers };
    const peerDeviceIds = getAllPeerDeviceIds(state, prevPeerId);
    peerDeviceIds.forEach((id) => {
        if (id in mediaSharers && id in state.devices) {
            const nextExternalId = { ...state.devices[id].externalId, id: peerId };
            mediaSharers[externalIdToString(nextExternalId)] = mediaSharers[id];
            delete mediaSharers[id];
        }
    });
    return mediaSharers;
}
function replacePeerIdInNotification(state, prevPeerId, peerId) {
    if (state.notification?.data === prevPeerId) {
        return { ...state.notification, data: peerId };
    }
    return state.notification;
}
function replacePeerIdInModalDetails(state, prevPeerId, peerId) {
    const modal = getModal(state);
    if (modalHasType(modal, ModalType.KICK_PARTICIPANT)) {
        if (modal.details.peerId === prevPeerId) {
            return { ...modal, details: { ...modal.details, peerId } };
        }
    }
    return modal;
}
/**
 * Replaces peer id in all state props for current user
 */
export function replaceMyPeerId(state, peerId) {
    const nextState = {
        ...state,
        me: peerId,
        participants: replaceParticipant(state.participants, state.me, peerId),
    };
    if (nextState.externalId) {
        // ensure immutable
        nextState.externalId = {
            ...nextState.externalId,
            id: peerId,
        };
    }
    return nextState;
}
/**
 * Replaces peer id in all state props for participant
 */
export function replaceParticipantPeerId(state, prevPeerId, peerId) {
    if (!state.participants[prevPeerId]) {
        return state;
    }
    const changedIds = state.changedParticipantIds ?? new Map();
    changedIds.set(prevPeerId, peerId);
    const nextState = {
        ...state,
        callData: replacePeerIdInCallData(state.callData, prevPeerId, peerId),
        changedParticipantIds: changedIds,
        devices: replacePeerIdInDevices(state, prevPeerId, peerId),
        mediaSharers: replaceMediaSharer(state, prevPeerId, peerId),
        notification: replacePeerIdInNotification(state, prevPeerId, peerId),
        modal: replacePeerIdInModalDetails(state, prevPeerId, peerId),
        participants: replaceParticipant(state.participants, prevPeerId, peerId),
    };
    // should go last because of mutation inside
    nextState.maps = replacePeerIdInMaps(state, prevPeerId, peerId);
    return nextState;
}
//# sourceMappingURL=changeParticipantIdHandlers.js.map