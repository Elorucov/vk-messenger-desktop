export var CallStatSource;
(function (CallStatSource) {
    CallStatSource["CONVO_HEADER"] = "im_header";
    CallStatSource["CONVO_SNIPPET"] = "im_message";
    CallStatSource["CONVO_LIST"] = "im_create";
    CallStatSource["CONVO_JOIN_SNIPPET"] = "im_join_message";
    CallStatSource["CONVO_JOIN_HEADER"] = "im_join_header";
    CallStatSource["CONVO_JOIN_BANNER"] = "im_join_header";
    // FRIENDS_LIST is extracted into a separate module to avoid importing 'im' in friends
    CallStatSource["FRIENDS_LIST"] = "friends_list";
    CallStatSource["LINK_JOIN_SNIPPET"] = "join_deeplink";
    CallStatSource["LINK_JOIN_PAGE"] = "join_deeplink";
    CallStatSource["PROFILE"] = "profile";
    CallStatSource["WIDGET"] = "im_widget";
    CallStatSource["FAST_CHAT"] = "fast_chat";
    CallStatSource["HISTORY"] = "history";
    CallStatSource["HISTORY_FRIENDS_LIST"] = "history_friends_list";
    CallStatSource["HISTORY_CREATE"] = "history_create";
    CallStatSource["LINK"] = "link";
    CallStatSource["STANDALONE"] = "standalone";
    CallStatSource["MINI_APP"] = "mini_app";
    CallStatSource["JOIN_BY_LINK_POPUP"] = "join_by_link_popup";
    CallStatSource["FC_HEADER"] = "fast_chat_header";
    CallStatSource["FC_PROFILE"] = "fast_chat_profile";
    CallStatSource["FC_MESSAGE_PROFILE"] = "fast_chat_message_profile";
    CallStatSource["FC_CREATE"] = "fast_chat_create";
    CallStatSource["FC_MESSAGE"] = "fast_chat_message";
    CallStatSource["FC_JOIN_POPUP"] = "fast_chat_join_popup";
    CallStatSource["FC_JOIN_BANNER"] = "fast_chat_join_banner";
    CallStatSource["FC_JOIN"] = "fast_chat_join";
    CallStatSource["IM_HEADER"] = "im_header";
    CallStatSource["IM_PROFILE"] = "im_profile";
    CallStatSource["IM_MESSAGE_PROFILE"] = "im_message_profile";
    CallStatSource["IM_CREATE"] = "im_create";
    CallStatSource["IM_MESSAGE"] = "im_message";
    CallStatSource["IM_JOIN_POPUP"] = "im_join_popup";
    CallStatSource["IM_JOIN_BANNER"] = "im_join_banner";
    CallStatSource["IM_JOIN"] = "im_join";
    CallStatSource["VKME_HEADER"] = "vkme_header";
    CallStatSource["VKME_PROFILE"] = "vkme_profile";
    CallStatSource["VKME_MESSAGE_PROFILE"] = "vkme_message_profile";
    CallStatSource["VKME_CREATE"] = "vkme_create";
    CallStatSource["VKME_MESSAGE"] = "vkme_message";
    CallStatSource["VKME_JOIN_POPUP"] = "vkme_join_popup";
    CallStatSource["VKME_JOIN_BANNER"] = "vkme_join_banner";
    CallStatSource["VKME_JOIN"] = "vkme_join";
    CallStatSource["VKME_CHANNEL_ACTION_BUTTON"] = "vkme_channel_action_button";
    CallStatSource["VKME_JOIN_BY_LINK_POPUP"] = "vkme_join_by_link_popup";
    CallStatSource["MESSENGER_UNHANDLED_SOURCE"] = "messenger_unhandled_source";
})(CallStatSource || (CallStatSource = {}));
export var ClickHouseEventType;
(function (ClickHouseEventType) {
    ClickHouseEventType["OUTGOING_CALL_STARTED_VIDEO"] = "OutgoingCallStartedVideo";
    ClickHouseEventType["OUTGOING_CALL_STARTED_AUDIO"] = "OutgoingCallStartedAudio";
    ClickHouseEventType["OUTGOING_CALL_ADD_PARTICIPANTS_SENT"] = "OutgoingCallAddParticipantsSent";
    ClickHouseEventType["OUTGOING_CALL_REMOTE_RINGING"] = "OutgoingCallRemoteRinging";
    ClickHouseEventType["OUTGOING_CALL_ACCEPTED_REMOTELY"] = "OutgoingCallAcceptedRemotely";
    ClickHouseEventType["OUTGOING_CALL_FAILED"] = "OutgoingCallFailed";
    ClickHouseEventType["OUTGOING_CALL_COMPLETED"] = "OutgoingCallCompleted";
    ClickHouseEventType["INCOMING_CALL_RECEIVED"] = "IncomingCallReceived";
    ClickHouseEventType["INCOMING_CALL_ACCEPTED"] = "IncomingCallAccepted";
    ClickHouseEventType["INCOMING_CALL_FAILED"] = "IncomingCallFailed";
    ClickHouseEventType["CALL_DECLINED_OR_HANGED_LOCALLY"] = "CallDeclinedOrHangedLocally";
    ClickHouseEventType["CALL_DECLINED_OR_HANGED_REMOTELY"] = "CallDeclinedOrHangedRemotely";
    ClickHouseEventType["CALL_CONNECTED"] = "CallConnected";
    ClickHouseEventType["CALL_DISCONNECTED"] = "CallDisconnected";
    ClickHouseEventType["VIDEO_ENABLED"] = "VideoEnabled";
    ClickHouseEventType["VIDEO_SETTINGS"] = "VideoSettings";
    ClickHouseEventType["VIDEO_DISABLED"] = "VideoDisabled";
    ClickHouseEventType["RELAY_CONNECTION_ESTABLISHED"] = "RelayConnectionEstablished";
    ClickHouseEventType["USER_FEEDBACK_RECEIVED"] = "UserFeedbackReceived";
    ClickHouseEventType["SYSTEM_STAT"] = "SystemStat";
    ClickHouseEventType["GROUP_CALL_JOINED"] = "GroupCallJoined";
    ClickHouseEventType["GROUP_CALL_JOIN_FAILED"] = "GroupCallJoinFailed";
    ClickHouseEventType["HAND_RAISED"] = "HandRaised";
    ClickHouseEventType["HAND_LOWERED"] = "HandLowered";
    ClickHouseEventType["SCREEN_SHARING_STARTED"] = "ScreenSharingStarted";
    ClickHouseEventType["SCREEN_SHARING_STOPPED"] = "ScreenSharingStopped";
    ClickHouseEventType["AUDIO_SHARING_STARTED"] = "AudioSharingStarted";
    ClickHouseEventType["ALL_MICS_DISABLED"] = "AllMicsDisabled";
    ClickHouseEventType["USER_MICS_DISABLED"] = "UserMicsDisabled";
    ClickHouseEventType["ALL_VIDEO_DISABLED"] = "AllVideoDisabled";
    ClickHouseEventType["USER_VIDEO_DISABLED"] = "UserVideoDisabled";
    ClickHouseEventType["ALL_SCREEN_SHARING_DISABLED"] = "AllScreenSharingDisabled";
    ClickHouseEventType["USER_SCREEN_SHARING_DISABLED"] = "UserScreenSharingDisabled";
    ClickHouseEventType["ALL_WATCH_TOGETHER_DISABLED"] = "AllWatchTogetherDisabled";
    ClickHouseEventType["USER_WATCH_TOGETHER_DISABLED"] = "UserWatchTogetherDisabled";
    ClickHouseEventType["MIC_OFF_WHILE_TALKING_ALERT"] = "MicOffWhileTalkingAlert";
    ClickHouseEventType["MIC_OFF_WHILE_TALKING_ENABLE_CLICK"] = "MicOffWhileTalkingEnableClick";
    ClickHouseEventType["VIDEO_DISABLED_DUE_TO_BAD_CONNECTION_ALERT"] = "VideoDisabledDueToBadConnectionAlert";
    ClickHouseEventType["ALL_MICS_AND_VIDEO_DISABLED"] = "AllMicsAndVideoDisabled";
    ClickHouseEventType["USER_MICS_AND_VIDEO_DISABLED"] = "UserMicsAndVideoDisabled";
    ClickHouseEventType["ALL_HAND_LOWERED"] = "AllHandsLowered";
    ClickHouseEventType["USER_HAND_LOWERED"] = "UserHandLowered";
    ClickHouseEventType["ASK_ALL_TO_UNMUTE"] = "AskAllToUnmute";
    ClickHouseEventType["ASK_USER_TO_UNMUTE"] = "AskUserToUnmute";
    ClickHouseEventType["ASSIGN_ADMIN"] = "AssignAdmin";
    ClickHouseEventType["RETRIEVE_ADMIN"] = "RetrieveAdmin";
    ClickHouseEventType["ADMIN_PIN"] = "AdminPin";
    ClickHouseEventType["ADMIN_UNPIN"] = "AdminUnpin";
    ClickHouseEventType["VIRTUAL_BACKGROUND_SELECTED"] = "VirtualBackgroundSelected";
    ClickHouseEventType["VIRTUAL_BACKGROUND_DISABLED"] = "VirtualBackgroundDisabled";
    ClickHouseEventType["CUSTOM_VIRTUAL_BACKGROUND_SELECTED"] = "CustomVirtualBackgroundSelected";
    ClickHouseEventType["CUSTOM_VIRTUAL_BACKGROUND_ADDED"] = "CustomVirtualBackgroundAdded";
    ClickHouseEventType["CUSTOM_VIRTUAL_BACKGROUND_DELETED"] = "CustomVirtualBackgroundDeleted";
    ClickHouseEventType["CUSTOM_VIRTUAL_BACKGROUND_DISABLED"] = "CustomVirtualBackgroundDisabled";
    ClickHouseEventType["CALL_SCHEDULED"] = "CallScheduled";
    ClickHouseEventType["SCHEDULED_CALL_EDITED"] = "ScheduledCallEdited";
    ClickHouseEventType["SCHEDULED_CALL_LIVE_STARTED"] = "ScheduledCallLiveStarted";
    /** постановка реакций в звонке разрешена (включили свич) */
    ClickHouseEventType["REACTION_ENABLED"] = "ReactionEnabled";
    /** постановка реакций в звонке запрещена (выключили свич) */
    ClickHouseEventType["REACTION_DISABLED"] = "ReactionDisabled";
    /** юзер кликнул на реакцию, при этом передать параметр `reaction_type` (строки: `heart`, `like`, `dislike`, `laugh`, `tears`) */
    ClickHouseEventType["REACTION_SENT"] = "ReactionSent";
    ClickHouseEventType["CALL_WATCH_TOGETHER_CLICK"] = "CallWatchTogetherClick";
    ClickHouseEventType["CALL_WATCH_TOGETHER_STARTED"] = "CallWatchTogetherStarted";
    ClickHouseEventType["CALL_WATCH_TOGETHER_STOPPED"] = "CallWatchTogetherStopped";
    /** пользователь запросил помощь у админа */
    ClickHouseEventType["SESSION_ROOMS_ASK_FOR_HELP"] = "SessionRoomsAskForHelp";
    /** пользователь перешел в зал, при возвращении в основной зал этот ивент отсылать не нужно */
    ClickHouseEventType["SESSION_ROOMS_USER_MOVED"] = "SessionRoomsUserMoved";
    /** пользователь покинул СЗ и вышел в основной зал или сразу вышел из СЗ И всего звонка */
    ClickHouseEventType["SESSION_ROOMS_USER_LEFT"] = "SessionRoomsUserLeft";
    /** админ распределил автоматически по СЗ */
    ClickHouseEventType["SESSION_ROOMS_AUTO_ALLOCATION"] = "SessionRoomsAutoAllocation";
    /** админ распределил вручную по СЗ */
    ClickHouseEventType["SESSION_ROOMS_MANUAL_ALLOCATION"] = "SessionRoomsManualAllocation";
    /** СЗ открыты + количество залов (hall_count) */
    ClickHouseEventType["SESSION_ROOMS_OPENED"] = "SessionRoomsOpened";
    /** СЗ закрыты  */
    ClickHouseEventType["SESSION_ROOMS_CLOSED"] = "SessionRoomsClosed";
    /** пользователю не отображается лендос экрана присоединения */
    ClickHouseEventType["SKIP_DESKTOP_JOIN_SCREEN"] = "SkipDesktopJoinScreen";
    /** пользователь кликнул на пункт меню настроек Vmoji */
    ClickHouseEventType["CALL_VMOJI_CLICK"] = "CallVmojiClick";
    /** получена ошибка при рендеринге Vmoji */
    ClickHouseEventType["CALL_VMOJI_START_FAILED"] = "CallVmojiStartFailed";
    /** Vmoji пользователя применился в звонке и началась отправка точек */
    ClickHouseEventType["CALL_VMOJI_STARTED"] = "CallVmojiStarted";
    /** пользователь отключил свой Vmoji и передачу точек */
    ClickHouseEventType["CALL_VMOJI_STOPPED"] = "CallVmojiStopped";
    /** замер времени отрисовки Vmoji кадра */
    ClickHouseEventType["CALL_VMOJI_BENCHMARK"] = "CallVmojiBenchmark";
    ClickHouseEventType["MIC_ENABLED"] = "MicEnabled";
    ClickHouseEventType["MIC_DISABLED"] = "MicDisabled";
    ClickHouseEventType["OPEN_CHAT"] = "OpenChat";
    ClickHouseEventType["NAME_CHANGED_BY_USER"] = "NameChangedByUser";
    ClickHouseEventType["NAME_CHANGED_BY_ANONYM"] = "NameChangedByAnonym";
    ClickHouseEventType["NAME_CHANGED_BY_ADMIN"] = "NameChangedByAdmin";
    ClickHouseEventType["NAME_CHANGED_BY_COMMUNITY"] = "NameChangedByCommunity";
    ClickHouseEventType["TRANSCRIPTION_STARTED"] = "TranscriptionStarted";
    ClickHouseEventType["TRANSCRIPTION_STOPPED"] = "TranscriptionStopped";
    ClickHouseEventType["SCREEN_SHARE_NOT_VISIBLE"] = "ScreenShareNotVisible";
    ClickHouseEventType["CALL_COLLAPSED"] = "CallCollapsed";
    ClickHouseEventType["CALL_MISSED_NOTIFICATION"] = "CallMissedNotification";
    ClickHouseEventType["SCREEN_ZOOMED"] = "ScreenZoomed";
    /** Пользователь кликнул на кнопку открытия интерактивной доски */
    ClickHouseEventType["WHITE_BOARD_STARTED"] = "WhiteBoardStarted";
    /** Пользователь выбрал доску для шаринга (Click из-за легаси на другой платформе) */
    ClickHouseEventType["WHITE_BOARD_VIEW_STARTED"] = "WhiteBoardViewClick";
    /** Пользователь остановил шаринг доски */
    ClickHouseEventType["WHITE_BOARD_VIEW_STOPPED"] = "WhiteBoardViewStopped";
    /** Пользователь отключил миниапп интерактивной доски */
    ClickHouseEventType["WHITE_BOARD_STOPPED"] = "WhiteBoardStopped";
    ClickHouseEventType["ONLINE_TRANSCRIPTION_STARTED"] = "OnlineTranscriptionStarted";
    ClickHouseEventType["ONLINE_TRANSCRIPTION_STOPPED"] = "OnlineTranscriptionStopped";
    ClickHouseEventType["WAITING_ROOM_DISABLED"] = "WaitingRoomDisabled";
    ClickHouseEventType["WAITING_ROOM_ENABLED"] = "WaitingRoomEnabled";
    ClickHouseEventType["CALL_STREAMING_CLICK"] = "CallStreamingClick";
    ClickHouseEventType["CALL_STREAMING_START_FAILED"] = "CallStreamingStartFailed";
    ClickHouseEventType["CALL_STREAMING_STARTED"] = "CallStreamingStarted";
    ClickHouseEventType["CALL_STREAMING_STOPPED"] = "CallStreamingStopped";
    ClickHouseEventType["CALL_RECORDING_CLICK"] = "CallRecordingClick";
    ClickHouseEventType["CALL_RECORDING_START_FAILED"] = "CallRecordingStartFailed";
    ClickHouseEventType["CALL_RECORDING_STARTED"] = "CallRecordingStarted";
    ClickHouseEventType["CALL_RECORDING_STOPPED"] = "CallRecordingStopped";
    ClickHouseEventType["CURRENT_USER_BAD_CONNECTION_ALERT"] = "CurrentUserBadConnectionAlert";
    ClickHouseEventType["DOWNLOAD_PARTICIPANTS_LIST_CLICK"] = "DownloadParticipantsListClick";
    ClickHouseEventType["CONTACT_JOINED"] = "ContactJoined";
    ClickHouseEventType["CONTACT_DEANONIMIZED"] = "ContactDeanonimized";
    ClickHouseEventType["VIDEO_SUSPEND_MODE"] = "VideoSuspendMode";
    ClickHouseEventType["CALL_PREVIEW_CAMERA_ENABLED"] = "CallPreviewCameraEnabled";
    ClickHouseEventType["CALL_PREVIEW_MIC_ENABLED"] = "CallPreviewMicEnabled";
    ClickHouseEventType["CALL_PREVIEW_CAMERA_DISABLED"] = "CallPreviewCameraDisabled";
    ClickHouseEventType["CALL_PREVIEW_MIC_DISABLED"] = "CallPreviewMicDisabled";
    ClickHouseEventType["CALL_PREVIEW_DOWNLOAD_APP_CLICK"] = "CallPreviewDownloadAppClick";
    ClickHouseEventType["CALL_PREVIEW_DESKTOP_APP_JOIN_CLICK"] = "CallPreviewDesktopAppJoinClick";
    ClickHouseEventType["CALL_PREVIEW_DEVICE_CHANGE_CAM_CLICK"] = "CallPreviewDeviceChangeCamClick";
    ClickHouseEventType["CALL_PREVIEW_DEVICE_CHANGE_MIC_CLICK"] = "CallPreviewDeviceChangeMicClick";
    ClickHouseEventType["CALL_PREVIEW_MODAL_CLOSED"] = "CallPreviewModalClosed";
    ClickHouseEventType["CALL_PREVIEW_SKIP_JOIN_SCREEN_CLICK"] = "CallPreviewSkipDesktopJoinScreenClick";
    ClickHouseEventType["CALL_LINK_QR_CODE_CLICK"] = "CallLinkQrCodeClick";
    ClickHouseEventType["CALL_LINK_QR_CODE_SHARED"] = "CallLinkQrCodeShared";
    ClickHouseEventType["CALL_LINK_QR_CODE_DOWNLOAD"] = "CallLinkQrCodeDownload";
    ClickHouseEventType["RECORD_HISTORY_OPENED"] = "RecordHistoryOpened";
    ClickHouseEventType["RECORD_HISTORY_VIDEO_OPENED"] = "RecordHistoryVideoOpened";
    ClickHouseEventType["SESSION_ROOMS_MESSAGE_SENT"] = "SessionRoomsMessageSent";
    ClickHouseEventType["SESSION_ROOMS_TIMER_ENABLED"] = "SessionRoomsTimerEnabled";
    ClickHouseEventType["SESSION_ROOMS_CLOSED_USING_TIMER"] = "SessionRoomsClosedUsingTimer";
    // запуск массовой очистки
    ClickHouseEventType["CALL_HISTORY_DELETE_ALL"] = "CallHistoryDeleteAll";
    //  запуск удаление еденичной записи
    ClickHouseEventType["CALL_HISTORY_DELETE_SINGLE"] = "CallHistoryDeleteSingle";
    // запуск выборочной очистки
    ClickHouseEventType["CALL_HISTORY_DELETE_SELECTED"] = "CallHistoryDeleteSelected";
    // добавляем участника в звонок с чатом
    ClickHouseEventType["CALL_ADD_PARTICIPANT_WITH_CHAT"] = "AddParticipantWithChat";
    // reason: ‘call_menu’, ‘create’, ‘link_settings’
    ClickHouseEventType["CALL_CHAT_HISTORY_TOGGLED"] = "CallChatHistoryToggled";
    ClickHouseEventType["USER_REMOVED"] = "UserRemoved";
})(ClickHouseEventType || (ClickHouseEventType = {}));
export var CallStatMuteType;
(function (CallStatMuteType) {
    CallStatMuteType[CallStatMuteType["ONCE"] = 0] = "ONCE";
    CallStatMuteType[CallStatMuteType["PERMANENT"] = 1] = "PERMANENT";
})(CallStatMuteType || (CallStatMuteType = {}));
export var CallStatScreen;
(function (CallStatScreen) {
    CallStatScreen["ParticipantsManager"] = "participants_manager";
})(CallStatScreen || (CallStatScreen = {}));
//# sourceMappingURL=clickHouse.js.map