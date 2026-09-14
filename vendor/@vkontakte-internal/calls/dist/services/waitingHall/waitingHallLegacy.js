import { getWaitingHall } from '@vkontakte/calls-sdk';
import { peerIdToVkId } from '@vkontakte-internal/calls-core';
import { isParticipantAnonym } from '../../helpers/participant';
import { normalizeGroup, normalizeUser } from '../../helpers/user';
import { getCallParticipantsApiCall } from '../backend';
import { groupIdsOnToLoadAndExisted } from './utils';
export function loadWaitingHall({ firstParticipants, totalCount, waitingHall, ...baseOptions }) {
    return getExternalIdsForWaitingHall(totalCount, firstParticipants).then((externalIds) => {
        const { members: prevMembers, hasNew: prevHasNew } = waitingHall || {
            members: new Map(),
            hasNew: false,
        };
        const [peerIdsToLoad, peerIdsExisted] = groupIdsOnToLoadAndExisted(externalIds, prevMembers);
        const hasIdsToLoad = peerIdsToLoad.length > 0;
        const nextMembers = peerIdsExisted.reduce((nextMembers, intId) => {
            const prevMember = prevMembers.get(intId);
            if (prevMember) {
                nextMembers.set(intId, prevMember);
            }
            return nextMembers;
        }, new Map());
        const nextWaitingHall = {
            totalCount,
            members: nextMembers,
            hasNew: hasIdsToLoad ? true : prevHasNew,
        };
        if (!hasIdsToLoad) {
            return nextWaitingHall;
        }
        return getCallMembers({
            ...baseOptions,
            peerIdsToLoad,
        })
            .then((members) => {
            members.forEach((user) => {
                if (user && user.peerId) {
                    nextWaitingHall.members.set(user.peerId, user);
                }
            });
            return nextWaitingHall;
        })
            .catch(() => nextWaitingHall);
    });
    function getExternalIdsForWaitingHall(totalCount, firstParticipants) {
        if (firstParticipants.length === 0) {
            return Promise.resolve([]);
        }
        if (totalCount > firstParticipants.length) {
            return getWaitingHall(null, totalCount).then((response) => response.participants);
        }
        return Promise.resolve(firstParticipants);
    }
}
export function loadWaitingHallFromScratch(options) {
    return getWaitingHall(null, undefined).then((response) => {
        return loadWaitingHall({
            ...options,
            totalCount: response.totalCount,
            firstParticipants: response.participants,
        });
    });
}
export function loadAdditionalWaitingHall({ waitingHall, ...baseOptions }) {
    if (!waitingHall) {
        return Promise.resolve();
    }
    const totalCount = waitingHall.totalCount;
    const needLoadMore = totalCount > waitingHall.members.size;
    if (!needLoadMore) {
        return Promise.resolve();
    }
    return getWaitingHall(null, totalCount).then((response) => {
        return loadWaitingHall({
            ...baseOptions,
            totalCount: response.totalCount,
            firstParticipants: response.participants,
        });
    });
}
function getCallMembers({ anonymSecret, callId, me, peerIdsToLoad }) {
    const isAnonymous = isParticipantAnonym(me);
    const anonymousId = isAnonymous ? peerIdToVkId(me) : 0;
    return getCallParticipantsApiCall(callId, peerIdsToLoad, isAnonymous, anonymSecret, anonymousId).then(({ profiles = [], anonyms = [], groups = [] }) => {
        return [...anonyms.map(normalizeUser), ...profiles.map(normalizeUser), ...groups.map(normalizeGroup)];
    });
}
//# sourceMappingURL=waitingHallLegacy.js.map