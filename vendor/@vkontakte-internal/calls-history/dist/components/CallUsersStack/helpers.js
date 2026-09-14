import { getSingleLetter, getIdForColorCalculation } from '@vkontakte-internal/calls-core';
export function getMemberForUserStack(member) {
    const name = member.name || '';
    if (!member.photo) {
        return {
            id: getIdForColorCalculation(member.peerId),
            text: getSingleLetter(name),
            key: member.peerId,
        };
    }
    return {
        src: member.photo,
        alt: name,
        key: member.peerId,
    };
}
//# sourceMappingURL=helpers.js.map