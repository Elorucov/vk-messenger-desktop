export var ECallLongpollEntityType;
(function (ECallLongpollEntityType) {
    ECallLongpollEntityType["Calls"] = "calls";
})(ECallLongpollEntityType || (ECallLongpollEntityType = {}));
export var ECallLongpollType;
(function (ECallLongpollType) {
    ECallLongpollType["ScheduledCallsUpdate"] = "scheduled_calls_update";
    ECallLongpollType["CurrentCallsUpdate"] = "current_calls_update";
    ECallLongpollType["CallHistoryUpdated"] = "call_history_updated";
    ECallLongpollType["CallGroupHistoryUpdated"] = "call_group_history_updated";
    ECallLongpollType["ChatInfoUpdated"] = "chat_info_updated";
    ECallLongpollType["CallAccepted"] = "call_accepted";
    ECallLongpollType["CallSettingsChanged"] = "call_settings_changed";
    ECallLongpollType["IncomingCall"] = "incoming_call";
    ECallLongpollType["CallFinished"] = "call_finished";
    ECallLongpollType["ParticipantNameChanged"] = "participant_name_changed";
})(ECallLongpollType || (ECallLongpollType = {}));
export const isLongpollSuccessResponse = (payload) => {
    return Boolean(payload && 'events' in payload && Array.isArray(payload.events) && 'ts' in payload);
};
export const isLongpollErrorResponse = (payload) => {
    return Number.isFinite(payload?.failed) && Number.isFinite(payload?.err);
};
//# sourceMappingURL=longpoll.js.map