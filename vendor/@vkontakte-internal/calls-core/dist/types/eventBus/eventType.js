/**
 * Для удобства добавлена страница в документации
 * {@link https://confluence.mvk.com/display/CALLS/Calls+EventBus}
 */
export var CallsEventType;
(function (CallsEventType) {
    CallsEventType["DEVICE_CHANGED"] = "device_changed";
    /**
     * Изменение уровня громкость сигнала со своего микрофона
     */
    CallsEventType["LOCAL_MICROPHONE_VOLUME_CHANGED"] = "local_microphone_volume_changed";
    CallsEventType["NAME_CHANGED"] = "name_changed";
    CallsEventType["REMOTE_REMOVED"] = "remote_removed";
    CallsEventType["REMOTE_STATUS_CHANGED"] = "remote_status_changed";
    // events from eventHandlers (removed)
    CallsEventType["SCREEN_SHARING_ENABLED"] = "screen_sharing_enabled";
    CallsEventType["SCREEN_SHARING_DISABLED"] = "screen_sharing_disabled";
    CallsEventType["ERROR_START_CALL"] = "error_start_call";
    CallsEventType["HAND_COUNT_CHANGED"] = "hand_count_changed";
    CallsEventType["SUCCESS_FEEDBACK"] = "success_feedback";
    CallsEventType["MISSING_CALL"] = "missing_call";
    CallsEventType["ERROR"] = "error";
    CallsEventType["FATAL_ERROR"] = "fatal_error";
    CallsEventType["HANGUP"] = "hangup";
    // events for external usage
    /** Исходящий звонок принят */
    CallsEventType["OUTGOING_CALL_ACCEPTED"] = "outgoing_call_accepted";
    /** Исходящий звонок отклонен */
    CallsEventType["OUTGOING_CALL_DECLINED"] = "outgoing_call_declined";
    /** Входящий звонок принят */
    CallsEventType["INCOMING_CALL_ACCEPTED"] = "incoming_call_accepted";
    /** Входящий звонок отклонен */
    CallsEventType["INCOMING_CALL_DECLINED"] = "incoming_call_declined";
    /** Начата демонстрация экрана */
    CallsEventType["SCREEN_SHARING_STARTED"] = "screen_sharing_started";
    /** Завершена демонстрация экрана */
    CallsEventType["SCREEN_SHARING_STOPPED"] = "screen_sharing_stopped";
    /** Ззвонок завершен локальным пользователем */
    CallsEventType["CALL_FINISHED_LOCALLY"] = "call_finished_locally";
    /** Звонок завершен удаленным пользователем */
    CallsEventType["CALL_FINISHED_REMOTELY"] = "call_finished_remotely";
    /** При p2p звонке неважно, кто первый положил трубку */
    CallsEventType["CALL_FINISHED"] = "call_finished";
    /** Момент начала звонка, любого */
    CallsEventType["CALL_STARTED"] = "call_started";
    /** Звонок свернут */
    CallsEventType["LAYOUT_COLLAPSED"] = "layout_collapsed";
    /** Звонок развернут на весь экран */
    CallsEventType["LAYOUT_FULLSCREEN"] = "layout_fullscreen";
    /** Звонок перешел в обычный режим (не fullscreen и не Collapsed) */
    CallsEventType["LAYOUT_NORMAL"] = "layout_normal";
    /** Входящий звонок отменен удаленным пользователем */
    CallsEventType["INCOMING_CALL_CANCELED"] = "incoming_call_canceled";
    /** Исходящий звонок отменен локальным пользователем */
    CallsEventType["OUTGOING_CALL_CANCELED"] = "outgoing_call_canceled";
    /** Модальное окно истории звонков закрыто кем-либо */
    CallsEventType["HISTORY_MODAL_CLOSED"] = "history_modal_closed";
    CallsEventType["OPEN_HISTORY_MODAL"] = "open_history_modal";
    /**
     * Поступил входящий звонок
     */
    CallsEventType["INCOMING_CALL_STARTED"] = "incoming_call_started";
    /**
     * Входяший звонок был принят на другом устройстве
     */
    CallsEventType["INCOMING_CALL_ACCEPTED_ON_ANOTHER_DEVICE"] = "incoming_call_accepted_on_another_device";
    /**
     * Участник зашел в звонок с другого устройства
     */
    CallsEventType["CALL_ENTERING_ON_ANOTHER_DEVICE"] = "call_entering_on_another_device";
    /**
     * Участник был исключен из звонка админом, с правом переподключения
     */
    CallsEventType["PARTICIPANT_WAS_KICKED_FROM_CALL"] = "participant_was_kicked_from_call";
    /**
     * Участник был исключен из звонка админом, без права переподключения
     */
    CallsEventType["PARTICIPANT_WAS_BLOCKED_IN_CALL"] = "participant_was_blocked_in_call";
})(CallsEventType || (CallsEventType = {}));
// TODO удалить после правки в static/js/modules/web/messenger/reforged/env/Calls.ts::subscribe
export const eventHandlersToEventBusMap = {
    onOutgoingCallAccepted: CallsEventType.OUTGOING_CALL_ACCEPTED,
    onOutgoingCallDeclined: CallsEventType.OUTGOING_CALL_DECLINED,
    onIncomingCallAccepted: CallsEventType.INCOMING_CALL_ACCEPTED,
    onIncomingCallDeclined: CallsEventType.INCOMING_CALL_DECLINED,
    onScreenSharingStarted: CallsEventType.SCREEN_SHARING_STARTED,
    onScreenSharingStopped: CallsEventType.SCREEN_SHARING_STOPPED,
    onCallFinishedLocally: CallsEventType.CALL_FINISHED_LOCALLY,
    onCallFinishedRemotely: CallsEventType.CALL_FINISHED_REMOTELY,
    onCallFinished: CallsEventType.CALL_FINISHED,
    onCallStarted: CallsEventType.CALL_STARTED,
    onLayoutCollapsed: CallsEventType.LAYOUT_COLLAPSED,
    onLayoutFullscreen: CallsEventType.LAYOUT_FULLSCREEN,
    onLayoutNormal: CallsEventType.LAYOUT_NORMAL,
    onIncomingCallCanceled: CallsEventType.INCOMING_CALL_CANCELED,
    onOutgoingCallCanceled: CallsEventType.OUTGOING_CALL_CANCELED,
    onHistoryModalClosed: CallsEventType.HISTORY_MODAL_CLOSED,
    onIncomingCallStarted: CallsEventType.INCOMING_CALL_STARTED,
    onIncomingCallAcceptedOnAnotherDevice: CallsEventType.INCOMING_CALL_ACCEPTED_ON_ANOTHER_DEVICE,
    onCallEnteringOnAnotherDevice: CallsEventType.CALL_ENTERING_ON_ANOTHER_DEVICE,
    onParticipantWasKickedFromCall: CallsEventType.PARTICIPANT_WAS_KICKED_FROM_CALL,
    onParticipantWasBlockedInCall: CallsEventType.PARTICIPANT_WAS_BLOCKED_IN_CALL,
};
//# sourceMappingURL=eventType.js.map