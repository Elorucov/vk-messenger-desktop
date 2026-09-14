export const getCallData = (state) => state.callData;
/** callData is not optional in State but can be undefined in runtime */
export const getCallId = (state) => state.callData?.callId;
export const getCallConversation = (state) => state.callData?.conversation;
export const getStartCallModalOptions = (state) => state.callData?.startCallModalOptions;
export const getCallDataTopology = (state) => state.callData?.topology;
export const getCallDataShowChatHistoryRaw = (state) => state.callData?.showChatHistory;
export const getCallDataShowChatHistory = (state) => state.callData && state.callData.showChatHistory !== undefined
    ? state.callData.showChatHistory
    : state.config.sferum;
//# sourceMappingURL=callData.js.map