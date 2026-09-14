export var ModalType;
(function (ModalType) {
    ModalType["SETTINGS"] = "settings";
    ModalType["TRANSLATION"] = "translation";
    ModalType["RECORD"] = "record";
    ModalType["TRANSLATION_START_COUNTDOWN"] = "translation_start_countdown";
    ModalType["TRANSLATION_STOP"] = "translation_stop";
    ModalType["TRANSLATION_SHARE"] = "translation_share";
    ModalType["EXIT"] = "exit";
    ModalType["MUTE_PARTICIPANT"] = "mute_participant";
    ModalType["UNMUTE"] = "unmute";
    ModalType["ADMIN_PIN_UNMUTE_REQUEST"] = "admin_pin_unmute_request";
    ModalType["TRANSFER_ADMIN_RIGHTS"] = "transfer_admin_rights";
    ModalType["VIRUTAL_BACKGROUND"] = "virtual_background";
    ModalType["VMOJI"] = "vmoji";
    ModalType["UPLOAD_BACKGROUND_PHOTO"] = "virtual_upload_background_photo";
    ModalType["UPLOAD_BACKGROUND_ERROR"] = "virtual_upload_background_error";
    ModalType["HANGUP"] = "hangup";
    ModalType["SEND_LINK"] = "send_link";
    ModalType["SHARE_PLANNED_CALL"] = "share_planned_call";
    ModalType["PLAN_CALENDAR_EVENT"] = "plan_calendar_event";
    ModalType["MOVIE_CHOOSE"] = "movie_choose";
    ModalType["ROOM_CHOOSE"] = "room_choose";
    ModalType["ROOM_REQUEST_HELP"] = "room_request_help";
    ModalType["ROOM_HELP_REQUESTED"] = "room_help_requested";
    ModalType["ROOM_CONTROL_CREATE"] = "room_control_create";
    ModalType["ROOM_CONTROL"] = "room_control";
    ModalType["ROOM_CONTROL_CLOSE"] = "room_control_close";
    ModalType["ROOM_LEAVE_REMOVE_WATCH_TOGETHER"] = "room_leave_remove_watch_together";
    ModalType["ASR"] = "asr";
    ModalType["KICK_PARTICIPANT"] = "kick_participant";
    ModalType["GROUP_CALL_SETUP"] = "group_call_setup";
    ModalType["MANAGEMENT"] = "management";
    ModalType["CHANGE_NAME"] = "change_name";
    ModalType["MEMBERS_UNBAN"] = "members_unban";
    ModalType["ADMIN_ASSIGNMENT"] = "admin_assignment";
    ModalType["ROOM_TIMEOUT"] = "room_timeout";
    ModalType["QR_CODE"] = "qr_code";
    ModalType["ROOM_LEAVE_ADMIN_REMOVED_MEDIA_TRANSLATION"] = "room_leave_admin_removed_media_translation";
    ModalType["ROOM_LEAVE_REMOVE_MEDIA_TRANSLATION"] = "room_leave_remove_media_translation";
    ModalType["EDIT_CALENDAR_EVENT"] = "edit_calendar_event";
})(ModalType || (ModalType = {}));
export var RoomChooseMode;
(function (RoomChooseMode) {
    RoomChooseMode["ALL"] = "all";
    RoomChooseMode["HELP"] = "help";
})(RoomChooseMode || (RoomChooseMode = {}));
export var KickParticipantType;
(function (KickParticipantType) {
    KickParticipantType[KickParticipantType["CALL"] = 0] = "CALL";
    KickParticipantType[KickParticipantType["WAITING_HALL"] = 1] = "WAITING_HALL";
})(KickParticipantType || (KickParticipantType = {}));
export var MuteParticipantMode;
(function (MuteParticipantMode) {
    MuteParticipantMode[MuteParticipantMode["SINGLE_AUDIO"] = 0] = "SINGLE_AUDIO";
    MuteParticipantMode[MuteParticipantMode["SINGLE_VIDEO"] = 1] = "SINGLE_VIDEO";
    MuteParticipantMode[MuteParticipantMode["ALL_AUDIO"] = 2] = "ALL_AUDIO";
    MuteParticipantMode[MuteParticipantMode["ALL_VIDEO"] = 3] = "ALL_VIDEO";
    MuteParticipantMode[MuteParticipantMode["SINGLE_SCREEN_SHARING"] = 4] = "SINGLE_SCREEN_SHARING";
})(MuteParticipantMode || (MuteParticipantMode = {}));
export var UnmuteModalRequestType;
(function (UnmuteModalRequestType) {
    UnmuteModalRequestType[UnmuteModalRequestType["BOTH"] = 0] = "BOTH";
    UnmuteModalRequestType[UnmuteModalRequestType["AUDIO"] = 1] = "AUDIO";
    UnmuteModalRequestType[UnmuteModalRequestType["VIDEO"] = 2] = "VIDEO";
})(UnmuteModalRequestType || (UnmuteModalRequestType = {}));
export var ManagementModalView;
(function (ManagementModalView) {
    ManagementModalView[ManagementModalView["MAIN"] = 0] = "MAIN";
    ManagementModalView[ManagementModalView["CALL_LINK"] = 1] = "CALL_LINK";
    ManagementModalView[ManagementModalView["ADD_PARTICIPANTS"] = 2] = "ADD_PARTICIPANTS";
    ManagementModalView[ManagementModalView["WAITING_HALL"] = 3] = "WAITING_HALL";
})(ManagementModalView || (ManagementModalView = {}));
export var MEDIA_TRANSLATION_TYPE;
(function (MEDIA_TRANSLATION_TYPE) {
    MEDIA_TRANSLATION_TYPE["WATCH_TOGETHER"] = "watch_together";
    MEDIA_TRANSLATION_TYPE["RECORD"] = "record";
    MEDIA_TRANSLATION_TYPE["STREAM"] = "stream";
})(MEDIA_TRANSLATION_TYPE || (MEDIA_TRANSLATION_TYPE = {}));
export const modalHasType = (modal, requiredType) => {
    return modal?.type === requiredType;
};
//# sourceMappingURL=modal.js.map