export const getIsMeListener = (state) => Boolean(state.restrictedConversation);
export const getVoiceRoomName = (state) => state.voiceRoom?.roomName;
export const getVoiceRoomDescription = (state) => state.voiceRoom?.roomDescription;
export const getVoiceRoomGroups = (state) => state.voiceRoom?.groups;
export const getVoiceRoomJoinLink = (state) => state.voiceRoom?.joinLink;
export const getVoiceRoomIsAudioMode = (state) => state.voiceRoom?.isAudioMode;
export const getVoiceRoomMode = (state) => state.voiceRoom.mode;
export const getVoiceRoomNotification = (state) => state.voiceRoom.notification;
export const getVoiceRoomOwnerId = (state) => state.voiceRoom?.ownerId;
//# sourceMappingURL=common.js.map