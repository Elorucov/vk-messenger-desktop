import { vkIdToPeerId } from '@vkontakte-internal/calls-core';
export const getMembersMap = (members) => {
    const membersMap = {};
    members.forEach((member) => {
        membersMap[vkIdToPeerId(member.id)] = member;
    });
    return membersMap;
};
export const getPromotionRequestMap = (requests) => {
    const requestsMap = {};
    requests.forEach((request) => {
        requestsMap[request.externalId.id] = request;
    });
    return requestsMap;
};
export const getUpdatedPromotionRequests = (state, actionData) => {
    const { requests: { ...requests }, profiles: { ...profiles }, } = state;
    const { added, removed } = actionData;
    if (added) {
        added.forEach((request) => {
            requests[request.externalId.id] = request;
        });
    }
    if (removed) {
        removed.forEach((externalId) => {
            delete requests[externalId.id];
            delete profiles[externalId.id];
        });
    }
    return { requests, profiles };
};
export const getUpdatedPromotionRequestsProfiles = ({ ...profiles }, actionData) => {
    const { added, removed } = actionData;
    if (added) {
        added.forEach((profile) => {
            profiles[vkIdToPeerId(profile.id)] = profile;
        });
    }
    if (removed) {
        removed.forEach((profile) => {
            delete profiles[vkIdToPeerId(profile.id)];
        });
    }
    return profiles;
};
export const getNewVoiceRoomListenersPages = (data) => {
    return Object.entries(data).reduce((acc, pageData) => {
        const [page, data] = pageData;
        // todo Доработать тут логику по минимальной и максимальной странице, чтоб не сеттить лишних полей
        if (Number(page) >= 0) {
            acc[page] = getMembersMap(data);
        }
        return acc;
    }, {});
};
export const removeVoiceRoomListeners = (oldPages, removeListeners) => {
    let removedCount = 0;
    const removed = Array.isArray(removeListeners) ? removeListeners : [removeListeners];
    const pagesKeys = Object.keys(oldPages);
    const pagesMap = pagesKeys.reduce((acc, page) => {
        const pageMap = { ...oldPages[page] };
        removed.forEach((removeId) => {
            if (pageMap[removeId]) {
                delete pageMap[removeId];
                removedCount++;
            }
        });
        acc[page] = pageMap;
        return acc;
    }, {});
    return {
        pagesMap,
        removedCount,
    };
};
export const getNewVoiceRoomListenersUpdateKey = ({ added, removed, }) => {
    const addedKey = generatePartUpdateKey('added', added);
    const removedKey = generatePartUpdateKey('removed', removed);
    return addedKey + removedKey;
};
function generatePartUpdateKey(prefix, ids) {
    if (!ids?.length) {
        return '';
    }
    return `${prefix}:${ids.map((externalId) => externalId.id).join(',')};`;
}
//# sourceMappingURL=helpers.js.map