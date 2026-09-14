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
export var CallEventType;
(function (CallEventType) {
    CallEventType["OUTGOING_CALL_STARTED_VIDEO"] = "OutgoingCallStartedVideo";
    CallEventType["OUTGOING_CALL_STARTED_AUDIO"] = "OutgoingCallStartedAudio";
    CallEventType["OUTGOING_CALL_ADD_PARTICIPANTS_SENT"] = "OutgoingCallAddParticipantsSent";
    CallEventType["OUTGOING_CALL_REMOTE_RINGING"] = "OutgoingCallRemoteRinging";
    CallEventType["OUTGOING_CALL_ACCEPTED_REMOTELY"] = "OutgoingCallAcceptedRemotely";
    CallEventType["OUTGOING_CALL_FAILED"] = "OutgoingCallFailed";
    CallEventType["OUTGOING_CALL_COMPLETED"] = "OutgoingCallCompleted";
    CallEventType["INCOMING_CALL_RECEIVED"] = "IncomingCallReceived";
    CallEventType["INCOMING_CALL_ACCEPTED"] = "IncomingCallAccepted";
    CallEventType["INCOMING_CALL_FAILED"] = "IncomingCallFailed";
    CallEventType["CALL_DECLINED_OR_HANGED_LOCALLY"] = "CallDeclinedOrHangedLocally";
    CallEventType["CALL_DECLINED_OR_HANGED_REMOTELY"] = "CallDeclinedOrHangedRemotely";
    CallEventType["CALL_CONNECTED"] = "CallConnected";
    CallEventType["CALL_DISCONNECTED"] = "CallDisconnected";
    CallEventType["VIDEO_ENABLED"] = "VideoEnabled";
    CallEventType["VIDEO_SETTINGS"] = "VideoSettings";
    CallEventType["VIDEO_DISABLED"] = "VideoDisabled";
    CallEventType["RELAY_CONNECTION_ESTABLISHED"] = "RelayConnectionEstablished";
    CallEventType["USER_FEEDBACK_RECEIVED"] = "UserFeedbackReceived";
    CallEventType["SYSTEM_STAT"] = "SystemStat";
    CallEventType["GROUP_CALL_JOINED"] = "GroupCallJoined";
    CallEventType["GROUP_CALL_JOIN_FAILED"] = "GroupCallJoinFailed";
    CallEventType["HAND_RAISED"] = "HandRaised";
    CallEventType["HAND_LOWERED"] = "HandLowered";
    CallEventType["SCREEN_SHARING_STARTED"] = "ScreenSharingStarted";
    CallEventType["SCREEN_SHARING_STOPPED"] = "ScreenSharingStopped";
    CallEventType["AUDIO_SHARING_STARTED"] = "AudioSharingStarted";
    CallEventType["ALL_MICS_DISABLED"] = "AllMicsDisabled";
    CallEventType["USER_MICS_DISABLED"] = "UserMicsDisabled";
    CallEventType["ALL_VIDEO_DISABLED"] = "AllVideoDisabled";
    CallEventType["USER_VIDEO_DISABLED"] = "UserVideoDisabled";
    CallEventType["ALL_SCREEN_SHARING_DISABLED"] = "AllScreenSharingDisabled";
    CallEventType["USER_SCREEN_SHARING_DISABLED"] = "UserScreenSharingDisabled";
    CallEventType["ALL_WATCH_TOGETHER_DISABLED"] = "AllWatchTogetherDisabled";
    CallEventType["USER_WATCH_TOGETHER_DISABLED"] = "UserWatchTogetherDisabled";
    CallEventType["MIC_OFF_WHILE_TALKING_ALERT"] = "MicOffWhileTalkingAlert";
    CallEventType["MIC_OFF_WHILE_TALKING_ENABLE_CLICK"] = "MicOffWhileTalkingEnableClick";
    CallEventType["VIDEO_DISABLED_DUE_TO_BAD_CONNECTION_ALERT"] = "VideoDisabledDueToBadConnectionAlert";
    CallEventType["ALL_MICS_AND_VIDEO_DISABLED"] = "AllMicsAndVideoDisabled";
    CallEventType["USER_MICS_AND_VIDEO_DISABLED"] = "UserMicsAndVideoDisabled";
    CallEventType["ALL_HAND_LOWERED"] = "AllHandsLowered";
    CallEventType["USER_HAND_LOWERED"] = "UserHandLowered";
    CallEventType["ASK_ALL_TO_UNMUTE"] = "AskAllToUnmute";
    CallEventType["ASK_USER_TO_UNMUTE"] = "AskUserToUnmute";
    CallEventType["ASSIGN_ADMIN"] = "AssignAdmin";
    CallEventType["RETRIEVE_ADMIN"] = "RetrieveAdmin";
    CallEventType["ADMIN_PIN"] = "AdminPin";
    CallEventType["ADMIN_UNPIN"] = "AdminUnpin";
    CallEventType["VIRTUAL_BACKGROUND_SELECTED"] = "VirtualBackgroundSelected";
    CallEventType["VIRTUAL_BACKGROUND_DISABLED"] = "VirtualBackgroundDisabled";
    CallEventType["CUSTOM_VIRTUAL_BACKGROUND_SELECTED"] = "CustomVirtualBackgroundSelected";
    CallEventType["CUSTOM_VIRTUAL_BACKGROUND_ADDED"] = "CustomVirtualBackgroundAdded";
    CallEventType["CUSTOM_VIRTUAL_BACKGROUND_DELETED"] = "CustomVirtualBackgroundDeleted";
    CallEventType["CUSTOM_VIRTUAL_BACKGROUND_DISABLED"] = "CustomVirtualBackgroundDisabled";
    CallEventType["CALL_SCHEDULED"] = "CallScheduled";
    CallEventType["SCHEDULED_CALL_EDITED"] = "ScheduledCallEdited";
    CallEventType["SCHEDULED_CALL_LIVE_STARTED"] = "ScheduledCallLiveStarted";
    /** постановка реакций в звонке разрешена (включили свич) */
    CallEventType["REACTION_ENABLED"] = "ReactionEnabled";
    /** постановка реакций в звонке запрещена (выключили свич) */
    CallEventType["REACTION_DISABLED"] = "ReactionDisabled";
    /** юзер кликнул на реакцию, при этом передать параметр `reaction_type` (строки: `heart`, `like`, `dislike`, `laugh`, `tears`) */
    CallEventType["REACTION_SENT"] = "ReactionSent";
    CallEventType["CALL_WATCH_TOGETHER_CLICK"] = "CallWatchTogetherClick";
    CallEventType["CALL_WATCH_TOGETHER_STARTED"] = "CallWatchTogetherStarted";
    CallEventType["CALL_WATCH_TOGETHER_STOPPED"] = "CallWatchTogetherStopped";
    /** пользователь запросил помощь у админа */
    CallEventType["SESSION_ROOMS_ASK_FOR_HELP"] = "SessionRoomsAskForHelp";
    /** пользователь перешел в зал, при возвращении в основной зал этот ивент отсылать не нужно */
    CallEventType["SESSION_ROOMS_USER_MOVED"] = "SessionRoomsUserMoved";
    /** пользователь покинул СЗ и вышел в основной зал или сразу вышел из СЗ И всего звонка */
    CallEventType["SESSION_ROOMS_USER_LEFT"] = "SessionRoomsUserLeft";
    /** админ распределил автоматически по СЗ */
    CallEventType["SESSION_ROOMS_AUTO_ALLOCATION"] = "SessionRoomsAutoAllocation";
    /** админ распределил вручную по СЗ */
    CallEventType["SESSION_ROOMS_MANUAL_ALLOCATION"] = "SessionRoomsManualAllocation";
    /** СЗ открыты + количество залов (hall_count) */
    CallEventType["SESSION_ROOMS_OPENED"] = "SessionRoomsOpened";
    /** СЗ закрыты  */
    CallEventType["SESSION_ROOMS_CLOSED"] = "SessionRoomsClosed";
    /** пользователю не отображается лендос экрана присоединения */
    CallEventType["SKIP_DESKTOP_JOIN_SCREEN"] = "SkipDesktopJoinScreen";
    /** пользователь кликнул на пункт меню настроек Vmoji */
    CallEventType["CALL_VMOJI_CLICK"] = "CallVmojiClick";
    /** получена ошибка при рендеринге Vmoji */
    CallEventType["CALL_VMOJI_START_FAILED"] = "CallVmojiStartFailed";
    /** Vmoji пользователя применился в звонке и началась отправка точек */
    CallEventType["CALL_VMOJI_STARTED"] = "CallVmojiStarted";
    /** пользователь отключил свой Vmoji и передачу точек */
    CallEventType["CALL_VMOJI_STOPPED"] = "CallVmojiStopped";
    /** замер времени отрисовки Vmoji кадра */
    CallEventType["CALL_VMOJI_BENCHMARK"] = "CallVmojiBenchmark";
    CallEventType["MIC_ENABLED"] = "MicEnabled";
    CallEventType["MIC_DISABLED"] = "MicDisabled";
    CallEventType["OPEN_CHAT"] = "OpenChat";
    CallEventType["NAME_CHANGED_BY_USER"] = "NameChangedByUser";
    CallEventType["NAME_CHANGED_BY_ANONYM"] = "NameChangedByAnonym";
    CallEventType["NAME_CHANGED_BY_ADMIN"] = "NameChangedByAdmin";
    CallEventType["NAME_CHANGED_BY_COMMUNITY"] = "NameChangedByCommunity";
    CallEventType["TRANSCRIPTION_STARTED"] = "TranscriptionStarted";
    CallEventType["TRANSCRIPTION_STOPPED"] = "TranscriptionStopped";
    CallEventType["SCREEN_SHARE_NOT_VISIBLE"] = "ScreenShareNotVisible";
    CallEventType["CALL_COLLAPSED"] = "CallCollapsed";
    CallEventType["CALL_MISSED_NOTIFICATION"] = "CallMissedNotification";
    CallEventType["SCREEN_ZOOMED"] = "ScreenZoomed";
    /** Пользователь кликнул на кнопку открытия интерактивной доски */
    CallEventType["WHITE_BOARD_STARTED"] = "WhiteBoardStarted";
    /** Пользователь выбрал доску для шаринга (Click из-за легаси на другой платформе) */
    CallEventType["WHITE_BOARD_VIEW_STARTED"] = "WhiteBoardViewClick";
    /** Пользователь остановил шаринг доски */
    CallEventType["WHITE_BOARD_VIEW_STOPPED"] = "WhiteBoardViewStopped";
    /** Пользователь отключил миниапп интерактивной доски */
    CallEventType["WHITE_BOARD_STOPPED"] = "WhiteBoardStopped";
    CallEventType["ONLINE_TRANSCRIPTION_STARTED"] = "OnlineTranscriptionStarted";
    CallEventType["ONLINE_TRANSCRIPTION_STOPPED"] = "OnlineTranscriptionStopped";
    CallEventType["WAITING_ROOM_DISABLED"] = "WaitingRoomDisabled";
    CallEventType["WAITING_ROOM_ENABLED"] = "WaitingRoomEnabled";
    CallEventType["CALL_STREAMING_CLICK"] = "CallStreamingClick";
    CallEventType["CALL_STREAMING_START_FAILED"] = "CallStreamingStartFailed";
    CallEventType["CALL_STREAMING_STARTED"] = "CallStreamingStarted";
    CallEventType["CALL_STREAMING_STOPPED"] = "CallStreamingStopped";
    CallEventType["CALL_RECORDING_CLICK"] = "CallRecordingClick";
    CallEventType["CALL_RECORDING_START_FAILED"] = "CallRecordingStartFailed";
    CallEventType["CALL_RECORDING_STARTED"] = "CallRecordingStarted";
    CallEventType["CALL_RECORDING_STOPPED"] = "CallRecordingStopped";
    CallEventType["CURRENT_USER_BAD_CONNECTION_ALERT"] = "CurrentUserBadConnectionAlert";
    CallEventType["DOWNLOAD_PARTICIPANTS_LIST_CLICK"] = "DownloadParticipantsListClick";
    CallEventType["CONTACT_JOINED"] = "ContactJoined";
    CallEventType["CONTACT_DEANONIMIZED"] = "ContactDeanonimized";
    CallEventType["VIDEO_SUSPEND_MODE"] = "VideoSuspendMode";
    CallEventType["CALL_PREVIEW_CAMERA_ENABLED"] = "CallPreviewCameraEnabled";
    CallEventType["CALL_PREVIEW_MIC_ENABLED"] = "CallPreviewMicEnabled";
    CallEventType["CALL_PREVIEW_CAMERA_DISABLED"] = "CallPreviewCameraDisabled";
    CallEventType["CALL_PREVIEW_MIC_DISABLED"] = "CallPreviewMicDisabled";
    CallEventType["CALL_PREVIEW_DOWNLOAD_APP_CLICK"] = "CallPreviewDownloadAppClick";
    CallEventType["CALL_PREVIEW_DESKTOP_APP_JOIN_CLICK"] = "CallPreviewDesktopAppJoinClick";
    CallEventType["CALL_PREVIEW_DEVICE_CHANGE_CAM_CLICK"] = "CallPreviewDeviceChangeCamClick";
    CallEventType["CALL_PREVIEW_DEVICE_CHANGE_MIC_CLICK"] = "CallPreviewDeviceChangeMicClick";
    CallEventType["CALL_PREVIEW_MODAL_CLOSED"] = "CallPreviewModalClosed";
    CallEventType["CALL_PREVIEW_SKIP_JOIN_SCREEN_CLICK"] = "CallPreviewSkipDesktopJoinScreenClick";
    CallEventType["CALL_LINK_QR_CODE_CLICK"] = "CallLinkQrCodeClick";
    CallEventType["CALL_LINK_QR_CODE_SHARED"] = "CallLinkQrCodeShared";
    CallEventType["CALL_LINK_QR_CODE_DOWNLOAD"] = "CallLinkQrCodeDownload";
    CallEventType["RECORD_HISTORY_OPENED"] = "RecordHistoryOpened";
    CallEventType["RECORD_HISTORY_VIDEO_OPENED"] = "RecordHistoryVideoOpened";
    CallEventType["SESSION_ROOMS_MESSAGE_SENT"] = "SessionRoomsMessageSent";
    CallEventType["SESSION_ROOMS_TIMER_ENABLED"] = "SessionRoomsTimerEnabled";
    CallEventType["SESSION_ROOMS_CLOSED_USING_TIMER"] = "SessionRoomsClosedUsingTimer";
    // запуск массовой очистки
    CallEventType["CALL_HISTORY_DELETE_ALL"] = "CallHistoryDeleteAll";
    //  запуск удаление еденичной записи
    CallEventType["CALL_HISTORY_DELETE_SINGLE"] = "CallHistoryDeleteSingle";
    // запуск выборочной очистки
    CallEventType["CALL_HISTORY_DELETE_SELECTED"] = "CallHistoryDeleteSelected";
    // добавляем участника в звонок с чатом
    CallEventType["CALL_ADD_PARTICIPANT_WITH_CHAT"] = "AddParticipantWithChat";
    // reason: ‘call_menu’, ‘create’, ‘link_settings’
    CallEventType["CALL_CHAT_HISTORY_TOGGLED"] = "CallChatHistoryToggled";
    CallEventType["USER_REMOVED"] = "UserRemoved";
})(CallEventType || (CallEventType = {}));
export var CallStatMuteType;
(function (CallStatMuteType) {
    CallStatMuteType[CallStatMuteType["ONCE"] = 0] = "ONCE";
    CallStatMuteType[CallStatMuteType["PERMANENT"] = 1] = "PERMANENT";
})(CallStatMuteType || (CallStatMuteType = {}));
export var CallStatScreen;
(function (CallStatScreen) {
    CallStatScreen["ParticipantsManager"] = "participants_manager";
})(CallStatScreen || (CallStatScreen = {}));
//# sourceMappingURL=calls.js.map