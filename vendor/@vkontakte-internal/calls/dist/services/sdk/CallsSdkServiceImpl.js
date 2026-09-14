import { __decorate, __metadata } from "tslib";
import { CallsEventType, ClickHouseEventType, ModalType, Mode, VideoResolutionTypes, isGroupCallByPeer, EMPTY_PEER_ID, isCreator, } from '@vkontakte-internal/calls-core';
import { scope } from '@vkontakte-internal/di';
import { Langs } from '@vkontakte-internal/plugins';
import { DebugMessageType, HangupType, ParticipantStatus, UserRole, } from '@vkontakte/calls-sdk';
import { StreamRegistry } from '../stream';
import { createAuthorizeWithRetry, createInvalidTokenHandler, initVmoji, patchCallOptionsFeedback, resetAuthByGroupId, } from './utils';
import { SpeakersService } from '../speakers';
import { E_ACTION, HANGUP_DELAY, VideoHeight, VideoWidth } from '../../constants';
import { getIsVideoSuspendSupported } from '../../selectors';
import { toggleModal } from '../../actions';
import { isParticipantContact } from '../../helpers/participant';
import { callStatDataStorage } from '../../stats/callStatDataStorage';
import { handlePromiseError } from '../../helpers/logger';
import { sendStats } from '../../stats/clickHouse';
import { RoomsService } from '../../features/rooms/services/RoomsService';
import { fetchCallTokenWithApiBaseUrl } from '../fetchCallTokenWithApiBaseUrl';
import { eventBus } from '../eventBus';
import { conditionalPausedPromise, isInReconnect } from '../../helpers/helpers';
import { addCallStatEvent } from '../../stats/statlogs_stats';
import { sendVirtualBackgroundDisabled } from '../../helpers/statsVirtualBackground';
import { createDeviceChangeHandler } from '../device';
import { CallsConfigService } from '../config';
import { AccountService } from '../account';
const PARTICIPANT_LIST_CHUNK_DEFAULT_VISIBLE_SIZE = 8;
export const createCallsSdkServiceImplementation = ({ apiBaseUrl: factoryApiBaseUrl, bridge: factoryBridge, SDK: factorySDK, store: factoryStore, }) => {
    let CallsSdkServiceImpl = class CallsSdkServiceImpl {
        constructor(accountService, configService, langs, streamRegistry, speakersService, roomsService) {
            this.accountService = accountService;
            this.configService = configService;
            this.langs = langs;
            this.streamRegistry = streamRegistry;
            this.speakersService = speakersService;
            this.roomsService = roomsService;
            this.listeners = new Map();
            this.authorize = async (token, apiBaseUrl) => {
                return this.getSdk().authorize(token, apiBaseUrl);
            };
            this.log = (...args) => {
                this.debugMessage(DebugMessageType.LOG, ...args);
            };
            this.logDebug = (...args) => {
                this.debugMessage(DebugMessageType.DEBUG, ...args);
            };
            this.logWarn = (...args) => {
                this.debugMessage(DebugMessageType.WARN, ...args);
            };
            this.handleCallback = (name, args) => {
                const list = this.listeners.get(name);
                list?.forEach((listener) => {
                    if (args) {
                        listener(...args);
                    }
                    else {
                        listener();
                    }
                });
            };
            this.createCallback = (name) => {
                const handler = (...args) => {
                    this.handleCallback(name, args);
                };
                return handler;
            };
            this.createCallbacks = () => {
                const callbackNames = [
                    'onLocalStream',
                    'onLocalStreamUpdate',
                    'onLocalLive',
                    'onLocalLiveUpdate',
                    'onLocalSharedMovieInfo',
                    'onLocalSharedMovieStoppedInfo',
                    'onScreenStream',
                    'onVmojiStream',
                    'onVmojiError',
                    'onPermissionsRequested',
                    'onPermissionsError',
                    'onRemoteStream',
                    'onRemoteLive',
                    'onRemoteLiveUpdate',
                    'onRemoteSharedMovieInfo',
                    'onRemoteSharedMovieStoppedInfo',
                    'onRemoteStreamSuspended',
                    'onRemoteSharedUrl',
                    'onRemoteScreenStream',
                    'onRemoteVmojiStream',
                    'onParticipantVmojiUpdate',
                    'onRemoteMediaSettings',
                    'onRemoteStatus',
                    'onRemoteRemoved',
                    'onVideoSuspendSuggest',
                    'onParticipantJoined',
                    'onParticipantAdded',
                    'onParticipantIdChanged',
                    'onAcceptedCall',
                    'onCallAccepted',
                    'onConversation',
                    'onCallState',
                    'onFeaturesPerRoleChanged',
                    'onSpeakerChanged',
                    'onMultipartyChatCreated',
                    'onFingerprintChange',
                    'onLocalVolume',
                    'onCustomData',
                    'onNetworkStatusChanged',
                    'onLocalNetworkStatusChanged',
                    'onLocalParticipantState',
                    'onRemoteParticipantState',
                    'onRemoteParticipantsState',
                    'onRolesChanged',
                    'onLocalRolesChanged',
                    'onDeviceSwitched',
                    'onMuteStates',
                    'onRecordStarted',
                    'onRecordStopped',
                    'onLocalPin',
                    'onPinnedParticipant',
                    'onOptionsChanged',
                    'onLocalStatus',
                    'onChatRoomUpdated',
                    'onJoinLinkChanged',
                    'onFeedback',
                    'onChatMessage',
                    'onRoomStart',
                    'onRoomsUpdated',
                    'onRoomUpdated',
                    'onRoomSwitched',
                    'onRoomParticipantsUpdated',
                    'onAsrSet',
                    'onAsrStarted',
                    'onAsrStopped',
                    'onAsrTranscription',
                    'onPromotionApproved',
                    'onPromoted',
                    'onPeerRegistered',
                ];
                return callbackNames.reduce((acc, name) => {
                    acc[name] = this.createCallback(name);
                    return acc;
                }, {});
            };
            this.getLang = (key, isRawOrCount) => isRawOrCount === 'raw' ? this.langs.getLang(key, true) : this.langs.getLang(key);
            this.debugMessage = this.getSdk().debugMessage;
            this.onRateNeeded = () => {
                this.logWarn('onRateNeeded');
            };
            this.onJoinStatus = (available, chatId) => {
                this.logWarn('onJoinStatus', available, chatId);
            };
            //  не трогать
            this.onHangup = (hangupReason, conversationId) => {
                const config = this.getConfig();
                const bridge = this.getBridge();
                const store = this.getReduxStore();
                const { dispatch } = store;
                const state = store.getState();
                const { hangup: type } = hangupReason;
                this.logWarn('onHangup', type, conversationId);
                delete bridge.incomingCallData;
                // Очищаем реест потоков
                this.streamRegistry.clear();
                eventBus.emit(CallsEventType.HANGUP, { hangupReason });
                // берем состояние редакса
                const localState = store.getState();
                const isMeCallOwner = isCreator(localState.localDevice);
                switch (true) {
                    case type === HangupType.REJECTED && localState.mode === Mode.INCOMING:
                        eventBus.emit(CallsEventType.INCOMING_CALL_DECLINED);
                        break;
                    case type === HangupType.REJECTED && localState.mode !== Mode.INCOMING:
                        eventBus.emit(CallsEventType.OUTGOING_CALL_DECLINED);
                        break;
                    case type === HangupType.CANCELED && !isMeCallOwner:
                        eventBus.emit(CallsEventType.INCOMING_CALL_CANCELED);
                        break;
                    case type === HangupType.CANCELED && isMeCallOwner:
                        eventBus.emit(CallsEventType.OUTGOING_CALL_CANCELED);
                        break;
                    case type === HangupType.KILLED && isMeCallOwner:
                        eventBus.emit(CallsEventType.CALL_FINISHED_LOCALLY);
                        break;
                    case type === HangupType.KILLED && !isMeCallOwner:
                        eventBus.emit(CallsEventType.CALL_FINISHED_REMOTELY);
                        break;
                    case type === HangupType.HUNGUP:
                        eventBus.emit(CallsEventType.CALL_FINISHED);
                        break;
                    case type === HangupType.MISSED:
                        if (!hangupReason.remote) {
                            eventBus.emit(CallsEventType.INCOMING_CALL_ACCEPTED_ON_ANOTHER_DEVICE);
                        }
                        break;
                    case type === HangupType.REMOVED:
                        eventBus.emit(CallsEventType.PARTICIPANT_WAS_KICKED_FROM_CALL);
                        break;
                    case type === HangupType.ANOTHER_DEVICE:
                        eventBus.emit(CallsEventType.CALL_ENTERING_ON_ANOTHER_DEVICE);
                        break;
                    case type === HangupType.BANNED:
                        eventBus.emit(CallsEventType.PARTICIPANT_WAS_BLOCKED_IN_CALL);
                        break;
                }
                // Собственные действия или повесили трубку
                // Реакция в интерфейсе не нужна
                const isHangupTypeShown = type && ![HangupType.CANCELED, HangupType.MISSED, HangupType.HUNGUP].includes(type);
                const isHangupTypeForFeedback = type && type === HangupType.HUNGUP;
                let isGroupCall = isGroupCallByPeer(localState.peer);
                let isVoiceRoom = localState.isVoiceRoom;
                if ((localState.mode === Mode.CALL && isHangupTypeShown) ||
                    (localState.localDevice.status === ParticipantStatus.WAITING_HALL && type === HangupType.REMOVED)) {
                    /* если именно я "закончил звонок для всех" */
                    const forceDisableHangupDelay = !!localState.lastCallData?.isMeEndedCallForAll &&
                        (type === HangupType.KILLED || type === HangupType.KILLED_WITHOUT_DELETE);
                    dispatch({ type: E_ACTION.HANGUP, data: type });
                    conditionalPausedPromise(forceDisableHangupDelay || HANGUP_DELAY).finally(() => {
                        dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.READY });
                        const typesWithModals = [
                            HangupType.BUSY,
                            HangupType.KILLED,
                            HangupType.KILLED_WITHOUT_DELETE,
                            HangupType.BANNED,
                            HangupType.REMOVED,
                        ];
                        if (typesWithModals.includes(type) ||
                            (isVoiceRoom && localState.groupId && type === HangupType.ANOTHER_DEVICE)) {
                            // в ряде случаев, после окончания звонка, показываем модалку с описанием
                            dispatch(toggleModal(ModalType.HANGUP, {
                                hangupType: type,
                                isWaitingHall: localState.localDevice.status === ParticipantStatus.WAITING_HALL,
                            }));
                        }
                    });
                }
                else if (isHangupTypeForFeedback) {
                    const { ts: timeStart } = localState.callData;
                    const timePassed = timeStart ? Math.floor((Date.now() - timeStart) / 1000) : 0;
                    const reasonToShowForGroupCall = timePassed > 10 && Math.floor(Math.random() * 3) === 0;
                    const reasonToShowForP2PCall = Math.floor(Math.random() * 5) === 0;
                    if ((isGroupCall && reasonToShowForGroupCall) || reasonToShowForP2PCall) {
                        dispatch({
                            type: E_ACTION.CHANGE_MODE,
                            mode: Mode.FEEDBACK,
                        });
                    }
                    else if (localState.mode !== Mode.ERROR) {
                        dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.READY });
                    }
                    // Если при завершении звонка пользователь в сессионном зале, то отправляем стату
                    if (this.roomsService.roomId) {
                        sendStats(ClickHouseEventType.SESSION_ROOMS_USER_LEFT);
                    }
                }
                else if (localState.mode !== Mode.ERROR) {
                    dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.READY });
                }
                bridge.isInActiveCall = false;
                const isReconnecting = isInReconnect(localState);
                conversationId = conversationId || '';
                addCallStatEvent(type, conversationId, isReconnecting, bridge.debug);
                if (!isReconnecting && !isGroupCall) {
                    let reason = 'none';
                    if (type === HangupType.MISSED) {
                        reason = 'timeout';
                    }
                    else if (type === HangupType.BUSY) {
                        reason = 'busy';
                    }
                    const { conversation } = localState.callData;
                    let eventRawData = {
                        call_event_type: ClickHouseEventType.CALL_DECLINED_OR_HANGED_REMOTELY,
                        session_id: conversationId,
                        peer_id: conversation?.peerId ?? EMPTY_PEER_ID,
                        device_id: config.deviceId,
                        is_group_call: false,
                        reason: reason,
                    };
                    sendStats(ClickHouseEventType.CALL_DECLINED_OR_HANGED_REMOTELY, eventRawData);
                }
                if (bridge.authorizedGroupId) {
                    resetAuthByGroupId({
                        authorize: (token, apiBaseUrl) => this.authorize(token, apiBaseUrl),
                        authorizedGroupId: bridge.authorizedGroupId,
                        dispatch,
                        isDev: state.isDev,
                        setAuthorizedGroupId: (groupId) => {
                            bridge.authorizedGroupId = groupId;
                        },
                    });
                }
                callStatDataStorage.reset();
                if (localState.externalId) {
                    if (isParticipantContact(localState.externalId.id)) {
                        // restore authorization as VK user, real vk id should be in 'me'
                        fetchCallTokenWithApiBaseUrl(state.me, state.isDev).then(({ token, apiBaseUrl }) => {
                            this.authorize(token, apiBaseUrl);
                        });
                    }
                    else {
                        dispatch({
                            type: E_ACTION.LOAD_PEERS,
                            members: [
                                {
                                    peerId: localState.externalId.id,
                                    customName: undefined,
                                },
                            ],
                        });
                    }
                }
                // отправляем статистику
                sendVirtualBackgroundDisabled(localState.callData.callId || '', localState.peer);
                this.handleCallback('onHangup', [hangupReason, conversationId]);
            };
            // не трогать
            this.onTokenExpired = () => {
                this.logWarn('onTokenExpired');
                const bridge = this.getBridge();
                const store = this.getReduxStore();
                if ((bridge.tokenAttempts || 0) < 3) {
                    void createInvalidTokenHandler({
                        authorize: (token, apiBaseUrl) => this.authorize(token, apiBaseUrl),
                        getMyPeerId: () => store.getState().me,
                        getIsDev: () => store.getState().isDev,
                        onError: (err) => {
                            bridge.eventBus.emit(CallsEventType.ERROR, { error: err });
                            console.error('Could not authorize with token request', err);
                        },
                        setIsAuthorized: (value) => {
                            bridge.authorized = value;
                        },
                    })();
                    bridge.tokenAttempts = (bridge.tokenAttempts || 0) + 1;
                }
                this.handleCallback('onTokenExpired', []);
            };
        }
        getSdk() {
            return factorySDK;
        }
        async init() {
            const bridge = this.getBridge();
            const config = this.getConfig();
            const SDK = this.getSdk();
            const store = this.getReduxStore();
            await SDK.init(this.createParams());
            initVmoji(SDK, config);
            await createAuthorizeWithRetry({
                authorize: (token, apiBaseUrl) => this.authorize(token, apiBaseUrl),
                getIsAuthorized: () => bridge.authorized,
                getMyPeerId: () => store.getState().me,
                getIsDev: () => store.getState().isDev,
                getToken: () => this.accountService.getToken(),
                getApiBaseUrl: () => this.getApiBaseUrl(),
                onError: (err) => {
                    eventBus.emit(CallsEventType.ERROR, { error: err });
                    console.error('Could not authorize with token request', err);
                },
                setIsAuthorized: (value) => {
                    bridge.authorized = value;
                },
            })();
        }
        /**
         * Подписка на коллбэки SDK
         */
        subscribe(name, listener) {
            const list = this.listeners.get(name) ?? new Set();
            list.add(listener);
            this.listeners.set(name, list);
            return () => {
                list.delete(listener);
            };
        }
        changeSDKStartCallOptions(options = {}) {
            const SDK = this.getSdk();
            const _options = patchCallOptionsFeedback(options);
            if (_options.conversationOptions && Object.keys(_options.conversationOptions).length > 0) {
                SDK.changeConversationOptions(_options.conversationOptions);
            }
            if (_options.conversationFeatures && Object.keys(_options.conversationFeatures).length > 0) {
                if (_options.conversationFeatures.onlyAdminCanRecordAndTranslation) {
                    SDK.enableFeatureForRoles("RECORD" /* ConversationFeature.RECORD */, [UserRole.ADMIN, UserRole.CREATOR]);
                }
            }
            if (_options.mediaOptions && Object.keys(_options.mediaOptions).length > 0) {
                SDK.muteParticipant({ muteStates: _options.mediaOptions }).catch(handlePromiseError);
            }
        }
        getBridge() {
            return factoryBridge;
        }
        getConfig() {
            return this.configService.getConfig();
        }
        getApiBaseUrl() {
            return factoryApiBaseUrl;
        }
        getReduxStore() {
            return factoryStore;
        }
        createParams() {
            const config = this.getConfig();
            const { accountService } = this;
            const store = this.getReduxStore();
            const domain = config.enableDomainBender ? 'bender' : undefined;
            const state = store.getState();
            const videoMaxHeight = state.localVideoResolution === VideoResolutionTypes.SD ? VideoHeight.SD : VideoHeight.HD;
            const videoMaxWidth = state.localVideoResolution === VideoResolutionTypes.SD ? VideoWidth.SD : VideoWidth.HD;
            const params = {
                ...this.createCallbacks(),
                apiKey: accountService.getCallsApiKey(),
                apiBaseUrl: this.getApiBaseUrl(),
                anonymToken: accountService.isAnonym() ? accountService.getToken() : '',
                audioShare: config.enableAudioShare,
                useCallsToContacts: true,
                useParticipantListChunk: false,
                useRooms: true,
                useChatRooms: true,
                fastScreenShare: true,
                participantListChunkInitCount: PARTICIPANT_LIST_CHUNK_DEFAULT_VISIBLE_SIZE,
                screenShareCongestionControl: true,
                screenShareCongestionControlThreshold: config.customScreenShareCongestionControlThreshold,
                voiceParams: {
                    interval: 150,
                    speakerLevelMultiplier: 1.3,
                    smoothing: 0.5,
                },
                domain,
                videoTracksCount: config.videoSlotsCount,
                asrDataChannel: !config.sferum || (config.sferum && Boolean(config.enableSubtitlesSferum)),
                videoMaxHeight,
                videoMaxWidth,
                videoEffectMaxHeight: videoMaxHeight,
                videoEffectMaxWidth: videoMaxWidth,
                videoSuspend: getIsVideoSuspendSupported(state),
                /** Нужно включить если мы включаем выгрузку логов через кнопку или включаем выгрузку логов при отправке фидбека */
                debugLog: config.debugPersistentLog || config.enableUploadDebugLogs,
                debug: config.debugConsoleLog,
                callStatReportEnabled: true,
                joinFromMultipleDevices: config.enableMultipleDevices,
                /** для разработки этой фичи используй флаг `video_uv_test_env` в админке */
                movieShare: true,
                newMuteRules: config.enableNewMuteRules,
                clientType: 'VK',
                clientStatsPlatform: config.clientStatsPlatform,
                consumerScreenDataChannelPacketSize: config.customScreenSharePacketSize,
                externalDomain: config.customExternalDomain,
                enableVideoEffectsFpsDegradation: config.enableVideoEffectsFpsDegradation,
                // Чтобы не лезть пока в редактирование SDK
                switchVideoAtBadNetwork: true,
                simulcast: config.enableSimulcast,
                webtransport: config.enableWebtransport,
                webtransportFF: config.enableWebtransportFF,
                consumerFastScreenShare: config.enableConsumerFastScreenShare,
                consumerFastScreenShareQualityOnDemand: config.enableConsumerFastScreenShareQualityOnDemand,
                streamBuilderKeyFrameRequest: config.enableStreamBuilderKeyFrameRequest,
                streamBuilderAutoSwitchToLibVPX: config.enableStreamBuilderAutoSwitchToLibVPX,
                // callbacks
                onJoinStatus: this.onJoinStatus,
                onHangup: this.onHangup,
                onRateNeeded: this.onRateNeeded,
                onTokenExpired: this.onTokenExpired,
                onDeviceChange: createDeviceChangeHandler(this.handleCallback),
                onVolumesDetected: this.speakersService.onVolumesDetected,
            };
            return params;
        }
    };
    CallsSdkServiceImpl = __decorate([
        scope.container(),
        __metadata("design:paramtypes", [AccountService,
            CallsConfigService,
            Langs,
            StreamRegistry,
            SpeakersService,
            RoomsService])
    ], CallsSdkServiceImpl);
    return CallsSdkServiceImpl;
};
//# sourceMappingURL=CallsSdkServiceImpl.js.map