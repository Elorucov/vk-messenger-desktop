import * as Peer from '../model/Peer';
export const resolveIncognitoMemberId = (id) => id;
export function setCount(members, count) {
    members.count = count;
}
export function reset(members) {
    members.count = 0;
    members.adminIds = new Set();
    members.nextFrom = undefined;
    resetMembers(members);
}
export function resetMembers(members) {
    members.incognitoMembers = new Map();
    members.invitedIds = new Set();
    members.members = new Map();
    members.memberIds = new Set();
}
/**
 * Добавление админов беседы
 */
export function setAdmin(convoMembers, peerId) {
    convoMembers.adminIds.add(peerId);
}
/**
 * Добавление админов беседы
 */
export function unsetAdmin(convoMembers, peerId) {
    convoMembers.adminIds.delete(peerId);
}
/**
 *
 */
export function isAdmin(members, peerId) {
    return ((Peer.isUserPeerId(peerId) || Peer.isGroupPeerId(peerId)) &&
        members.adminIds.has(peerId));
}
/**
 * Добавить участника в беседу.
 */
export function addMembers(convoMembers, members, shouldUpdateCount) {
    for (const member of members) {
        const { peerId, isMessageRequest } = member;
        convoMembers.members.set(peerId, member);
        if (isMessageRequest) {
            convoMembers.invitedIds.add(peerId);
        }
        else {
            convoMembers.memberIds.add(peerId);
        }
    }
    if (shouldUpdateCount) {
        convoMembers.count =
            convoMembers.memberIds.size + getIncognitoMembersCount(convoMembers);
    }
}
/**
 * Удалить участника из беседы.
 */
export function removeMember(convoMembers, memberId) {
    const member = convoMembers.members.get(memberId);
    if (!member) {
        return;
    }
    if (convoMembers.members.delete(memberId)) {
        convoMembers.count = convoMembers.count - 1;
    }
    if (member.isMessageRequest) {
        convoMembers.invitedIds.delete(memberId);
    }
    else {
        convoMembers.memberIds.delete(memberId);
    }
}
/**
 *  Получить участника
 */
export function getMember(convoMembers, memberId) {
    return convoMembers.members.get(memberId);
}
/**
 *  Получить id пригласившего участника
 */
export function getMemberInviterId(convoMembers, memberId) {
    return getMember(convoMembers, memberId)?.inviterId;
}
/**
 * Возвращает количество реальных инкогнито юзеров, не учитывая тех, кто для нас контакт (приглашенных нами)
 */
export function getIncognitoMembersCount(convoMembers) {
    return convoMembers.incognitoMembers
        ? [...convoMembers.incognitoMembers?.values()].filter((incognitoMember) => !incognitoMember.memberId).length
        : 0;
}
/**
 * Получение инкогнито юзера по ID
 */
export function getIncognitoMember(convoMembers, incognitoId) {
    return convoMembers.incognitoMembers.get(incognitoId);
}
/**
 * Добавление инкогнито юзера
 */
export function addIncognitoMembers(convoMembers, incognitoMembers) {
    if (!convoMembers.incognitoMembers) {
        convoMembers.incognitoMembers = new Map();
    }
    incognitoMembers.forEach((incognitoMember) => {
        convoMembers.incognitoMembers?.set(incognitoMember.id, incognitoMember);
    });
    convoMembers.count =
        convoMembers.count + getIncognitoMembersCount(convoMembers);
}
/**
 * Удаление инкогнито юзера
 */
export function removeIncognitoMember(convoMembers, incognitoMemberId) {
    const incognitoMember = convoMembers.incognitoMembers?.get(incognitoMemberId);
    if (convoMembers.incognitoMembers?.delete(incognitoMemberId) &&
        !incognitoMember?.memberId) {
        convoMembers.count = convoMembers.count - 1;
    }
}
/**
 * Может ли участник писать в чат
 */
export function isMemberRestrictedToWrite(members, memberId) {
    return Boolean(members.members.get(memberId)?.isRestrictedToWrite);
}
/**
 * Разрешить писать в чат
 */
export function allowMemberToWrite(members, memberId) {
    if (!Peer.isChatPeerId(memberId)) {
        const member = members.members.get(memberId);
        if (member) {
            member.isRestrictedToWrite = false;
        }
    }
}
/**
 * Запретить писать в чат
 */
export function restrictMemberToWrite(members, memberId) {
    if (!Peer.isChatPeerId(memberId)) {
        const member = members.members.get(memberId);
        if (member) {
            member.isRestrictedToWrite = true;
        }
    }
}
export function isFullyLoaded(members) {
    return members.members.size + members.incognitoMembers.size === members.count;
}
//# sourceMappingURL=ChatMembers.js.map