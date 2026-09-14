import { __decorate, __metadata } from "tslib";
import { CallsEventType, EMPTY_PEER_ID, ECallLongpollType, Mode, vkIdToPeerId, } from '@vkontakte-internal/calls-core';
import { scope } from '@vkontakte-internal/di';
import { CallsApi, Langs } from '@vkontakte-internal/plugins';
import { DebugMessageType } from '@vkontakte/calls-sdk';
import { decodeHTMLEntities } from '@vkontakte/vkjs';
import { loadCallPeersWithoutWaitingImagesAction, setActiveCallData, setShowChatHistory, } from '../../actions/actions';
import { handlePromiseError } from '../../helpers/logger';
import { StateBridge } from '../../utils/stateBridge';
import { CallType, E_ACTION } from '../../constants';
import { convertCallerFromLongpoll, convertChatFromLongpoll, convertServerData, getErrorCode, getVkIdFromLongpoll, isGroupCallEvent, } from '../../helpers/helpers';
import { isParticipantContact, isParticipantGroup } from '../../helpers/participant';
import { ClickHouseEventType, sendStats } from '../../stats/clickHouse';
import { getContactCallToken, getConversationByCall } from '../backend';
import { getDefaultConversation } from '../../helpers/call';
import { callStatDataStorage } from '../../stats/callStatDataStorage';
import { RoomsService } from '../../features/rooms';
import { CallsConfigService } from '../config';
import { preloadImage } from '../dom';
import { eventBus } from '../eventBus';
import { fetchCallTokenWithApiBaseUrl } from '../fetchCallTokenWithApiBaseUrl';
import { CallsSdkService } from '../sdk';
import { isAcceptableIncomingCall } from './utils';
import { ParticipantsService } from '../participants';
import { PinnedParticipantService } from '../PinnedParticipantService';
let CallsQueueProcessor = class CallsQueueProcessor {
};
CallsQueueProcessor = __decorate([
    scope.container({ abstract: true })
], CallsQueueProcessor);
export { CallsQueueProcessor };
export const createCallsQueueProcessorImplementation = (legacyBridge) => {
    let CallsQueueProcessorImpl = class CallsQueueProcessorImpl {
        constructor(callsApi, configService, langs, roomsService, sdkService, stateBridge, pinnedParticipantService, participantsService) {
            this.callsApi = callsApi;
            this.configService = configService;
            this.langs = langs;
            this.roomsService = roomsService;
            this.sdkService = sdkService;
            this.stateBridge = stateBridge;
            this.pinnedParticipantService = pinnedParticipantService;
            this.participantsService = participantsService;
            this.handleQueueEvent = (event) => {
                legacyBridge.dispatchQueueEvent(event.data);
                switch (event.data.type) {
                    case ECallLongpollType.CurrentCallsUpdate:
                        break;
                    case ECallLongpollType.ScheduledCallsUpdate:
                        break;
                    case ECallLongpollType.ChatInfoUpdated:
                        this.handleChatInfoUpdated(event.data);
                        break;
                    case ECallLongpollType.IncomingCall:
                        this.handleIncomingCall(event.data);
                        break;
                    case ECallLongpollType.CallAccepted:
                    case ECallLongpollType.CallFinished: {
                        this.handleCallFinishedOrAccepted(event.data);
                        break;
                    }
                    case ECallLongpollType.ParticipantNameChanged:
                        this.handleChangeName(event.data);
                        break;
                    case ECallLongpollType.CallSettingsChanged:
                        this.handleCallSettingsChanged(event.data);
                        break;
                }
            };
            this.handleChatInfoUpdated = async (event) => {
                if (!this.isInActiveCall) {
                    return;
                }
                const SDK = this.sdkService.getSdk();
                const { callData, dispatch } = this.stateBridge;
                const { call_id, hall_id } = event.value;
                if (callData.callId && call_id !== callData.callId) {
                    // user may have multiple active calls
                    SDK.debugMessage(DebugMessageType.DEBUG, `Skip chat_info_updated: wrong call_id, current call_id ${callData.callId}`, event);
                    return;
                }
                try {
                    const { conversation } = await getConversationByCall(call_id, hall_id);
                    if (!conversation) {
                        SDK.debugMessage(DebugMessageType.DEBUG, `conversation not found by call_id ${call_id}`);
                        return;
                    }
                    SDK.debugMessage(DebugMessageType.DEBUG, `set chat id ${conversation.peer.id} in room ${hall_id}`);
                    this.roomsService.setRoomChatId({ roomId: hall_id, chatId: conversation.peer.id || 0 });
                    const { roomId } = this.roomsService;
                    if ((!roomId && !hall_id) || roomId === hall_id) {
                        const serverData = convertServerData({ items: [conversation] });
                        setActiveCallData(dispatch, conversation);
                        const { peer } = this.stateBridge;
                        const nextPeerId = !roomId && !hall_id ? vkIdToPeerId(conversation.peer.id) : peer;
                        SDK.debugMessage(DebugMessageType.DEBUG, `set peer id ${nextPeerId} in call state`);
                        dispatch({
                            type: E_ACTION.LOAD_PEERS,
                            conversation: serverData[0],
                            members: serverData[1],
                            // Если нет комнаты - сохраняем peer беседы, но если комната есть, ее peer сохранится в state.rooms
                            peerId: nextPeerId,
                        });
                        dispatch({
                            type: E_ACTION.SET_UNREAD_COUNT,
                            chatUnreadCount: conversation.unread_count ?? 0,
                            chatUpToMsgId: conversation.last_conversation_message_id ?? null,
                        });
                    }
                }
                catch (err) {
                    handlePromiseError(err);
                }
            };
            this.handleIncomingCall = async (event) => {
                const SDK = this.sdkService.getSdk();
                const { dispatch, ipSettingEnabled, isDev, mode } = this.stateBridge;
                const { value: payload } = event;
                const contactId = payload.answer_from;
                const callPayload = payload.payload ? JSON.parse(decodeHTMLEntities(payload.payload)) : {};
                const callType = callPayload.is_video ? CallType.VIDEO : CallType.AUDIO;
                const callerVkId = getVkIdFromLongpoll(payload);
                const caller = convertCallerFromLongpoll(payload);
                const hasChatInfo = isGroupCallEvent({ payload: payload });
                let isGroupCall = hasChatInfo;
                if (isParticipantGroup(callerVkId) && 'with_join_link' in callPayload) {
                    isGroupCall = callPayload.with_join_link;
                }
                if (!isAcceptableIncomingCall(mode, event)) {
                    const logDeclineReason = (reason) => {
                        this.emitEvent(CallsEventType.ERROR, { error: new Error(reason) });
                        SDK.debugMessage(DebugMessageType.DEBUG, 'Incoming push skipped:', reason, event);
                    };
                    switch (true) {
                        case !payload.call_id: {
                            logDeclineReason('old lib call');
                            break;
                        }
                        case mode === Mode.CALL || mode === Mode.INCOMING: {
                            logDeclineReason('already in a call');
                            try {
                                sendStats(ClickHouseEventType.CALL_MISSED_NOTIFICATION);
                            }
                            catch (err) {
                                SDK.debugMessage(DebugMessageType.ERROR, 'Get error when send event about missed call', err);
                            }
                            this.emitEvent(CallsEventType.MISSING_CALL, {
                                title: this.langs.getLang('calls_missing_incoming_call_title'),
                                text: this.langs.langReplace(this.langs.getLang('calls_missing_incoming_call_text'), {
                                    name: caller.name,
                                }),
                                // декодирование используется, так как у нас ссылка уже экранирована, а снекбар экранирует повторно
                                image: caller.photo ? decodeURIComponent(caller.photo) : undefined,
                            });
                            break;
                        }
                        default: {
                            logDeclineReason('reason of decline is unknown');
                            break;
                        }
                    }
                    return;
                }
                try {
                    this.setIncomingCallData(payload);
                    if (ipSettingEnabled) {
                        SDK.forceRelayPolicy(!payload.p2p_allowed);
                    }
                    if (contactId) {
                        const { token } = await getContactCallToken(contactId, isDev);
                        await SDK.authorize(token);
                    }
                }
                catch (error) {
                    this.deleteIncomingCallData();
                    throw error;
                }
                try {
                    await SDK.processPush(payload.call_id, payload.conversation_params);
                    if (isGroupCall) {
                        const conversation = isGroupCall && hasChatInfo
                            ? convertChatFromLongpoll(payload['chat_info'])
                            : getDefaultConversation((key) => this.langs.getLang(key));
                        dispatch({
                            type: E_ACTION.LOAD_PEERS,
                            conversation,
                            members: [caller],
                            peerId: conversation.peerId,
                            caller: hasChatInfo ? conversation : caller,
                        });
                        if (conversation.photo) {
                            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
                            preloadImage(conversation.photo).catch((err) => SDK.debugMessage(DebugMessageType.WARN, err));
                        }
                        if (hasChatInfo) {
                            if (this.configService.getConfig().enableParticipantsService) {
                                void this.participantsService.loadCallPeersWithoutWaitingImagesAction(payload.call_id, conversation.peerId);
                            }
                            else {
                                void loadCallPeersWithoutWaitingImagesAction({ anonymSecret: this.stateBridge.anonymSecret, me: this.myPeerId }, dispatch, conversation.peerId, payload.call_id);
                            }
                        }
                    }
                    else {
                        // Добавляем данные из пуша для звонка один на один
                        dispatch({
                            type: E_ACTION.LOAD_PEERS,
                            conversation: caller,
                            members: [caller],
                            peerId: caller.peerId,
                        });
                    }
                    if (contactId) {
                        this.pinnedParticipantService.changeIdForContact(this.myPeerId, contactId);
                        dispatch({
                            type: E_ACTION.CHANGE_PARTICIPANT_ID,
                            peerId: contactId,
                            prevPeerId: this.myPeerId,
                        });
                    }
                    this.emitEvent(CallsEventType.INCOMING_CALL_STARTED);
                    if (!this.isIncomingModalHidden) {
                        dispatch({
                            type: E_ACTION.CHANGE_MODE,
                            mode: Mode.INCOMING, //
                            peerId: isParticipantGroup(callerVkId) && isGroupCall ? EMPTY_PEER_ID : vkIdToPeerId(callerVkId),
                            data: {
                                ...payload,
                                type: callType,
                                payload: callPayload,
                            },
                        });
                    }
                    callStatDataStorage.set({
                        timeStart: Date.now(),
                        startType: callType,
                    });
                    sendStats(ClickHouseEventType.INCOMING_CALL_RECEIVED, {
                        session_id: payload.call_id,
                        device_id: this.statDeviceId,
                        peer_id: callerVkId,
                        is_group_call: isGroupCall,
                        reason: callPayload.is_video ? CallType.VIDEO : CallType.AUDIO,
                    });
                }
                catch (err) {
                    this.deleteIncomingCallData();
                    this.emitEvent(CallsEventType.ERROR, { error: err });
                    sendStats(ClickHouseEventType.INCOMING_CALL_FAILED, {
                        session_id: payload.call_id,
                        device_id: this.statDeviceId,
                        peer_id: callerVkId,
                        is_group_call: isGroupCall,
                        error: getErrorCode(err),
                    });
                    /* expected HangupReason */
                    if (typeof err === 'object') {
                        const { hangup, message } = err;
                        SDK.debugMessage(DebugMessageType.ERROR, 'Push process error', hangup, message);
                    }
                    else {
                        SDK.debugMessage(DebugMessageType.ERROR, 'Push process error', err);
                    }
                }
            };
            this.handleCallFinishedOrAccepted = (event) => {
                // тут дублирование функционала SDK.onHangup
                // тк другие платформы могут не прислать событие
                const { callData, me: prevMe, mode } = this.stateBridge;
                const isFinished = event.type === ECallLongpollType.CallFinished;
                // Sometimes event comes before SDK.acceptCall resolved
                const isNotBeingAcceptedOrActive = !this.isInActiveCall;
                if (event.value === callData.callId &&
                    mode === Mode.INCOMING &&
                    (isFinished || isNotBeingAcceptedOrActive)) {
                    this.stateBridge.dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.READY });
                    const { me: realMe, isDev } = this.stateBridge;
                    if (isParticipantContact(prevMe)) {
                        // restore authorization as VK user, real vk id should be in 'me'
                        fetchCallTokenWithApiBaseUrl(realMe, isDev).then(({ token, apiBaseUrl }) => {
                            this.sdkService.getSdk().authorize(token, apiBaseUrl);
                        });
                    }
                }
            };
            this.handleChangeName = (event) => {
                const { call_id, new_custom_name_for_call, participant_id } = event.value;
                const { callData, dispatch } = this.stateBridge;
                if (callData.callId === call_id) {
                    dispatch({
                        type: E_ACTION.LOAD_PEERS,
                        members: [
                            {
                                peerId: vkIdToPeerId(participant_id),
                                customName: new_custom_name_for_call,
                            },
                        ],
                    });
                }
            };
            this.handleCallSettingsChanged = (event) => {
                const { call_id: callId } = event.value;
                if (callId) {
                    this.callsApi
                        .getCallSettings({ call_id: callId })
                        .then((response) => {
                        this.stateBridge.dispatch(setShowChatHistory(response.show_chat_history));
                    })
                        .catch(handlePromiseError);
                }
            };
        }
        get myPeerId() {
            return this.stateBridge.me;
        }
        get statDeviceId() {
            return this.configService.getConfig().deviceId;
        }
        emitEvent(type, payload) {
            eventBus.emit(type, payload);
        }
        get isInActiveCall() {
            return legacyBridge.isInActiveCall;
        }
        get isIncomingModalHidden() {
            return legacyBridge.isIncomingModalHidden;
        }
        setIncomingCallData(inboundCall) {
            legacyBridge.incomingCallData = inboundCall;
        }
        deleteIncomingCallData() {
            delete legacyBridge.incomingCallData;
        }
    };
    CallsQueueProcessorImpl = __decorate([
        scope.container(),
        __metadata("design:paramtypes", [CallsApi,
            CallsConfigService,
            Langs,
            RoomsService,
            CallsSdkService,
            StateBridge,
            PinnedParticipantService,
            ParticipantsService])
    ], CallsQueueProcessorImpl);
    return CallsQueueProcessorImpl;
};
//# sourceMappingURL=CallsQueueProcessor.js.map