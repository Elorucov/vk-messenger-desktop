import { HangupType } from '@vkontakte/calls-sdk';
export const VIDEO_SLOTS_COUNT = 30;
export const VIDEO_RESOLUTION_STORAGE_KEY = 'calls_video_resolution';
export const VMOJI_CAPTURE_STORAGE_KEY = 'calls_vmoji_capture';
export const VK_HOST = 'vk.com';
export const VK_ORIGIN = `https://${VK_HOST}`;
export const LOCALSTORAGE_IS_CALLS_APP_DOWNLOADED = 'vkcalls:calls_app_downloaded';
export const LOCALSTORAGE_IS_MESSENGER_APP_DOWNLOADED = 'vkcalls:messenger_app_downloaded';
export const DESKTOP_CALLS_SCHEME = 'vkcalls://';
export const DESKTOP_CALLS_HOST = VK_HOST;
export const DESKTOP_CALLS_DOWNLOAD_PAGE = `${VK_ORIGIN}/video-calls`;
// export const APP_STORE_URL = 'https://apps.apple.com/ru/app/%D1%81%D1%84%D0%B5%D1%80%D1%83%D0%BC/id1542193916';
// export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=ru.sferum.android';
export const CALLS_DESKTOP_APP_NOTIFICATION = 'calls_desktop_app_notification';
export var VideoHeight;
(function (VideoHeight) {
    VideoHeight[VideoHeight["SD"] = 360] = "SD";
    VideoHeight[VideoHeight["HD"] = 720] = "HD";
    VideoHeight[VideoHeight["FHD"] = 1080] = "FHD";
})(VideoHeight || (VideoHeight = {}));
export var VideoWidth;
(function (VideoWidth) {
    VideoWidth[VideoWidth["SD"] = 640] = "SD";
    VideoWidth[VideoWidth["HD"] = 1280] = "HD";
    VideoWidth[VideoWidth["FHD"] = 1920] = "FHD";
})(VideoWidth || (VideoWidth = {}));
export var MediaPermissionType;
(function (MediaPermissionType) {
    MediaPermissionType[MediaPermissionType["DENY"] = 0] = "DENY";
    MediaPermissionType[MediaPermissionType["ONCE"] = 1] = "ONCE";
    MediaPermissionType[MediaPermissionType["ALLOW"] = Infinity] = "ALLOW";
})(MediaPermissionType || (MediaPermissionType = {}));
export var CallErrorType;
(function (CallErrorType) {
    CallErrorType["ALREADY_HAS_INCOMING_CALL"] = "already_has_incoming_call";
    CallErrorType["ALREADY_IN_CALL"] = "already_in_call";
    CallErrorType["CANT_REACH_API"] = "cant_reach_api";
})(CallErrorType || (CallErrorType = {}));
/**
 * TODO: нужно обработать все ошибки приходящие от ok sdk.
 */
export var MediaError;
(function (MediaError) {
    MediaError["MIC_CAMERA_PERMISSION"] = "mic_camera";
    MediaError["CAMERA_PERMISSION"] = "camera";
    MediaError["MIC_PERMISSION"] = "mic";
    MediaError["CAMERA_ACCESS"] = "cameralock";
    MediaError["MIC_ACCESS"] = "miclock";
    MediaError["MIC_NOT_FOUND"] = "nomic";
    MediaError["SCREEN_PERMISSION"] = "screenpermission";
    MediaError["SCREEN_ACCESS"] = "screenlock";
})(MediaError || (MediaError = {}));
export var FatalError;
(function (FatalError) {
    FatalError["AUTH"] = "auth";
})(FatalError || (FatalError = {}));
// Application mode types
export var SearchResultType;
(function (SearchResultType) {
    SearchResultType[SearchResultType["HEADER"] = 0] = "HEADER";
    SearchResultType[SearchResultType["CALL_ALL_IN_CHAT"] = 1] = "CALL_ALL_IN_CHAT";
    SearchResultType[SearchResultType["MEMBERS_MORE"] = 2] = "MEMBERS_MORE";
    SearchResultType[SearchResultType["FRIENDS_MORE"] = 3] = "FRIENDS_MORE";
    SearchResultType[SearchResultType["GROUP_MEMBERS_MORE"] = 4] = "GROUP_MEMBERS_MORE";
})(SearchResultType || (SearchResultType = {}));
// Action types
export var E_ACTION;
(function (E_ACTION) {
    E_ACTION["LOAD_PEERS"] = "load_peer";
    E_ACTION["CHANGE_MODE"] = "change_mode";
    E_ACTION["CALL_STATE"] = "call_state";
    E_ACTION["REMOVE_USER"] = "remove_user";
    E_ACTION["TIME_START"] = "time_start";
    E_ACTION["LOCAL_TIME_START"] = "local_time_start";
    E_ACTION["HANGUP"] = "hangup";
    E_ACTION["GROUP_CALL_SETUP"] = "group_call_setup";
    E_ACTION["TOGGLE_MODAL"] = "toggle_modal";
    E_ACTION["TOGGLE_CHILD_MODAL"] = "toggle_child_modal";
    E_ACTION["CHANGE_UI_MODE"] = "change_ui_mode";
    E_ACTION["SET_ORATOR"] = "set_orator";
    E_ACTION["TOGGLE_ORATOR_MODE"] = "toggle_orator_mode";
    E_ACTION["TOGGLE_PARTICIPANTS_ASIDE"] = "toggle_participants_aside";
    E_ACTION["SET_PINNED_PARTICIPANT"] = "set_pinned_participant";
    E_ACTION["SET_ADMIN_PINNED_PARTICIPANT"] = "set_admin_pinned_participant";
    E_ACTION["SET_MEDIA_SHARING_PINNED_PARTICIPANT"] = "set_media_sharing_pinned_participant";
    E_ACTION["CALL_NOTIFICATION"] = "call_notification";
    E_ACTION["JOIN"] = "join";
    E_ACTION["CALL_BY_NAME"] = "call_by_name";
    E_ACTION["ERROR"] = "error";
    E_ACTION["CHANGE_PARTICIPANT_ROLES"] = "change_participant_roles";
    E_ACTION["SET_MEDIA_SHARER"] = "set_media_sharer";
    E_ACTION["OFF_MEDIA_SHARERS"] = "off_media_sharers";
    E_ACTION["UPDATE_PARTICIPANTS_BATCH"] = "update_participants_batch";
    E_ACTION["REMOVE_DEVICE_FROM_CACHE"] = "remove_device_from_cache";
    E_ACTION["SET_UNREAD_COUNT"] = "set_unread_count";
    E_ACTION["SHOW_CAUTION_BOX"] = "show_caution_box";
    E_ACTION["SHOW_LOADER"] = "show_loader";
    E_ACTION["SET_TOOLTIP"] = "set_tooltip";
    E_ACTION["SET_ENTRYPOINT"] = "set_entrypoint";
    E_ACTION["MANUAL_ADD_PARTICIPANTS"] = "manual_add_participants";
    E_ACTION["SET_TRANSLATION"] = "set_translation";
    E_ACTION["UPDATE_ANON_SECRET"] = "update_anon_token";
    E_ACTION["SET_NOISE_CANCELLATION"] = "set_noise_cancellation";
    E_ACTION["CHANGE_LOCAL_VIDEO_RESOLUTION"] = "change_local_video_resolution";
    E_ACTION["SET_CONVERSATION_OPTIONS"] = "set_conversation_options";
    E_ACTION["SET_PRIVACY_SETTINGS"] = "set_privacy_settings";
    E_ACTION["SET_GROUP"] = "set_group";
    E_ACTION["SET_WAITING_HALL"] = "set_waiting_hall";
    E_ACTION["SET_GRID_SCROLL_POSITION"] = "set_grid_scroll_position";
    E_ACTION["SET_ORATOR_SCROLL_POSITION"] = "set_orator_scroll_position";
    E_ACTION["SET_SHOW_DESKTOP_NOTIFICATION"] = "set_show_desktop_notification";
    E_ACTION["SET_SHOW_WARNING_DESKTOP_NOTIFICATION"] = "set_show_warning_desktop_notification";
    E_ACTION["SET_START_OPTIONS"] = "set_start_params";
    E_ACTION["VB_SET_USER_PHOTOS"] = "vb_set_user_photos";
    E_ACTION["VB_ADD_USER_PHOTO"] = "vb_add_user_photo";
    E_ACTION["VB_REMOVE_USER_PHOTO"] = "vb_remove_user_photo";
    E_ACTION["VB_SET_VIDEO_OPTIONS"] = "vb_set_video_options";
    E_ACTION["SET_CALL_PERMISSIONS"] = "set_call_permissions";
    E_ACTION["SET_PARTICIPANTS_CHUNK"] = "set_participants_chunk";
    E_ACTION["SET_PARTICIPANT_HAND_STATE"] = "set_participant_hand_state";
    E_ACTION["SET_PARTICIPANT_DRAT_STATE"] = "set_participant_drat_state";
    E_ACTION["CLEAN_LAST_CALL_DATA"] = "clean_last_call_data";
    E_ACTION["SET_LAST_CALL_DATA"] = "set_last_call_data";
    E_ACTION["SET_LOCAL_DEVICE"] = "set_local_device";
    E_ACTION["SET_REACTIONS"] = "set_reactions";
    E_ACTION["UPDATE_REACTIONS_HISTORY"] = "update_reactions_history";
    E_ACTION["SET_GLOBAL_MOVIE_SHARE_PERMISSION"] = "set_global_movie_share_permission";
    E_ACTION["SET_CALLS_QUEUE_RESPONSE"] = "set_calls_queue_response";
    E_ACTION["SET_WATCH_TOGETHER"] = "set_watch_together";
    E_ACTION["SET_FEATURE_NOTIFICATION"] = "set_feature_notification";
    E_ACTION["SET_GLOBAL_CALL_FEATURES"] = "set_global_call_features";
    E_ACTION["SET_RESTRICTED_CONVERSATION"] = "set_restricted_conversation";
    E_ACTION["TOGGLE_SIMPLE_PIP"] = "toggle_simple_pip";
    E_ACTION["SET_VIDEO_SUSPEND_MODE"] = "set_video_suspend_mode";
    E_ACTION["CHANGE_PARTICIPANT_ID"] = "change_participant_id";
    E_ACTION["SET_IS_VOICE_ROOM"] = "set_is_voice_room";
    E_ACTION["SET_CHAT_MESSAGE"] = "set_chat_message";
    E_ACTION["REMOVE_CHAT_MESSAGE"] = "remove_chat_message";
    E_ACTION["REMOVE_CHAT_MESSAGES"] = "remove_chat_messages";
    E_ACTION["SET_HAS_IN_CALL_CHAT"] = "set_has_chat";
    E_ACTION["SET_WAS_NETWORK_INDICATOR_SHOWN"] = "set_was_network_indicator_shown";
    E_ACTION["SET_JOIN_LINK"] = "set_join_link";
    E_ACTION["TOGGLE_IN_CALL_CHAT"] = "toggle_in_call_chat";
    E_ACTION["SET_SHOW_CHAT_HISTORY"] = "show_chat_history";
    E_ACTION["SET_EFFECT_VOICE_CHANGE"] = "set_effect_voice_change";
    E_ACTION["UPDATE_CONVERSATION"] = "update_conversation";
})(E_ACTION || (E_ACTION = {}));
// Call types
export var CallType;
(function (CallType) {
    CallType["AUDIO"] = "audio";
    CallType["VIDEO"] = "video";
})(CallType || (CallType = {}));
export var SdkErrorType;
(function (SdkErrorType) {
    SdkErrorType["NETWORK"] = "network_error";
    SdkErrorType["API"] = "api_error";
})(SdkErrorType || (SdkErrorType = {}));
// Сколько висит нотификация по умолчанию (в мс)
export const defaultNotificationLifeSpan = 5000;
// Минимальный порог громкости срабатывания событий
export const VOLUME_LEVEL_DETECTION = 0.25;
/** сколько уведомлений о плохом соединении
 * должно поступить до выключения камеры */
export const BAD_CONNECTION_DISABLED_CAMERA_LEVEL = 3;
// Hangup delay, seconds
export const HANGUP_DELAY = 2;
// Client error types
export const CLIENT_ERROR_UNKNOWN = -2;
export const SDK_ERROR_AUTH = 401;
// @TODO Use HangupType enum directly
export const HANGUP_TYPE_BUSY = HangupType.BUSY;
export const HANGUP_TYPE_CALLEE_IS_OFFLINE = HangupType.CALLEE_IS_OFFLINE;
export const HANGUP_TYPE_CALLER_IS_BLOCKED = HangupType.CALLER_IS_BLOCKED;
export const HANGUP_TYPE_CANCELED = HangupType.CANCELED;
export const HANGUP_TYPE_EXTERNAL_API_ERROR = HangupType.EXTERNAL_API_ERROR;
export const HANGUP_TYPE_FAILED = HangupType.FAILED;
export const HANGUP_TYPE_HUNGUP = HangupType.HUNGUP;
export const HANGUP_TYPE_MISSED = HangupType.MISSED;
export const HANGUP_TYPE_NOT_FRIENDS = HangupType.NOT_FRIENDS;
export const HANGUP_TYPE_OLD_VERSION = HangupType.OLD_VERSION;
export const HANGUP_TYPE_REJECTED = HangupType.REJECTED;
export const HANGUP_TYPE_REMOVED = HangupType.REMOVED;
export const HANGUP_TYPE_SERVICE_DISABLED = HangupType.SERVICE_DISABLED;
export const HANGUP_TYPE_UNKNOWN_ERROR = HangupType.UNKNOWN_ERROR;
export const HANGUP_TYPE_UNSUPPORTED = HangupType.UNSUPPORTED;
export const HANGUP_TYPE_NOT_FOUND = HangupType.NOT_FOUND;
/**
 * При фатальной ошибке (рендеринга, например) прокидываем наружу, например для логирования в сентри
 */
export var Sounds;
(function (Sounds) {
    Sounds["INCOMING"] = "incoming";
    Sounds["OUTGOING"] = "outgoing";
    Sounds["CONNECTING"] = "connecting";
    Sounds["CONNECTED"] = "connected";
    Sounds["END"] = "end";
})(Sounds || (Sounds = {}));
// longpoll events
export const INCOMING_CALL = 'incoming_call';
export const COUNT_OF_GROUP_MEMBERS_TO_LOAD = 500;
export var EVideoEffectType;
(function (EVideoEffectType) {
    EVideoEffectType["BACKGROUND"] = "calls_background";
    EVideoEffectType["BLUR"] = "calls_blur";
    EVideoEffectType["NONE"] = "calls_none";
    EVideoEffectType["ADD"] = "calls_add";
    EVideoEffectType["OVERLAY"] = "calls_overlay";
})(EVideoEffectType || (EVideoEffectType = {}));
/** `localStorage` keys for vk calls */
export const LS_KEYS = {
    VIRTUAL_BACKGROUND_EFFECT: 'calls_virtual_background_effect',
    VIRTUAL_BACKGROUND_EFFECT_SELECTED_TS: 'calls_virtual_background_effect_selected_ts',
    VIDEO_OPTIONS: 'calls_video_options',
    CUSTOM_EXTERNAL_DOMAIN: 'calls_custom_external_domain',
    CHANGED_NAME: 'calls_changed_name',
};
/** `localStorage` keys for sferum */
export const LS_SFERUM_KEYS = {
    VIRTUAL_BACKGROUND_EFFECT: 'sferum_virtual_background_effect',
    VIRTUAL_BACKGROUND_EFFECT_SELECTED_TS: 'sferum_virtual_background_effect_selected_ts',
    VIDEO_OPTIONS: 'sferum_video_options',
};
export const VIRTUAL_BACKGROUND_BLUR_ID = -16;
export const ROOM_UNDEFINED_ID = -1;
export const ROOM_MAIN_ID = null;
/**
 * Максимальное количество участников в ряд с закрытым и открытым чатом
 */
export const MAX_PARTICIPANTS_IN_GRID_LINE = 5;
export const MAX_PARTICIPANTS_IN_GRID_LINE_WITH_IN_CALL_CHAT = 3;
/** айдишник для элемента, в котором отображаются участники */
export const ID_CALLS_PARTICIPANTS_BOX = 'CallsParticipantsBox-1669373178177';
/** через какое время реакция исчезнет */
export const REACTION_FADE_OUT_DELAY = 10000;
export const TOOLTIP_DELAY = 300;
/** максимальная высота окна звонков, смотреть в `variables.css` */
export const CALL_MAX_H = 693;
/** минимальная высота окна звонков, смотреть в `variables.css` */
export const CALL_MIN_H = 500;
// Максимальная длина названия сессионного зала
export const ROOMS_NAME_MAX_LENGTH = 50;
// Количество создаваемых залов по-умолчанию
export const ROOMS_COUNT = 2;
// Автоматическое распределение участников по залам по-умолчанию
export const ROOMS_ASSIGN_RANDOMLY = true;
// Максимальное количество сессионных залов
export const ROOMS_MAX_COUNT = 50;
// Максимальное количество участников в зале
export const ROOMS_MAX_PARTICIPANTS_COUNT = 256;
export var CallByNameProfileType;
(function (CallByNameProfileType) {
    CallByNameProfileType[CallByNameProfileType["PROFILE"] = 0] = "PROFILE";
    CallByNameProfileType[CallByNameProfileType["GROUP"] = 1] = "GROUP";
    CallByNameProfileType[CallByNameProfileType["ANONYM"] = 2] = "ANONYM";
})(CallByNameProfileType || (CallByNameProfileType = {}));
/**
 * @see CallAnonym::NAME_REGEX
 */
export const NAME_REGEX = /^[A-Za-zА-Яа-яЁё0-9_ \-іїєґІЇЄҐїЇ]{2,25}$/;
export const MIN_NAME_LENGTH = 2;
export const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});
/**
 * здесь пока не знаем в зале мы или нет, но если мы в зале conversation нам не вернется.
 *
 * 951 - Call not found
 * 1007 - может быть достигнут лимит по кол-ву участников в чате,
 * но звонок не должен упасть при этом
 * 8 - в некоторых случаях запрос чата падает с ошибкой, звонок должен жить
 *
 * Новые коды ошибок calls.getConversationByCall, по падать звонок не должен
 * 917 - You don't have access to this chat
 * 927- Chat does not exist
 * 9000 - Call not found
 * 9004 - Call chat limit reached
 */
export const skippedErrorCodes = [
    8, // Invalid request
    951, // Call not found
    1007, // Call chat limit reached
    917, // You don't have access to this chat
    927, // Chat does not exist
    9000, // Call not found (new)
    9004, // Call chat limit reached (new)
];
export var TIMESPENT_EVENT_COUNTER;
(function (TIMESPENT_EVENT_COUNTER) {
    TIMESPENT_EVENT_COUNTER[TIMESPENT_EVENT_COUNTER["SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS"] = 22] = "SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS";
    TIMESPENT_EVENT_COUNTER[TIMESPENT_EVENT_COUNTER["SUCCESSFUL_GROUP_CALL_OF_AUTHENTICATED_VK_MEMBERS"] = 23] = "SUCCESSFUL_GROUP_CALL_OF_AUTHENTICATED_VK_MEMBERS";
    TIMESPENT_EVENT_COUNTER[TIMESPENT_EVENT_COUNTER["SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS_WITH_CAMERA"] = 24] = "SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS_WITH_CAMERA";
})(TIMESPENT_EVENT_COUNTER || (TIMESPENT_EVENT_COUNTER = {}));
export var VmojiErrorReason;
(function (VmojiErrorReason) {
    VmojiErrorReason["NO_ANIMATED_AVATAR"] = "no_animated_avatar";
    VmojiErrorReason["NO_URL"] = "no_url";
    VmojiErrorReason["INVALID_URL"] = "invalid_url";
    VmojiErrorReason["INVALID_SVG"] = "invalid_svg";
    VmojiErrorReason["FAILED_TO_DECRYPT"] = "failed_to_decrypt";
    VmojiErrorReason["BAD_HTTP_STATUS"] = "bad_http_status";
})(VmojiErrorReason || (VmojiErrorReason = {}));
export const VMOJI_INVALID_URL_PATTERN = 'AAAAAAAAAAA.bin';
export const COUNT_OF_FRIENDS_TO_LOAD = 100;
export const COUNT_OF_CHAT_MEMBERS_TO_LOAD = 100;
export const DEFAULT_TIMER_MINS = '';
export var TIMER_INPUT_TYPE;
(function (TIMER_INPUT_TYPE) {
    TIMER_INPUT_TYPE["MANUAL"] = "manual";
    TIMER_INPUT_TYPE["PRESET"] = "preset";
})(TIMER_INPUT_TYPE || (TIMER_INPUT_TYPE = {}));
export const INBOX_MESSAGE_MAX_LENGTH = 4096;
export const SHORT_LINK_REGEX = /(sferum\.ru\/\?call=.+)|(\/call\/(?!join))/i;
//# sourceMappingURL=constants.js.map