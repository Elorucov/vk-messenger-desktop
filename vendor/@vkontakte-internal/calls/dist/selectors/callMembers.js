export const getMembers = (state) => state.callMembers;
// Друзья
export const getFriends = (state) => state.callMembers.friends;
export const getFriendsCache = (state) => state.callMembers.friendsCache;
export const getFriendsCount = (state) => state.callMembers.friendsCount;
// Участники группы
export const getGroupMembers = (state) => state.callMembers.groupMembers;
export const getGroupMembersCache = (state) => state.callMembers.groupMembersCache;
export const getGroupMembersCount = (state) => state.callMembers.groupMembersCount;
export const getUnableToCallGroupMembersIds = (state) => state.callMembers.unableToCallGroupMembersIds;
// Участники чата
export const getChatMembers = (state) => state.callMembers.chatMembers;
export const getChatData = (state) => state.callMembers.chatData;
export const getChatMembersCount = (state) => state.callMembers.chatMembersCount;
export const getChatMembersCache = (state) => state.callMembers.chatMembersCache;
//# sourceMappingURL=callMembers.js.map