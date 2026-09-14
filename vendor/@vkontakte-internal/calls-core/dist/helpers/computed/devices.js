import { externalIdToString, getCountNotLoadedDevicesBeforeForList, getFirstMatchedId, isSameExternalId, } from '../simple';
import { PARTICIPANTS_LIST_BUFFER_SIZE } from '../../constants';
export function getOrator({ adminPinnedParticipant, watchTogetherPinnedParticipant, mediaSharingPinnedParticipant, pinnedParticipant, orator, participants, devices, me, localDevice, myExternalId, }) {
    const externalId = getFirstMatchedId(adminPinnedParticipant, watchTogetherPinnedParticipant, mediaSharingPinnedParticipant, pinnedParticipant, orator);
    if (externalId && !isSameExternalId(myExternalId, externalId)) {
        const device = devices[externalIdToString(externalId)];
        const participant = participants[externalId.id];
        if (device && participant) {
            return { device, participant, externalId };
        }
    }
    return {
        device: localDevice,
        participant: participants[me],
        externalId: myExternalId,
    };
}
export function getRenderedParticipantListBoundaryIndexes({ participantsChunk, isOratorMode, firstVisible, visibleCount, }) {
    if (participantsChunk) {
        const start = getCountNotLoadedDevicesBeforeForList(participantsChunk);
        const end = start + participantsChunk.ids.length;
        return { start, end };
    }
    const bufferSize = isOratorMode ? PARTICIPANTS_LIST_BUFFER_SIZE.ORATOR : PARTICIPANTS_LIST_BUFFER_SIZE.GRID;
    const start = firstVisible < bufferSize ? 0 : firstVisible - bufferSize;
    const end = firstVisible + visibleCount + bufferSize;
    return { start, end };
}
//# sourceMappingURL=devices.js.map