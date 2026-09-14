import { ExternalIdType } from '@vkontakte/calls-sdk';
export function isSameExternalId(a, b) {
    if (!a || !b) {
        return false;
    }
    return a.deviceIdx === b.deviceIdx && a.id === b.id;
}
/** конвертирует `ExternalParticipantId` в ключ-строку */
export function externalIdToString(externalId) {
    if (!externalId) {
        throw new Error('externalId is null or undefined');
    }
    let result = externalId.id;
    if (typeof externalId.deviceIdx === 'number') {
        result += ':d' + externalId.deviceIdx;
    }
    return result;
}
export const getParticipantExternalId = (participant) => {
    if (!participant?.peerId) {
        return null;
    }
    return {
        id: participant.peerId,
        type: ExternalIdType.USER,
    };
};
export function getFirstMatchedId(...externalIds) {
    for (const id of externalIds) {
        if (id !== null && id !== undefined) {
            return id;
        }
    }
    return null;
}
//# sourceMappingURL=externalId.js.map