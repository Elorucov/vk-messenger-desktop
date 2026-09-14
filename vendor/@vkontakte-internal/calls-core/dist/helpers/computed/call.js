import { peerIdToVkId, isGroupCallByVkId, isParticipantContact } from '../simple';
export const isGroupCallByPeer = (peerId) => {
    return isGroupCallByVkId(peerIdToVkId(peerId));
};
/**
 * Временное (а может и постоянное) решение для контактов
 * Доступ к групповым чатам отключён для контакта.
 * Таким образом для него state.peer всегда равен id пригласившего его в звонок
 * А из-за этого ломается вся логикаЮ которая должна работать в групповом звонке.
 * Считаем для контакта звонок всегда групповым
 * @deprecated
 */
export const isGroupCallByPeerAndMe = (peerId, me) => {
    return (me && isParticipantContact(me)) || isGroupCallByPeer(peerId);
};
export const isGroupCall = (myId, peerId, callTopology) => {
    const isServerTopology = callTopology === "SERVER" /* TransportTopology.SERVER */;
    return isGroupCallByPeerAndMe(peerId, myId) || isServerTopology;
};
//# sourceMappingURL=call.js.map