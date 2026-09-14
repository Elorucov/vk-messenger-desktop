import { externalIdToString, getFirstMatchedId, isSameExternalId } from '../simple';
import { getDefaultExternalId, isParticipantWithVideo, isGroupCallByPeerAndMe, getOrator, } from '../computed';
export function getCallVisibleParticipant({ adminPinnedParticipant, watchTogetherPinnedParticipant, mediaSharingPinnedParticipant, pinnedParticipant, orator, peer, me, devices: _devices, roomId, participantIdsByMyRoomId, localDevice, myExternalId, isVideoCall, }) {
    const selected = isGroupCallByPeerAndMe(peer, me)
        ? getFirstMatchedId(adminPinnedParticipant, watchTogetherPinnedParticipant, mediaSharingPinnedParticipant, pinnedParticipant, orator)
        : peer;
    let id = null;
    if (selected !== null) {
        if (typeof selected === 'object') {
            id = externalIdToString(selected);
        }
        else {
            id = selected.toString();
        }
    }
    if (id && _devices[id]) {
        return _devices[id];
    }
    let suitableParticipant = null;
    const roomDevices = participantIdsByMyRoomId?.reduce((acc, participant) => {
        const device = _devices[participant.idString];
        if (device) {
            acc[participant.idString] = device;
        }
        return acc;
    }, {}) ?? {};
    const devices = roomId ? roomDevices : _devices;
    for (const key in devices) {
        if (!devices.hasOwnProperty(key)) {
            continue;
        }
        const device = devices[key];
        if (isSameExternalId(device.externalId, myExternalId) || !device.wasConnected) {
            continue;
        }
        if (!suitableParticipant) {
            suitableParticipant = device;
        }
        if (!isVideoCall || isParticipantWithVideo(device)) {
            return device;
        }
    }
    if (!suitableParticipant) {
        suitableParticipant = {
            ...localDevice,
            externalId: myExternalId || getDefaultExternalId(),
        };
    }
    return suitableParticipant;
}
export const getSelectedDevice = ({ myExternalId, ...params }) => {
    const { device } = getOrator({ myExternalId, ...params });
    if ('externalId' in device) {
        return device;
    }
    else {
        return {
            ...device,
            externalId: myExternalId || getDefaultExternalId(),
        };
    }
};
//# sourceMappingURL=devices.js.map