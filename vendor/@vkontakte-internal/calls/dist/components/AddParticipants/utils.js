import { escape } from '@vkontakte/vkjs';
import { SearchResultType } from '../../constants';
import { isParticipantUnavailableToCallFromGroup, EMPTY_PEER_ID, peerIdToVkId, } from '@vkontakte-internal/calls-core';
import { isUserPeer } from '@vkontakte-internal/vkjs/lib/im/Helpers';
import { isParticipantContact, isParticipantInCall } from '../../helpers/participant';
import { isAuthedByGroupId } from '../../helpers/call';
import { EMembersType } from './constants';
export function getDefaultSuggests({ getLang, members, showMore, memberType, countAll, enableChatMembersPagination, }) {
    const MEMBERS_SHOWN = 10;
    const GROUP_MEMBERS_SHOWN = 10;
    const MEMBERS_MORE = {
        type: SearchResultType.MEMBERS_MORE,
        text: enableChatMembersPagination
            ? getLang('calls_show_more_members')
            : getLang('calls_show_all_members'),
    };
    const FRIENDS_MORE = {
        type: SearchResultType.FRIENDS_MORE,
        text: getLang('calls_show_more_friends'),
    };
    const GROUP_MEMBERS_MORE = {
        type: SearchResultType.GROUP_MEMBERS_MORE,
        text: getLang('calls_show_all_group_members'),
    };
    const res = [];
    switch (memberType) {
        case EMembersType.Members:
            {
                if (members && members.length > 0) {
                    if (enableChatMembersPagination) {
                        res.push(...members);
                        if (members.length < countAll) {
                            res.push(MEMBERS_MORE);
                        }
                    }
                    else {
                        // Chat members section
                        if (showMore || members.length <= MEMBERS_SHOWN) {
                            res.push(...members);
                        }
                        else {
                            for (let i = 0; i < MEMBERS_SHOWN; i++) {
                                res.push(members[i]);
                            }
                            res.push(MEMBERS_MORE);
                        }
                    }
                }
            }
            break;
        case EMembersType.Friends:
            {
                if (members && members.length > 0) {
                    // Friends section
                    res.push(...members);
                    if (members.length < countAll) {
                        res.push(FRIENDS_MORE);
                    }
                }
            }
            break;
        case EMembersType.CommunityMembers:
            {
                if (members && members.length > 0) {
                    // Community section
                    if (showMore || members.length <= GROUP_MEMBERS_SHOWN) {
                        res.push(...members);
                    }
                    else {
                        for (let i = 0; i < GROUP_MEMBERS_SHOWN; i++) {
                            res.push(members[i]);
                        }
                        res.push(GROUP_MEMBERS_MORE);
                    }
                }
            }
            break;
    }
    return res;
}
export function isSelectedItem(id, state, selectedMap) {
    return (selectedMap && selectedMap.has(id)) || isParticipantInCall(state, id);
}
export function isParticipantDisabled({ callMembers, devices, groupId, me, member, participants, selectedMap, peerIdToDevices, }) {
    const id = member?.peerId ?? EMPTY_PEER_ID;
    if (isParticipantInCall({ devices, maps: { peerIdToDevices }, me, participants }, id)) {
        return true;
    }
    // TODO CALL-21471 REMOVE TEMPORARY CONTACTS
    if (isParticipantContact(id)) {
        return false;
    }
    if (isSelectedItem(id, { devices, maps: { peerIdToDevices }, me, participants }, selectedMap)) {
        return false;
    }
    if (isAuthedByGroupId(groupId)) {
        if (isParticipantUnavailableToCallFromGroup(id, callMembers)) {
            return true;
        }
    }
    else {
        if (!member?.canCall) {
            return true;
        }
    }
    return !isUserPeer(peerIdToVkId(id));
}
export const unclean = (str) => {
    return str ? escape(str.replace(/\t/g, '\n')) : '';
};
export const nameGetter = (member) => member.name;
//# sourceMappingURL=utils.js.map