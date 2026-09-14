import { ECallMembersActions } from '../actions/callMembers';
import { createFriendsCache } from '../helpers/user';
export const getInitialCallMembersState = (friends = [], friendsCache = {}, friendsCount = 0) => {
    return {
        friendsCache,
        friends,
        friendsCount,
        chatMembers: [],
        chatMembersCache: {},
        chatMembersCount: 0,
        groupMembers: [],
        groupMembersCache: {},
        groupMembersCount: 0,
        unableToCallGroupMembersIds: [],
    };
};
export const callMembersReducer = (state = getInitialCallMembersState(), action) => {
    switch (action.type) {
        case ECallMembersActions.ADD_FRIENDS: {
            const friends = [...state.friends, ...action.members];
            return {
                ...state,
                friends,
                friendsCache: createFriendsCache(friends),
                friendsCount: action.count || state.friendsCount,
            };
        }
        case ECallMembersActions.SET_FRIENDS: {
            return {
                ...state,
                friends: action.members,
                friendsCache: createFriendsCache(action.members),
                friendsCount: action.count || state.friendsCount,
            };
        }
        case ECallMembersActions.ADD_CHAT_INFO: {
            const chatMembers = [...state.chatMembers, ...action.members];
            return {
                ...state,
                chatMembers,
                chatData: action.conversation || state.chatData,
                chatMembersCache: createFriendsCache(chatMembers),
                chatMembersCount: action.count || state.chatMembersCount,
            };
        }
        case ECallMembersActions.SET_CHAT_INFO: {
            return {
                ...state,
                chatMembers: action.members,
                chatData: action.conversation || state.chatData,
                chatMembersCache: createFriendsCache(action.members),
                chatMembersCount: action.count || state.chatMembersCount,
            };
        }
        case ECallMembersActions.ADD_GROUP_MEMBERS: {
            const groupMembers = [...state.groupMembers, ...action.members];
            return {
                ...state,
                groupMembers,
                groupMembersCache: createFriendsCache(groupMembers),
                groupMembersCount: action.count || state.groupMembersCount,
                unableToCallGroupMembersIds: [
                    ...state.unableToCallGroupMembersIds,
                    ...action.unableToCallGroupMembersIds,
                ],
            };
        }
        case ECallMembersActions.SET_GROUP_MEMBERS: {
            return {
                ...state,
                groupMembersCount: action.count,
                groupMembers: action.members,
                unableToCallGroupMembersIds: action.unableToCallGroupMembersIds,
                groupMembersCache: createFriendsCache(action.members),
            };
        }
        default: {
            return state;
        }
    }
};
//# sourceMappingURL=callMembers.js.map