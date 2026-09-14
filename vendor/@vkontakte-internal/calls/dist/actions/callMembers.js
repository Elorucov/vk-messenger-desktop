export var ECallMembersActions;
(function (ECallMembersActions) {
    ECallMembersActions["ADD_FRIENDS"] = "add_friends";
    ECallMembersActions["SET_FRIENDS"] = "set_friends";
    ECallMembersActions["ADD_CHAT_INFO"] = "add_chat_info";
    ECallMembersActions["SET_CHAT_INFO"] = "set_chat_info";
    ECallMembersActions["ADD_GROUP_MEMBERS"] = "add_group_members";
    ECallMembersActions["SET_GROUP_MEMBERS"] = "set_group_members";
})(ECallMembersActions || (ECallMembersActions = {}));
export const addFriends = (data) => ({
    type: ECallMembersActions.ADD_FRIENDS,
    ...data,
});
export const setFriends = (data) => ({
    type: ECallMembersActions.SET_FRIENDS,
    ...data,
});
export const addChatInfo = (data) => ({
    type: ECallMembersActions.ADD_CHAT_INFO,
    ...data,
});
export const setChatInfo = (data) => ({
    type: ECallMembersActions.SET_CHAT_INFO,
    ...data,
});
export const addGroupMembers = (data) => ({
    type: ECallMembersActions.ADD_GROUP_MEMBERS,
    ...data,
});
export const setGroupMembers = (data) => ({
    type: ECallMembersActions.SET_GROUP_MEMBERS,
    ...data,
});
//# sourceMappingURL=callMembers.js.map