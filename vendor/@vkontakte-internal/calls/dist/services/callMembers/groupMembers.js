import { COUNT_OF_GROUP_MEMBERS_TO_LOAD } from '../../constants';
import { vkIdToPeerId } from '@vkontakte-internal/calls-core';
import { getGroupMembers, searchUsers } from '../../services/backend';
import { normalizeUser } from '../../helpers/user';
export function loadGroupMembers(authorizedGroupId) {
    return getGroupMembers(-authorizedGroupId, 0, COUNT_OF_GROUP_MEMBERS_TO_LOAD).then(({ items, count }) => {
        let data = [];
        let unableToCallGroupMembersIds = [];
        items.forEach((value) => {
            if (value.deactivated) {
                return;
            }
            data.push(normalizeUser(value));
            if (!value.can_call_from_group) {
                unableToCallGroupMembersIds.push(vkIdToPeerId(value.id));
            }
        });
        return { data, unableToCallGroupMembersIds, count };
    });
}
export function searchGroupMembers(groupId, q = '', groupMembersCache) {
    return searchUsers(groupId, q).then(({ items }) => {
        let groupMembers = [];
        let unableToCallGroupMembersIds = [];
        if (items) {
            items.forEach((value) => {
                if (value.deactivated) {
                    return;
                }
                if (!(value.id in groupMembersCache)) {
                    groupMembers.push(normalizeUser(value));
                    if (!value.can_call_from_group) {
                        unableToCallGroupMembersIds.push(vkIdToPeerId(value.id));
                    }
                }
            });
        }
        return {
            data: groupMembers,
            unableToCallGroupMembersIds,
        };
    });
}
//# sourceMappingURL=groupMembers.js.map