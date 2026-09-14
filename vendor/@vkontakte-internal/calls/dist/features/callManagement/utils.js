import { isAdmin, isCreator, isSameExternalId, } from '@vkontakte-internal/calls-core';
import { getIsHandRaised } from '../../helpers/participant';
export const getSortingPriority = (listParticipant) => {
    let priorityOffset = 0;
    const getPriority = (p) => (priorityOffset ? priorityOffset + p / 10 : p);
    if (listParticipant.isCreator) {
        return 1;
    }
    if (listParticipant.isAdmin) {
        priorityOffset = 2;
    }
    if (listParticipant.isPinned) {
        return getPriority(3);
    }
    if (listParticipant.hasLiveTranslation) {
        return getPriority(4);
    }
    if (getIsHandRaised(listParticipant)) {
        return (getPriority(5) + (listParticipant.statusData?.hand?.ts ? listParticipant.statusData.hand.ts / 1e14 : 0));
    }
    if (listParticipant.isScreenShared) {
        return getPriority(6);
    }
    return getPriority(7);
};
export function sortDevices({ devices, participants, myExternalId, localDevice, getFeatureFlags, }) {
    const listParticipants = devices.map((device) => {
        const isMe = isSameExternalId(device.externalId, myExternalId);
        const participant = participants[device.externalId.id];
        const deviceWithRoles = isMe
            ? // чтобы изменение localDevice не триггерили перерисовки других строк
                localDevice
            : participant;
        return {
            ...device,
            isCreator: isCreator(deviceWithRoles),
            isAdmin: isAdmin(deviceWithRoles),
            ...getFeatureFlags(device),
        };
    });
    return listParticipants.sort((lpA, lpB) => {
        const priorityA = getSortingPriority(lpA);
        const priorityB = getSortingPriority(lpB);
        return priorityA - priorityB;
    });
}
//# sourceMappingURL=utils.js.map