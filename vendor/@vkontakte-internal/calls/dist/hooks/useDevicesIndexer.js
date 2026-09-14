import { externalIdToString, useIndexer, } from '@vkontakte-internal/calls-core';
const createNameGetter = ({ getParticipants, getChangedParticipantIds }) => (device) => {
    const participants = getParticipants();
    const changedParticipantIds = getChangedParticipantIds();
    let peerId = device.externalId.id;
    let participant = participants[peerId];
    if (!participant) {
        const realPeerId = changedParticipantIds?.get(peerId);
        participant = realPeerId ? participants[realPeerId] : undefined;
    }
    return participant?.name ?? '';
};
const idGetter = (device) => externalIdToString(device.externalId);
export const useDevicesIndexer = (devices, deps) => useIndexer(devices, createNameGetter(deps), idGetter);
//# sourceMappingURL=useDevicesIndexer.js.map