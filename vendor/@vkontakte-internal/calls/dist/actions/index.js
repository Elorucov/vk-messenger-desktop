import { actionCreator } from '../helpers/actionCreator';
import { E_ACTION } from '../constants';
export * from './localDevice';
export * from './modal';
export const setIsVoiceRoom = actionCreator(E_ACTION.SET_IS_VOICE_ROOM);
export const setHasInCallChat = actionCreator(E_ACTION.SET_HAS_IN_CALL_CHAT);
export const updateReactionsHistory = actionCreator(E_ACTION.UPDATE_REACTIONS_HISTORY);
export const setCallNotification = (notification) => ({
    type: E_ACTION.CALL_NOTIFICATION,
    notification,
});
export const changeUiMode = (mode) => ({
    type: E_ACTION.CHANGE_UI_MODE,
    mode,
});
export const changeParticipantRoles = (participantId, data) => ({
    type: E_ACTION.CHANGE_PARTICIPANT_ROLES,
    participantId,
    data,
});
export const setRestrictedConversation = actionCreator(E_ACTION.SET_RESTRICTED_CONVERSATION);
export const updateAnonSecret = (secret) => ({
    type: E_ACTION.UPDATE_ANON_SECRET,
    secret,
});
export const setShowLoader = actionCreator(E_ACTION.SHOW_LOADER);
export const updateConversation = (value) => ({
    type: E_ACTION.UPDATE_CONVERSATION,
    data: value,
});
//# sourceMappingURL=index.js.map