import { unclean } from '../../components/AddParticipants/utils';
import { peerIdToVkId, } from '@vkontakte-internal/calls-core';
import { decodeHTMLEntities } from '@vkontakte/vkjs';
export const getTokens = ({ selected, personCache, participants, activeDevices }) => {
    const result = new Map();
    for (const device of activeDevices) {
        const participant = participants[device.externalId.id];
        if (participant) {
            result.set(participant.peerId, {
                id: participant.peerId.toString(),
                text: decodeHTMLEntities(unclean(participant.name)),
                locked: true,
            });
        }
    }
    for (const id of selected) {
        const person = participants[id] || personCache.current.get(peerIdToVkId(id));
        result.set(id, {
            text: decodeHTMLEntities(unclean(person?.name)),
            id: id.toString(),
            locked: false,
        });
    }
    return [...result.values()];
};
//# sourceMappingURL=services.js.map