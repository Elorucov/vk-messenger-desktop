import { isParticipantDisabled } from '../../components/AddParticipants/utils';
export function createConversationDataObject({ callData, participants, chatMembers, friends, selected, chatData, }) {
    const conversation = chatData || callData.conversation;
    /*
     * Проверяем отсутствие данных участников в стейте
     * и добавляем эти данные из информации о чате или списка друзей
     */
    const participantsToAdd = selected.reduce((map, id) => {
        if (!participants[id]) {
            map.set(id, true);
        }
        return map;
    }, new Map());
    if (participantsToAdd.size === 0) {
        return [conversation, []];
    }
    const smallerList = chatMembers.length < friends.length ? chatMembers : friends;
    const largerList = chatMembers.length < friends.length ? friends : chatMembers;
    const { smallerListData, smallerListMap } = smallerList.reduce((acc, user) => {
        if (participantsToAdd.get(user.id)) {
            acc.smallerListData.push(user);
            acc.smallerListMap.set(user.id, true);
        }
        return acc;
    }, { smallerListData: [], smallerListMap: new Map() });
    if (smallerListData.length === participantsToAdd.size) {
        return [conversation, smallerListData];
    }
    const largerListData = largerList.filter((user) => !smallerListMap.get(user.id) && participantsToAdd.get(user.id));
    return [conversation, [...smallerListData, ...largerListData]];
}
export function getMembersByIds({ friends, chatMembers, groupMembers, bannedParticipants, }) {
    const fullMembers = [...friends, ...chatMembers, ...groupMembers];
    const foundIds = [];
    return fullMembers.filter((user) => {
        const userId = user.id;
        if (bannedParticipants.includes(userId) && !foundIds.includes(userId)) {
            foundIds.push(userId);
            return true;
        }
        return false;
    });
}
export function getModalHint(selected, getLang) {
    if (selected < 2) {
        return getLang('calls_management_add_warning');
    }
}
export const prepareCallAllData = ({ callMembers, devices, selectedMap, groupId, participants, me, activeDevices, peerIdToDevices, }) => {
    const activeParticipantsMap = activeDevices.reduce((acc, device) => {
        acc[device.externalId.id] = true;
        return acc;
    }, {});
    return callMembers.chatMembers.reduce((acc, member) => {
        const { peerId } = member;
        if (!activeParticipantsMap[peerId] &&
            !isParticipantDisabled({
                devices,
                member,
                selectedMap,
                groupId,
                participants,
                me,
                callMembers,
                peerIdToDevices,
            })) {
            acc.push(peerId);
        }
        return acc;
    }, []);
};
//# sourceMappingURL=helpers.js.map