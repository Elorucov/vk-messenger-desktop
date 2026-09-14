import { __decorate, __metadata } from "tslib";
import { CallsEventType, CallStatSource, ClickHouseEventType, ErrorHandleType, ManagementModalView, ModalType, Mode, ServerError, UIMode, EMPTY_PEER_ID, EMPTY_USER_ID, peerIdToVkId, vkIdToPeerId, isGroupCallByPeerAndMe, isGroupCallByVkId, EMailRuGoals, mailRuCounter, } from '@vkontakte-internal/calls-core';
import { scope } from '@vkontakte-internal/di';
import { compose, createPayload, exponentialRetry, getErrorCode, getTextForApiErrorByCode, isGroupCallEvent, normalizePreviewData, tokenValidateRetryWrapper, vou, } from '../../helpers/helpers';
import { CallErrorType, CallType, E_ACTION, SHORT_LINK_REGEX, skippedErrorCodes } from '../../constants';
import { StateBridge } from '../../utils/stateBridge';
import { getActiveParticipantsCount, isParticipantAnonym, isParticipantContact, } from '../../helpers/participant';
import { setChatInfo, setFriends } from '../../actions/callMembers';
import { LangUtils } from '../Lang';
import { CallsConfigService } from '../config';
import { FriendsService } from '../friends';
import { MessagesService } from '../messages';
import { CallsSdkService, checkAuthByGroupId, getCallStartErrorText } from '../sdk';
import { DebugMessageType, MediaOption } from '@vkontakte/calls-sdk';
import { setIsVoiceRoom, setShowLoader, toggleModal } from '../../actions';
import { checkPermissions } from '../../permissions';
import { loadConversationData } from '../sdk/utils';
import { loadAndCopyJoinLink, setConversationData } from '../../actions/actions';
import { getExternalIdByUserId, normalizeUser } from '../../helpers/user';
import { callStatDataStorage } from '../../stats/callStatDataStorage';
import { callStats, sendStats } from '../../stats/clickHouse';
import { handlePromiseError } from '../../helpers/logger';
import { getDefaultConversation } from '../../helpers/call';
import * as tokens from '../../tokens';
import { getPermissionsErrorMessage } from '../../helpers/error';
import { isChatPeer, isUserPeer } from '@vkontakte-internal/vkjs/lib/im/Helpers';
import { getConversationByCall, messagesGetCallPreview } from '../backend';
import { noop } from '@vkontakte/vkjs';
import { batch } from 'react-redux';
import { setVoiceRoomInitialData, setVoiceRoomMode } from '../../features/voiceRoom';
import { getVideoResolutionStatsValue } from '../../helpers/videoSettingsStat';
import { CallService } from '../call';
import { VmojiService } from '../vmoji';
import { createMediaModifiersUpdater, loadConversationDataPostProcess } from './utils';
let InternalBridgeWrapper = class InternalBridgeWrapper {
};
InternalBridgeWrapper = __decorate([
    scope.container({ abstract: true })
], InternalBridgeWrapper);
export { InternalBridgeWrapper };
export const createInternalBridgeImplementation = (bridge) => {
    let InternalBridgeWrapperImpl = class InternalBridgeWrapperImpl {
        constructor(callService, configService, friendsService, langUtils, messagesService, sdkService, stateBridge, vmojiService) {
            this.callService = callService;
            this.configService = configService;
            this.friendsService = friendsService;
            this.langUtils = langUtils;
            this.messagesService = messagesService;
            this.sdkService = sdkService;
            this.stateBridge = stateBridge;
            this.vmojiService = vmojiService;
            this.legacyBridge = bridge;
            // используется как коллбэк
            this.setAuthorizedGroupId = (id) => {
                this.legacyBridge.authorizedGroupId = id;
            };
            this.setIsInActiveCall = (value) => {
                if (value) {
                    this.callService.isInActiveCall = true;
                    this.emitEvent(CallsEventType.CALL_STARTED);
                }
                else {
                    this.callService.isInActiveCall = false;
                }
            };
            this.getLang = this.langUtils.getLang;
            this.emitEvent = (type, payload) => this.legacyBridge.eventBus.emit(type, payload);
            this.waitAuthorization = () => new Promise((resolve) => {
                if (this.legacyBridge.initializing) {
                    this.legacyBridge.initializing.finally(() => {
                        resolve();
                    });
                }
                else {
                    resolve();
                }
            });
            this.getFriendsExternal = this.legacyBridge.getFriends;
            this.getIsFriendExternal = this.legacyBridge.isFriend;
            this.checkOnlyAuthByGroupId = (groupId) => {
                const { dispatch } = this.stateBridge;
                return checkAuthByGroupId({
                    authorize: (token, apiBaseUrl) => this.sdkService.authorize(token, apiBaseUrl),
                    authorizedGroupId: this.authorizedGroupId,
                    dispatch,
                    groupId,
                    isDev: this.isDev,
                    onlyAuth: true,
                    setAuthorizedGroupId: this.setAuthorizedGroupId,
                });
            };
            /**
             * @param mediaOptions
             * @param opponentVkId ID участника или беседы, которому звоним
             * @param onlyAdminCanShareMovie Возможен ли запуск совместного просмотра не админу
             */
            this.startCallInternal = (mediaOptions, opponentVkId = EMPTY_USER_ID, onlyAdminCanShareMovie = false) => {
                const SDK = this.sdkService.getSdk();
                const { callMembers } = this.stateBridge;
                const communityUserId = this.authorizedGroupId ? peerIdToVkId(this.myPeerId) : EMPTY_USER_ID;
                const payload = createPayload(opponentVkId, mediaOptions, this.config.appId, communityUserId);
                if (!opponentVkId) {
                    return SDK.callTo(undefined, mediaOptions, payload, true, undefined, onlyAdminCanShareMovie);
                }
                const cachedFriends = callMembers.friendsCache;
                const hasCachedFriends = Object.keys(cachedFriends).length > 0;
                const getIsFriend = () => {
                    // Передали функцию при инициализации
                    if (this.getIsFriendExternal) {
                        return this.getIsFriendExternal(opponentVkId);
                    }
                    // Загрузили друзей раньше
                    if (hasCachedFriends) {
                        return !!cachedFriends[opponentVkId];
                    }
                };
                if (!isGroupCallByVkId(opponentVkId)) {
                    return this.shouldForceRelay({
                        getIsFriend,
                        peerId: opponentVkId,
                    }).then((enabled) => {
                        SDK.forceRelayPolicy(enabled);
                        const externalId = getExternalIdByUserId(opponentVkId);
                        return SDK.callTo(externalId, mediaOptions, payload, undefined, undefined, onlyAdminCanShareMovie);
                    });
                }
                let friends = null;
                if (this.getFriendsExternal) {
                    friends = this.getFriendsExternal();
                    if (friends !== null) {
                        this.cacheFriends(friends);
                    }
                }
                if (hasCachedFriends || this.authorizedGroupId || friends !== null) {
                    return SDK.callTo([], mediaOptions, payload, true, undefined, onlyAdminCanShareMovie);
                }
                return this.loadFriends().then((data) => {
                    if (data) {
                        this.cacheFriends(data.friends, data.count);
                    }
                    return SDK.callTo([], mediaOptions, payload, true, undefined, onlyAdminCanShareMovie);
                });
            };
            this.loadFriends = () => this.friendsService
                .getPage()
                .then(({ items, count }) => ({
                count,
                friends: items.map(normalizeUser),
            }))
                .catch(handlePromiseError);
            /**
             * Обрабатываем некритичные ошибки, пишем в консоль
             */
            this.handleErrorSilently = (err) => {
                switch (err) {
                    case CallErrorType.ALREADY_HAS_INCOMING_CALL:
                        console.log('Already has an incoming call');
                        break;
                    case CallErrorType.ALREADY_IN_CALL:
                        console.log('Already in call');
                        break;
                    default:
                        console.log(err);
                }
            };
            this.handleInvalidToken = async () => {
                const setIsAuthorized = (value) => {
                    if (this.legacyBridge) {
                        this.legacyBridge.authorized = value;
                    }
                };
                try {
                    const { token, apiBaseUrl } = await tokens.fetchTokenWithApiBaseUrl(this.isDev);
                    await this.sdkService.authorize(token, apiBaseUrl);
                    setIsAuthorized(true);
                    tokens.saveLocalTokenWithApiBaseUrl(token, apiBaseUrl, this.myPeerId);
                }
                catch (err) {
                    this.emitEvent(CallsEventType.ERROR, { error: err });
                    console.error('Could not authorize with token request', err);
                }
            };
            this.startCallWithRetry = compose(this.startCallInternal, tokenValidateRetryWrapper.bind(null, this.handleInvalidToken));
            this.updateSDKMediaModifiers = createMediaModifiersUpdater({
                SDK: this.sdkService.getSdk(),
                dispatch: this.stateBridge.dispatch,
                getClientNoiseReductionModeEnabled: () => this.config.enableClientNoiseReductionMode,
                getNoiseReductionModeEnabled: () => this.config.enableNoiseReductionMode,
                getEffectVoiceChange: () => this.stateBridge.effectVoiceChange,
                getIsRestrictedConversation: () => this.isRestrictedConversation,
                getLocalDevice: () => this.stateBridge.localDevice,
                getNoiseCancellationType: () => this.stateBridge.noiseCancellation,
                getNoiseReductionMode: () => this.config.noiseReductionMode,
            });
            this.getMediaOptions = ({ isWithAudio, isWithVideo, }) => {
                const mediaOptions = [];
                if (isWithAudio) {
                    mediaOptions.push(MediaOption.AUDIO);
                }
                if (isWithVideo) {
                    mediaOptions.push(MediaOption.VIDEO);
                }
                if (!isWithVideo && this.vmojiService.getVmojiShouldBeStarted()) {
                    mediaOptions.push(MediaOption.ANIMOJI);
                }
                return mediaOptions;
            };
            /**
             * Обрабатывает ошибку начала звонка
             */
            this.handleCallStartError = (err, isGroupCall) => {
                const SDK = this.sdkService.getSdk();
                const { dispatch } = this.stateBridge;
                try {
                    const errorMessage = getCallStartErrorText(err, isGroupCall, this.getLang);
                    SDK.hangup();
                    this.emitEvent(CallsEventType.ERROR, { error: err });
                    SDK.debugMessage(DebugMessageType.ERROR, err);
                    console.error(err);
                    dispatch({
                        type: E_ACTION.ERROR,
                        text: errorMessage,
                        handleType: ErrorHandleType.FATAL,
                    });
                    this.emitEvent(CallsEventType.ERROR_START_CALL);
                }
                catch (e) {
                    SDK.debugMessage(DebugMessageType.ERROR, e);
                    console.error(e);
                    SDK.hangup();
                    throw err;
                }
            };
            this.p2pCall = async ({ vkId, isWithVideo = false, isWithAudio = true, conversationData, entryPoint, groupId = 0, options, }) => {
                const SDK = this.sdkService.getSdk();
                const { dispatch } = this.stateBridge;
                const checkIncomingCallData = async (vkId) => {
                    if (this.incomingCallData) {
                        if (!isGroupCallEvent({ payload: this.incomingCallData }) &&
                            this.incomingCallData.from_id === vkId) {
                            await exponentialRetry(this.acceptCall, {
                                attempts: 3,
                                errorType: CallErrorType.ALREADY_HAS_INCOMING_CALL,
                            })(false, true, true);
                        }
                        throw CallErrorType.ALREADY_HAS_INCOMING_CALL;
                    }
                };
                let resConversationData;
                try {
                    const mediaOptions = this.getMediaOptions({
                        isWithVideo,
                        isWithAudio,
                    });
                    if (this.isInActiveCall) {
                        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
                        return Promise.reject(CallErrorType.ALREADY_IN_CALL).catch(this.handleErrorSilently);
                    }
                    this.setIsInActiveCall(true);
                    dispatch(setShowLoader(true));
                    await this.waitAuthorization();
                    await checkAuthByGroupId({
                        authorize: (token, apiBaseUrl) => this.sdkService.authorize(token, apiBaseUrl),
                        authorizedGroupId: this.authorizedGroupId,
                        dispatch,
                        groupId,
                        isDev: this.isDev,
                        setAuthorizedGroupId: this.setAuthorizedGroupId,
                    });
                    await checkPermissions(SDK, mediaOptions);
                    const [conversation, members, originalConversation] = await loadConversationData(dispatch, vkId, conversationData, true);
                    await checkIncomingCallData(vkId);
                    setConversationData(dispatch, { conversation, members, originalConversation, vkId });
                    resConversationData = await this.startCallWithRetry(mediaOptions, vkId);
                    this.updateSDKMediaModifiers();
                    this.sdkService.changeSDKStartCallOptions(options);
                    dispatch(setShowLoader(false));
                    dispatch({
                        type: E_ACTION.CHANGE_MODE,
                        mode: Mode.CALL,
                        peerId: vkIdToPeerId(vkId),
                    });
                    callStatDataStorage.set({
                        timeStart: Date.now(),
                        isOutgoingCall: true,
                        entryPoint: entryPoint,
                        startType: isWithVideo ? CallType.VIDEO : CallType.AUDIO,
                    });
                    sendStats(isWithVideo
                        ? ClickHouseEventType.OUTGOING_CALL_STARTED_VIDEO
                        : ClickHouseEventType.OUTGOING_CALL_STARTED_AUDIO, {
                        session_id: resConversationData?.id,
                        peer_id: vkId,
                        source: entryPoint,
                        group_call_users_count: 2,
                        is_group_call: false,
                    });
                    if (isWithVideo) {
                        sendStats(ClickHouseEventType.VIDEO_SETTINGS, {
                            reason: getVideoResolutionStatsValue(this.config.enableHDVideo),
                        });
                    }
                    mailRuCounter.push(EMailRuGoals.StartP2PCall);
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
                    loadConversationDataPostProcess(dispatch, vkId, conversationData).catch(handlePromiseError);
                    return resConversationData;
                }
                catch (err) {
                    this.setIsInActiveCall(false);
                    dispatch(setShowLoader(false));
                    if (err === CallErrorType.ALREADY_HAS_INCOMING_CALL) {
                        this.handleErrorSilently(err);
                        return;
                    }
                    sendStats(ClickHouseEventType.OUTGOING_CALL_FAILED, {
                        session_id: resConversationData?.id,
                        peer_id: vkId,
                        is_group_call: false,
                        source: entryPoint,
                        group_call_users_count: 2,
                        error: getErrorCode(err),
                    });
                    // @ts-expect-error TS2345: TODO CALL-23757 Argument of type 'unknown' is not assignable to parameter of type 'CallStartErr'.
                    this.handleCallStartError(err, isGroupCallByVkId(vkId));
                }
            };
            this.acceptCall = (isWithVideo, isWithAudio, isDisabledErrorCatching = false) => {
                const SDK = this.sdkService.getSdk();
                const { dispatch } = this.stateBridge;
                const peerId = this.opponentPeerId;
                const mediaOptions = this.getMediaOptions({
                    isWithVideo,
                    isWithAudio,
                });
                this.setIsInActiveCall(true);
                return checkPermissions(SDK, mediaOptions)
                    .then(() => SDK.acceptCall(mediaOptions))
                    .then(({ acceptTime }) => {
                    this.deleteIncomingCallData();
                    dispatch({
                        type: E_ACTION.CHANGE_MODE,
                        mode: Mode.CALL,
                        ts: acceptTime,
                    });
                    const statData = {
                        session_id: this.callData.callId,
                        device_id: this.statDeviceId,
                        peer_id: peerId,
                        is_group_call: isGroupCallByPeerAndMe(peerId, this.myPeerId),
                    };
                    sendStats(ClickHouseEventType.INCOMING_CALL_ACCEPTED, {
                        reason: isWithVideo ? CallType.VIDEO : CallType.AUDIO,
                    });
                    if (isWithVideo) {
                        sendStats(ClickHouseEventType.VIDEO_SETTINGS, {
                            reason: getVideoResolutionStatsValue(this.config.enableHDVideo),
                        });
                    }
                    if (isParticipantContact(this.myPeerId)) {
                        callStats.logEvent({
                            ...statData,
                            call_event_type: ClickHouseEventType.CONTACT_JOINED,
                        });
                    }
                    mailRuCounter.push(EMailRuGoals.AcceptCall);
                    this.updateSDKMediaModifiers();
                })
                    .catch((error) => {
                    this.setIsInActiveCall(false);
                    dispatch({
                        type: E_ACTION.ERROR,
                        text: getPermissionsErrorMessage(isWithVideo, true, this.getLang),
                        handleType: ErrorHandleType.DECLINE,
                    });
                    this.emitEvent(CallsEventType.ERROR, { error });
                    SDK.debugMessage(DebugMessageType.ERROR, error);
                    console.error(error);
                    if (isDisabledErrorCatching) {
                        throw error;
                    }
                    else {
                        this.deleteIncomingCallData();
                        dispatch({
                            type: E_ACTION.ERROR,
                            text: getPermissionsErrorMessage(isWithVideo, true, this.getLang),
                            handleType: ErrorHandleType.DECLINE,
                        });
                        this.emitEvent(CallsEventType.ERROR, { error });
                    }
                });
            };
            this.startCall = async (isWithVideo, entryPoint, openManagement = true, groupId = 0, options = {}, onlyAdminCanShareMovie = false) => {
                const SDK = this.sdkService.getSdk();
                const { dispatch } = this.stateBridge;
                const checkIncomingCallData = () => {
                    if (this.incomingCallData) {
                        throw CallErrorType.ALREADY_HAS_INCOMING_CALL;
                    }
                };
                try {
                    const mediaOptions = this.getMediaOptions({
                        isWithAudio: true,
                        isWithVideo,
                    });
                    if (this.isInActiveCall) {
                        this.handleErrorSilently(CallErrorType.ALREADY_IN_CALL);
                        return;
                    }
                    this.setIsInActiveCall(true);
                    dispatch(setShowLoader(true));
                    const conversation = getDefaultConversation(this.getLang);
                    await this.waitAuthorization();
                    await checkAuthByGroupId({
                        authorize: (token, apiBaseUrl) => this.sdkService.authorize(token, apiBaseUrl),
                        authorizedGroupId: this.authorizedGroupId,
                        dispatch,
                        groupId,
                        isDev: this.isDev,
                        setAuthorizedGroupId: this.setAuthorizedGroupId,
                    });
                    await checkPermissions(SDK, mediaOptions);
                    checkIncomingCallData();
                    const conversationData = await this.startCallWithRetry(mediaOptions, undefined, onlyAdminCanShareMovie);
                    this.updateSDKMediaModifiers();
                    const callId = conversationData?.id;
                    this.sdkService.changeSDKStartCallOptions(options);
                    dispatch(setShowLoader(false));
                    dispatch({
                        type: E_ACTION.LOAD_PEERS,
                        conversation,
                        members: [],
                        peerId: EMPTY_PEER_ID,
                    });
                    dispatch({
                        type: E_ACTION.CHANGE_MODE,
                        mode: Mode.CALL,
                    });
                    if (openManagement) {
                        dispatch(toggleModal(ModalType.MANAGEMENT, { view: ManagementModalView.MAIN }));
                    }
                    if (options?.createLink) {
                        if (callId) {
                            loadAndCopyJoinLink(dispatch, callId, groupId);
                        }
                        else {
                            dispatch({
                                type: E_ACTION.SET_START_OPTIONS,
                                data: options,
                            });
                        }
                    }
                    callStatDataStorage.set({
                        timeStart: Date.now(),
                        isOutgoingCall: true,
                        entryPoint: entryPoint,
                        startType: isWithVideo ? CallType.VIDEO : CallType.AUDIO,
                        isGroupCall: true,
                    });
                    const stats = {
                        call_event_type: isWithVideo
                            ? ClickHouseEventType.OUTGOING_CALL_STARTED_VIDEO
                            : ClickHouseEventType.OUTGOING_CALL_STARTED_AUDIO,
                        session_id: callId,
                        peer_id: EMPTY_PEER_ID,
                        device_id: this.statDeviceId,
                        is_group_call: true,
                        source: entryPoint,
                        group_call_users_count: 1,
                    };
                    sendStats(stats.call_event_type, {
                        session_id: callId,
                        peer_id: EMPTY_PEER_ID,
                        source: entryPoint,
                        group_call_users_count: 1,
                        is_group_call: true,
                    });
                    if (isWithVideo) {
                        sendStats(ClickHouseEventType.VIDEO_SETTINGS, {
                            reason: getVideoResolutionStatsValue(this.config.enableHDVideo),
                        });
                    }
                    mailRuCounter.push(EMailRuGoals.StartGroupCall);
                    return conversationData;
                }
                catch (err) {
                    this.setIsInActiveCall(false);
                    dispatch(setShowLoader(false));
                    if (err === CallErrorType.ALREADY_HAS_INCOMING_CALL) {
                        this.handleErrorSilently(err);
                        return;
                    }
                    this.handleCallStartError(err, true);
                }
            };
            this.startGroupCall = async (peerId, conversationData, preselectedIds, isWithVideo, entryPoint, openManagement = true, deferredStreamId = null, options = {}) => {
                const SDK = this.sdkService.getSdk();
                const { dispatch } = this.stateBridge;
                const checkIncomingCallData = () => {
                    if (this.incomingCallData) {
                        throw CallErrorType.ALREADY_HAS_INCOMING_CALL;
                    }
                };
                try {
                    const mediaOptions = this.getMediaOptions({
                        isWithVideo,
                        isWithAudio: true,
                    });
                    /**
                     * фильтруем входные данные.
                     * анонимам и ботом не нужно делать дозвон
                     */
                    const preselectedPeerIds = preselectedIds ? preselectedIds.filter(isUserPeer) : [];
                    if (preselectedIds && preselectedIds.length !== preselectedPeerIds.length) {
                        SDK.debugMessage(DebugMessageType.WARN, 'Some ids cannot get into the call.', preselectedIds.filter((id) => !isUserPeer(id)));
                    }
                    if (this.isInActiveCall) {
                        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
                        return Promise.reject(CallErrorType.ALREADY_IN_CALL).catch(this.handleErrorSilently);
                    }
                    this.setIsInActiveCall(true);
                    dispatch(setShowLoader(true));
                    await this.waitAuthorization();
                    await checkAuthByGroupId({
                        authorize: (token, apiBaseUrl) => this.sdkService.authorize(token, apiBaseUrl),
                        authorizedGroupId: this.authorizedGroupId,
                        dispatch,
                        groupId: 0,
                        isDev: this.isDev,
                        setAuthorizedGroupId: this.setAuthorizedGroupId,
                    });
                    await checkPermissions(SDK, mediaOptions);
                    const [conversation, members, originalConversation] = await loadConversationData(dispatch, peerId, conversationData, true);
                    const chatMembers = await this.messagesService.getChatMembers(this.myPeerId, peerId);
                    checkIncomingCallData();
                    setConversationData(dispatch, { conversation, members, originalConversation, vkId: peerId });
                    if (chatMembers) {
                        dispatch(setChatInfo({ count: chatMembers.count, conversation, members: chatMembers.members }));
                    }
                    const resConversationData = await this.startCallWithRetry(mediaOptions, peerId);
                    this.updateSDKMediaModifiers();
                    this.sdkService.changeSDKStartCallOptions(options);
                    dispatch(setShowLoader(false));
                    dispatch({
                        type: E_ACTION.CHANGE_MODE,
                        mode: Mode.CALL,
                        peerId: vkIdToPeerId(peerId),
                    });
                    if (openManagement) {
                        if (preselectedPeerIds && preselectedPeerIds.length) {
                            dispatch({
                                type: E_ACTION.GROUP_CALL_SETUP,
                                open: true,
                                peerId: vkIdToPeerId(peerId),
                                preselectedIds: preselectedPeerIds,
                            });
                        }
                        else {
                            dispatch(toggleModal(ModalType.MANAGEMENT, { view: ManagementModalView.MAIN }));
                        }
                    }
                    if (deferredStreamId) {
                        dispatch({
                            type: E_ACTION.SET_TRANSLATION,
                            data: {
                                deferredId: deferredStreamId,
                            },
                        });
                    }
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
                    loadConversationDataPostProcess(dispatch, peerId, conversationData).catch(handlePromiseError);
                    callStatDataStorage.set({
                        timeStart: Date.now(),
                        isOutgoingCall: true,
                        startType: isWithVideo ? CallType.VIDEO : CallType.AUDIO,
                        entryPoint: entryPoint,
                        isGroupCall: true,
                    });
                    const stats = {
                        call_event_type: isWithVideo
                            ? ClickHouseEventType.OUTGOING_CALL_STARTED_VIDEO
                            : ClickHouseEventType.OUTGOING_CALL_STARTED_AUDIO,
                        session_id: resConversationData?.id,
                        device_id: this.statDeviceId,
                        peer_id: peerId,
                        is_group_call: true,
                        source: entryPoint,
                        group_call_users_count: 1,
                    };
                    sendStats(stats.call_event_type, {
                        session_id: resConversationData?.id,
                        peer_id: peerId,
                        source: entryPoint,
                        group_call_users_count: 1,
                        is_group_call: true,
                    });
                    if (isWithVideo) {
                        sendStats(ClickHouseEventType.VIDEO_SETTINGS, {
                            reason: getVideoResolutionStatsValue(this.config.enableHDVideo),
                        });
                    }
                    mailRuCounter.push(EMailRuGoals.StartGroupCall);
                }
                catch (err) {
                    this.setIsInActiveCall(false);
                    dispatch(setShowLoader(false));
                    if (err === CallErrorType.ALREADY_HAS_INCOMING_CALL) {
                        this.handleErrorSilently(err);
                        return;
                    }
                    this.handleCallStartError(err, isGroupCallByVkId(peerId));
                }
            };
            this.joinCallByLinkWithRetry = compose(this.sdkService.getSdk().joinCallByLink, tokenValidateRetryWrapper.bind(null, this.handleInvalidToken));
            this.joinCallByLink = ({ joinLink, conversationData, isWithVideo = false, isWithAudio = true, entryPoint, groupId = 0, deferredStreamId = undefined, vkJoinLink, miniAppId, renderChat, }) => {
                const SDK = this.sdkService.getSdk();
                const { dispatch } = this.stateBridge;
                const isJoinCallDelayedMedia = this.config.enableJoinCallDelayedMedia;
                const mediaOptions = this.getMediaOptions({
                    isWithAudio,
                    isWithVideo,
                });
                if (this.isInActiveCall) {
                    return Promise.reject(CallErrorType.ALREADY_IN_CALL).catch(this.handleErrorSilently);
                }
                this.setIsInActiveCall(true);
                dispatch({
                    type: E_ACTION.SET_ENTRYPOINT,
                    entryPoint: vou(entryPoint, { source: entryPoint, miniAppId }),
                });
                if (isParticipantAnonym(this.myPeerId)) {
                    return Promise.resolve()
                        .then(() => {
                        dispatch(setShowLoader(true));
                    })
                        .then(() => this.waitAuthorization())
                        .then(() => checkPermissions(SDK, mediaOptions))
                        .then(() => {
                        this.emitEvent(CallsEventType.CALL_STARTED);
                        return this.joinCallByLinkWithRetry(joinLink, mediaOptions).then(() => {
                            dispatch(setShowLoader(false));
                            dispatch({
                                type: E_ACTION.CHANGE_MODE,
                                mode: Mode.CALL,
                                joinLink,
                                vkJoinLink,
                            });
                        });
                    })
                        .then(() => {
                        this.updateSDKMediaModifiers();
                    })
                        .catch((err) => {
                        this.setIsInActiveCall(false);
                        dispatch(setShowLoader(false));
                        this.handleCallStartError(err, true);
                    });
                }
                let pId;
                if (renderChat) {
                    this.setLegacyRenderChat(renderChat);
                }
                return Promise.resolve()
                    .then(() => {
                    this.emitEvent(CallsEventType.CALL_STARTED);
                    dispatch(setShowLoader(true));
                })
                    .then(() => this.waitAuthorization())
                    .then(() => checkAuthByGroupId({
                    authorize: (token, apiBaseUrl) => this.sdkService.authorize(token, apiBaseUrl),
                    authorizedGroupId: this.authorizedGroupId,
                    dispatch,
                    groupId,
                    isDev: this.isDev,
                    setAuthorizedGroupId: this.setAuthorizedGroupId,
                }))
                    .then(() => checkPermissions(SDK, mediaOptions))
                    .then(() => {
                    const communityUserId = this.authorizedGroupId ? peerIdToVkId(this.myPeerId) : EMPTY_USER_ID;
                    const payload = communityUserId
                        ? JSON.stringify({ community_user_id: communityUserId })
                        : undefined;
                    const _mediaOptions = isJoinCallDelayedMedia ? [] : mediaOptions;
                    return this.joinCallByLinkWithRetry(joinLink, _mediaOptions, undefined, undefined, payload);
                })
                    .then(({ id: callId }) => getConversationByCall(callId))
                    .then(({ conversation }) => {
                    if (!conversation) {
                        return EMPTY_USER_ID;
                    }
                    const peerId = conversation.peer.id;
                    loadConversationData(dispatch, peerId, conversationData);
                    return peerId;
                })
                    .catch((error) => {
                    const errorCode = error?.apiError?.error_code || error?.error?.error_code;
                    if (skippedErrorCodes.includes(errorCode)) {
                        return 0;
                    }
                    throw error;
                })
                    .then(async (peerId) => {
                    pId = peerId;
                    if (isJoinCallDelayedMedia) {
                        const permissions = this.muteStates;
                        // падаем тихо, тк получим сообщение в коллбек onPermissionsError при попытке включить микрофон / камеру
                        if (mediaOptions.includes(MediaOption.AUDIO) && !permissions[MediaOption.AUDIO]) {
                            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
                            await SDK.toggleLocalAudio(true).catch(noop);
                        }
                        if (mediaOptions.includes(MediaOption.VIDEO) && !permissions[MediaOption.VIDEO]) {
                            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
                            await SDK.toggleLocalVideo(true).catch(noop);
                        }
                        this.updateSDKMediaModifiers();
                    }
                    dispatch(setShowLoader(false));
                    dispatch({
                        type: E_ACTION.CHANGE_MODE,
                        mode: Mode.CALL,
                        peerId: vkIdToPeerId(peerId),
                        joinLink,
                    });
                    if (entryPoint === CallStatSource.MINI_APP) {
                        dispatch({
                            type: E_ACTION.CHANGE_UI_MODE,
                            mode: UIMode.COLLAPSED,
                        });
                    }
                    if (deferredStreamId) {
                        dispatch({
                            type: E_ACTION.SET_TRANSLATION,
                            data: { deferredId: deferredStreamId },
                        });
                    }
                    if (peerId) {
                        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
                        loadConversationDataPostProcess(dispatch, peerId, conversationData).catch(handlePromiseError);
                    }
                    sendStats(ClickHouseEventType.GROUP_CALL_JOINED, {
                        peer_id: peerId ?? EMPTY_PEER_ID,
                        is_group_call: true,
                        group_call_users_count: this.statGroupCallUsersCount,
                        source: entryPoint,
                        mini_app_id: miniAppId,
                    });
                    if (isWithVideo) {
                        sendStats(ClickHouseEventType.VIDEO_SETTINGS, {
                            reason: getVideoResolutionStatsValue(this.config.enableHDVideo),
                        });
                    }
                })
                    .catch((err) => {
                    this.setIsInActiveCall(false);
                    dispatch(setShowLoader(false));
                    sendStats(ClickHouseEventType.GROUP_CALL_JOIN_FAILED, {
                        peer_id: pId ?? EMPTY_PEER_ID,
                        is_group_call: true,
                        group_call_users_count: this.statGroupCallUsersCount,
                        source: entryPoint,
                        mini_app_id: miniAppId,
                        error: getErrorCode(err),
                    });
                    this.handleCallStartError(err, true);
                    throw err;
                });
            };
            this.joinRoomByLink = async ({ vkJoinLink, voiceRoomMode, roomName, roomDescription, isAudioMode, joinLink, ownerId, groups, ...params }) => {
                const { dispatch } = this.stateBridge;
                try {
                    if (!joinLink) {
                        throw new Error('joinLink is not defined');
                    }
                    batch(() => {
                        dispatch(setIsVoiceRoom(true));
                        dispatch(setVoiceRoomMode(voiceRoomMode));
                        dispatch(setVoiceRoomInitialData({
                            roomName,
                            roomDescription,
                            isAudioMode,
                            joinLink: vkJoinLink,
                            ownerId,
                            groups,
                        }));
                    });
                    return this.joinCallByLink({
                        joinLink,
                        entryPoint: CallStatSource.LINK,
                        ...params,
                    });
                }
                catch (e) {
                    handlePromiseError(e);
                }
            };
            this.showJoinPopup = (vkJoinLink, entryPoint, hideCallViaNativeApp) => {
                const SDK = this.sdkService.getSdk();
                const { dispatch } = this.stateBridge;
                const mode = this.callMode;
                if (mode === Mode.CALL || mode === Mode.INCOMING) {
                    return Promise.reject(CallErrorType.ALREADY_IN_CALL).catch(() => {
                        dispatch({
                            type: E_ACTION.ERROR,
                            text: this.getLang('calls_already_in_call_error'),
                        });
                    });
                }
                dispatch(setShowLoader(true));
                return messagesGetCallPreview(vkJoinLink)
                    .then((response) => normalizePreviewData(this.getLang, response))
                    .then((data) => {
                    if (data.room && this.config.enableCheckIsCallVoiceRoomHash) {
                        // @ts-expect-error TS2322: Type 'string | undefined' is not assignable to type 'string'.
                        window.location.href = data.room.join_link;
                        return;
                    }
                    dispatch(setShowLoader(false));
                    dispatch({
                        type: E_ACTION.JOIN,
                        data: { ...data, hideCallViaNativeApp },
                        entryPoint: vou(entryPoint, { source: entryPoint }),
                    });
                })
                    .catch((error) => {
                    this.emitEvent(CallsEventType.ERROR, { error });
                    SDK.debugMessage(DebugMessageType.WARN, 'messagesGetCallPreview', error);
                    dispatch(setShowLoader(false));
                    const errorCode = error?.error?.error_code || error?.code;
                    if (errorCode === ServerError.CALL_PASSWORD_IS_MISSING) {
                        this.legacyShowJoinCallByLinkPopup(vkJoinLink);
                        return;
                    }
                    const isShortLink = SHORT_LINK_REGEX.test(vkJoinLink);
                    const text = getTextForApiErrorByCode(errorCode, true, this.getLang);
                    console.error(text);
                    dispatch({
                        type: E_ACTION.ERROR,
                        text: text,
                        handleType: isShortLink ? ErrorHandleType.EMPTY : ErrorHandleType.FATAL,
                    });
                });
            };
            this.showCallByNamePopup = (vkId, entryPoint, joinLink, extraArgs) => {
                const mode = this.callMode;
                const { dispatch } = this.stateBridge;
                if (mode === Mode.CALL || mode === Mode.INCOMING) {
                    return Promise.reject(CallErrorType.ALREADY_IN_CALL).catch(() => {
                        dispatch({
                            type: E_ACTION.ERROR,
                            text: this.getLang('calls_already_in_call_error'),
                        });
                    });
                }
                return Promise.resolve()
                    .then(() => {
                    dispatch(setShowLoader(true));
                })
                    .then(() => {
                    dispatch(setShowLoader(false));
                    dispatch({
                        type: E_ACTION.CALL_BY_NAME,
                        data: {
                            ...extraArgs,
                            peerId: vkId,
                            joinLink: joinLink,
                            entryPoint: entryPoint,
                        },
                    });
                })
                    .catch(() => {
                    dispatch(setShowLoader(false));
                });
            };
            this.showCreateCallByLink = (entryPoint) => {
                const mode = this.callMode;
                if (mode === Mode.CALL || mode === Mode.INCOMING) {
                    return Promise.reject(CallErrorType.ALREADY_IN_CALL).catch(this.handleErrorSilently);
                }
                return Promise.resolve().then(() => {
                    this.stateBridge.dispatch({
                        type: E_ACTION.CHANGE_MODE,
                        mode: Mode.CREATE_CALL,
                        entryPoint: vou(entryPoint, { source: entryPoint }),
                    });
                });
            };
            this.showShareQrCode = (textToEncode, qrFileName) => {
                return Promise.resolve().then(() => {
                    this.stateBridge.dispatch(toggleModal(ModalType.QR_CODE, {
                        textToEncode,
                        qrFileName,
                        isSferum: this.config.sferum,
                    }));
                });
            };
            this.showPlanCalendarEventPopup = () => {
                if (this.callMode === Mode.INCOMING) {
                    return Promise.reject(CallErrorType.ALREADY_IN_CALL).catch(this.handleErrorSilently);
                }
                return Promise.resolve().then(() => {
                    this.stateBridge.dispatch(toggleModal(ModalType.PLAN_CALENDAR_EVENT));
                });
            };
        }
        createMethods() {
            const SDK = this.sdkService.getSdk();
            bridge.debugMessage = SDK.debugMessage;
            bridge.acceptCall = this.acceptCall;
            bridge.call = this.p2pCall;
            bridge.startCall = this.startCall;
            bridge.startGroupCall = this.startGroupCall;
            bridge.joinCallByLink = this.joinCallByLink;
            bridge.joinRoomByLink = this.joinRoomByLink;
            bridge.showJoinPopup = this.showJoinPopup;
            bridge.showCallByNamePopup = this.showCallByNamePopup;
            bridge.checkOnlyAuthByGroupId = this.checkOnlyAuthByGroupId;
            bridge.showCreateCallByLinkPopup = this.showCreateCallByLink;
            bridge.showShareQrCodePopup = this.showShareQrCode;
            bridge.showPlanCalendarEventPopup = this.showPlanCalendarEventPopup;
            bridge.checkOnlyAuthByGroupId = this.checkOnlyAuthByGroupId;
        }
        get config() {
            return this.configService.getConfig();
        }
        get statDeviceId() {
            return this.config.deviceId;
        }
        get myPeerId() {
            return this.stateBridge.me;
        }
        get opponentPeerId() {
            return this.stateBridge.peer;
        }
        get groupId() {
            return this.stateBridge.groupId;
        }
        get callData() {
            return this.stateBridge.callData;
        }
        get callMode() {
            return this.stateBridge.mode;
        }
        get muteStates() {
            return this.stateBridge.permissions;
        }
        get statGroupCallUsersCount() {
            const { devices, maps, me, participants } = this.stateBridge;
            return getActiveParticipantsCount({ devices, maps, me, participants });
        }
        get ipSettingEnabled() {
            return this.stateBridge.ipSettingEnabled;
        }
        get isDev() {
            return this.stateBridge.isDev;
        }
        get isRestrictedConversation() {
            return this.stateBridge.restrictedConversation;
        }
        get authorizedGroupId() {
            return this.legacyBridge.authorizedGroupId;
        }
        get incomingCallData() {
            return this.legacyBridge.incomingCallData;
        }
        deleteIncomingCallData() {
            delete this.legacyBridge.incomingCallData;
        }
        get isInActiveCall() {
            return this.callService.isInActiveCall;
        }
        setLegacyRenderChat(renderChat) {
            this.legacyBridge.setRenderChat(renderChat);
        }
        legacyShowJoinCallByLinkPopup(initialJoinLink) {
            this.legacyBridge.showJoinCallByLinkPopup(initialJoinLink);
        }
        cacheFriends(friends, count) {
            this.stateBridge.dispatch(setFriends({ count, members: friends }));
        }
        shouldForceRelay(deps) {
            const { ipSettingEnabled } = this;
            const { privacySettings } = this.stateBridge;
            const { getIsFriend, peerId } = deps;
            if (!ipSettingEnabled || privacySettings.callsIp === 'all') {
                return Promise.resolve(false);
            }
            // Групповой звонок при включенной настройке всегда отправляем через сервер
            if (isChatPeer(peerId)) {
                return Promise.resolve(true);
            }
            // Передали функцию при инициализации
            const isFriend = getIsFriend(peerId);
            if (isFriend !== undefined) {
                return Promise.resolve(!isFriend);
            }
            // Нужно загрузить друзей
            return exponentialRetry(this.loadFriends, { errorType: CallErrorType.CANT_REACH_API })().then((data) => {
                if (data) {
                    this.cacheFriends(data.friends, data.count);
                    return Promise.resolve(true);
                }
                return this.shouldForceRelay(deps);
            });
        }
    };
    InternalBridgeWrapperImpl = __decorate([
        scope.container(),
        __metadata("design:paramtypes", [CallService,
            CallsConfigService,
            FriendsService,
            LangUtils,
            MessagesService,
            CallsSdkService,
            StateBridge,
            VmojiService])
    ], InternalBridgeWrapperImpl);
    return InternalBridgeWrapperImpl;
};
//# sourceMappingURL=InternalBridge.js.map