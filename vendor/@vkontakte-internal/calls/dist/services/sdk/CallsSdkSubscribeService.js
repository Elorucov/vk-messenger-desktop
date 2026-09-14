import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { CallsSdkService } from './CallsSdkService';
import { CallDirection, ChatRoomEventType, DebugMessageType, MediaType, ParticipantStatus, RoomsEventType, UserRole, } from '@vkontakte/calls-sdk';
import { getParticipantListChunk, } from '../../helpers/participantsListChunk';
import { StreamRegistry } from '../stream';
import { DevicesService } from '../devices';
import { LocalDeviceService } from '../localDevice';
import { PinnedParticipantService } from '../PinnedParticipantService';
import { convertParticipantStateFromSdk, createSdkParticipantState, getActiveParticipantsCount, getIsHandRaised, getIsHelpRequested, getMediaSettingsWithStreamMode, getNewStreamModeByDevice, getPeerIdDeviceInfo, isParticipantAnonym, isParticipantAnonymOrContact, isParticipantContact, } from '../../helpers/participant';
import { createUnsubscribes } from '../../helpers/serviceUnsubscribers';
import { WatchTogetherService } from '../../features/watchTogether/services/WatchTogetherService';
import { RoomsService } from '../../features/rooms/services/RoomsService';
import { CallsEventType, ClickHouseEventType, EMPTY_PEER_ID, EVideoOptionType, externalIdToString, FeatureNotification, getSharedMiniAppIdFromUrl, getSharingMiniAppParticipantId, isCreator, isGroupCall as getIsGroupCall, isGroupCallByPeer, isGroupCallByPeerAndMe, isSameExternalId, modalHasType, ModalType, Mode, NotificationType, participantIsAdmin, peerIdToVkId, vkIdToPeerId, isEmpty, objectForEach, getDecreasedPermissionsOnce, EMailRuGoals, mailRuCounter, getBrowserInfo, Platform, } from '@vkontakte-internal/calls-core';
import { E_ACTION, MediaError, ROOM_MAIN_ID, ROOM_UNDEFINED_ID, skippedErrorCodes, VOLUME_LEVEL_DETECTION, } from '../../constants';
import { StateBridge } from '../../utils/stateBridge';
import { CallService } from '../../services/call';
import { resetLocalStatusData, setLocalDratState, setLocalHandState, setRestrictedConversation, updateReactionsHistory, } from '../../actions';
import { callStatDataStorage } from '../../stats/callStatDataStorage';
import { eventBus } from '../eventBus';
import { EScreenSharingReason, sendStats } from '../../stats/clickHouse';
import { getMediaErrorMessage, getMediaErrorTitle } from '../../helpers/error';
import { createParticipantSelector } from '../../selectors';
import { videoOptionsStorage } from '../../helpers/localStorage';
import { isSameFeatureNotification, setFeatureNotification, } from '../../features/notifications/featureNotification';
import { screenShareNotVisibleStat } from '../../stats/ScreenShareNotVisible';
import { loadActiveCallDataAction, loadAndCopyJoinLink, loadCallParticipantsAccumulate, loadCallUrlLink, } from '../../actions/actions';
import { PermissionsService } from '../permissions';
import { checkAreRoomsClosed, loadConversationData } from './utils';
import { getConversationByCall } from '../backend';
import { handlePromiseError } from '../../helpers/logger';
import { isAuthedByGroupId, isWaitingHallEnabled } from '../../helpers/call';
import { loadWaitingHall, loadWaitingHallFromScratch } from '../waitingHall/waitingHallLegacy';
import { setWaitingHall } from '../../actions/waitingHall';
import { getBroadcastLink } from '../../helpers/url';
import { isMeRecordCreator } from '../../helpers/translation';
import { AdminMessagesController } from '../../features/adminMessages';
import { enterToRoomNotification, exitFromRoomNotification, roomsClosedNotification, } from '../../actions/room';
import { handleErrorScreenShare } from '../../hooks/useScreenShare';
import { ClickHouseService } from '../shared/ClickHouseService';
import { Langs } from '@vkontakte-internal/plugins';
import { CallsConfigService } from '../config';
import { ModalService } from '../modal';
import { localVolumeDetectorGenerator } from '../volumeDetector';
import { SpeakersService } from '../speakers';
import { fetchCallTokenWithApiBaseUrl } from '../fetchCallTokenWithApiBaseUrl';
import { getUpdatedSpeakerPeerId } from '../../reducers/changeParticipantIdHandlers';
import { ParticipantsService } from '../participants';
let CallsSdkSubscribeService = class CallsSdkSubscribeService {
    constructor(watchTogetherService, devicesService, localDeviceService, sdkService, streamRegistry, pinnedParticipantService, stateBridge, roomsService, callService, clickHouseService, langs, configService, permissionsService, modalService, speakersService, participantsService) {
        this.watchTogetherService = watchTogetherService;
        this.devicesService = devicesService;
        this.localDeviceService = localDeviceService;
        this.sdkService = sdkService;
        this.streamRegistry = streamRegistry;
        this.pinnedParticipantService = pinnedParticipantService;
        this.stateBridge = stateBridge;
        this.roomsService = roomsService;
        this.callService = callService;
        this.clickHouseService = clickHouseService;
        this.langs = langs;
        this.configService = configService;
        this.permissionsService = permissionsService;
        this.modalService = modalService;
        this.speakersService = speakersService;
        this.participantsService = participantsService;
        this._unsubscribes = createUnsubscribes();
        this.init = () => {
            this._unsubscribes.add(this.sdkService.subscribe('onLocalStream', this.onLocalStream), this.sdkService.subscribe('onLocalStreamUpdate', this.onLocalStreamUpdate), this.sdkService.subscribe('onLocalLive', this.onLocalLive), this.sdkService.subscribe('onLocalLiveUpdate', this.onLocalLiveUpdate), this.sdkService.subscribe('onLocalSharedMovieInfo', this.onLocalSharedMovieInfo), this.sdkService.subscribe('onLocalSharedMovieStoppedInfo', this.onLocalSharedMovieStoppedInfo), this.sdkService.subscribe('onScreenStream', this.onScreenStream), this.sdkService.subscribe('onVmojiStream', this.onVmojiStream), this.sdkService.subscribe('onPermissionsError', this.onPermissionsError), this.sdkService.subscribe('onRemoteStream', this.onRemoteStream), this.sdkService.subscribe('onRemoteLive', this.onRemoteLive), this.sdkService.subscribe('onRemoteLiveUpdate', this.onRemoteLiveUpdate), this.sdkService.subscribe('onRemoteSharedMovieInfo', this.onRemoteSharedMovieInfo), this.sdkService.subscribe('onRemoteSharedMovieStoppedInfo', this.onRemoteSharedMovieStoppedInfo), this.sdkService.subscribe('onRemoteStreamSuspended', this.onRemoteStreamSuspended), this.sdkService.subscribe('onRemoteSharedUrl', this.onRemoteSharedUrl), this.sdkService.subscribe('onRemoteScreenStream', this.onRemoteScreenStream), this.sdkService.subscribe('onRemoteVmojiStream', this.onRemoteVmojiStream), this.sdkService.subscribe('onParticipantVmojiUpdate', this.onParticipantVmojiUpdate), this.sdkService.subscribe('onRemoteMediaSettings', this.onRemoteMediaSettings), this.sdkService.subscribe('onRemoteStatus', this.onRemoteStatus), this.sdkService.subscribe('onRemoteRemoved', this.onRemoteRemoved), this.sdkService.subscribe('onVideoSuspendSuggest', this.onVideoSuspendSuggest), this.sdkService.subscribe('onParticipantJoined', this.onParticipantJoined), this.sdkService.subscribe('onParticipantAdded', this.onParticipantAdded), this.sdkService.subscribe('onParticipantIdChanged', this.onParticipantIdChanged), this.sdkService.subscribe('onAcceptedCall', this.onAcceptedCall), this.sdkService.subscribe('onCallAccepted', this.onCallAccepted), this.sdkService.subscribe('onConversation', this.onConversation), this.sdkService.subscribe('onCallState', this.onCallState), this.sdkService.subscribe('onSpeakerChanged', this.onSpeakerChanged), this.sdkService.subscribe('onFingerprintChange', this.onFingerprintChange), this.sdkService.subscribe('onLocalVolume', this.onLocalVolume), this.sdkService.subscribe('onCustomData', this.onCustomData), this.sdkService.subscribe('onNetworkStatusChanged', this.onNetworkStatusChanged), this.sdkService.subscribe('onLocalNetworkStatusChanged', this.onLocalNetworkStatusChanged), this.sdkService.subscribe('onLocalParticipantState', this.onLocalParticipantState), this.sdkService.subscribe('onRemoteParticipantState', this.onRemoteParticipantState), this.sdkService.subscribe('onRolesChanged', this.onRolesChanged), this.sdkService.subscribe('onRemoteParticipantsState', this.onRemoteParticipantsState), this.sdkService.subscribe('onLocalRolesChanged', this.onLocalRolesChanged), this.sdkService.subscribe('onRecordStarted', this.onRecordStarted), this.sdkService.subscribe('onRecordStopped', this.onRecordStopped), this.sdkService.subscribe('onLocalPin', this.onLocalPin), this.sdkService.subscribe('onPinnedParticipant', this.onPinnedParticipant), this.sdkService.subscribe('onOptionsChanged', this.onOptionsChanged), this.sdkService.subscribe('onLocalStatus', this.onLocalStatus), this.sdkService.subscribe('onChatRoomUpdated', this.onChatRoomUpdated), this.sdkService.subscribe('onJoinLinkChanged', this.onJoinLinkChanged), this.sdkService.subscribe('onFeedback', this.onFeedback), this.sdkService.subscribe('onChatMessage', this.onChatMessage), this.sdkService.subscribe('onRoomStart', this.onRoomStart), this.sdkService.subscribe('onRoomsUpdated', this.onRoomsUpdated), this.sdkService.subscribe('onRoomUpdated', this.onRoomUpdated), this.sdkService.subscribe('onRoomSwitched', this.onRoomSwitched), this.sdkService.subscribe('onRoomParticipantsUpdated', this.onRoomParticipantsUpdated), this.sdkService.subscribe('onAsrSet', this.onAsrSet), this.sdkService.subscribe('onAsrStarted', this.onAsrStarted), this.sdkService.subscribe('onAsrStopped', this.onAsrStopped), this.sdkService.subscribe('onAsrTranscription', this.onAsrTranscription), this.sdkService.subscribe('onPromotionApproved', this.onPromotionApproved), this.sdkService.subscribe('onPeerRegistered', this.onPeerRegistered));
        };
        this.clear = () => {
            this._unsubscribes.clear();
        };
        this.getLang = (key, isRawOrCount) => isRawOrCount === 'raw' ? this.langs.getLang(key, true) : this.langs.getLang(key);
        this.participantStatusDataChangeHandler = (externalId, participantState) => {
            const { devices, handState, localDevice, me, modal, participants } = this.stateBridge;
            const statusData = convertParticipantStateFromSdk(participantState);
            const id = externalIdToString(externalId);
            const participantId = externalId.id;
            const prevHandState = devices[id]?.statusData?.hand?.state ?? handState?.[id];
            const prevDratState = getIsHelpRequested(devices[id]);
            const wasRaised = !!prevHandState;
            const newHandState = getIsHandRaised({ statusData });
            const newDratState = getIsHelpRequested({ statusData });
            const inMyRoom = this.roomsService.checkIsInMyRoom(externalId);
            if (wasRaised !== newHandState || prevDratState !== newDratState) {
                this.devicesService.throttleAccumulateDispatchParticipant(externalId, {
                    statusData,
                });
            }
            if (inMyRoom && wasRaised !== newHandState) {
                const hasName = !!participants[externalId.id]?.name;
                if (Boolean(statusData?.hand) &&
                    hasName &&
                    // проверяем, что это не мой же, но другой девайс поднял руку
                    participantId !== me) {
                    this.stateBridge.dispatch({
                        type: E_ACTION.CALL_NOTIFICATION,
                        notification: {
                            type: wasRaised ? NotificationType.LOWERED_HAND : NotificationType.RAISED_HAND,
                            data: participantId,
                            hidden: wasRaised,
                        },
                    });
                }
            }
            if (participantIsAdmin(localDevice) && prevDratState !== newDratState) {
                if (newDratState) {
                    if (!inMyRoom) {
                        this.modalService.openModal(ModalType.ROOM_HELP_REQUESTED, {
                            externalId,
                        });
                    }
                }
                else if (modalHasType(modal, ModalType.ROOM_HELP_REQUESTED)) {
                    // Если запрос отменен и открыт попап с предложением помочь, то скрываем его
                    this.modalService.closeModal();
                }
            }
        };
        this.refetchParticipants = async (roomId) => {
            const participantsChunk = await getParticipantListChunk(this.sdk, { count: 0, roomId });
            this.sdk.debugMessage(DebugMessageType.WARN, 'refetchParticipants', { participantsChunk });
            const participants = participantsChunk.participants;
            this.roomsService.updateRoomParticipants({
                roomId,
                participantIds: participants.map((p) => p.uid),
                myExternalId: this.localDeviceService.externalId,
            });
            this.callService.addParticipantsToStoreThrottled({
                participants,
                targetRoomId: roomId,
                toggleScreenShareForce: true,
            });
        };
        this.onLocalStream = (stream, mediaSettings) => {
            this.logWarn('onLocalStream', stream, mediaSettings);
            this.localDeviceService.setLocalDevice({
                stream,
                mediaSettings,
                streamMode: getNewStreamModeByDevice(MediaType.CAMERA, this.localDeviceService.device, !!stream),
            });
            callStatDataStorage.set({
                hadVideoEnabled: mediaSettings.isVideoEnabled,
            });
        };
        this.onLocalStreamUpdate = (mediaSettings, kind) => {
            this.logWarn('onLocalStreamUpdate', mediaSettings, kind);
        };
        this.onLocalLive = (externalId, movie) => {
            const { streamName, stream, mediaType } = movie;
            this.logWarn('onLocalLive', externalId, streamName, stream, mediaType);
            if (!stream) {
                const data = {
                    movieStreamStoppedInfo: null,
                };
                if (this.localDeviceService.device.movieStreamInfo?.movieId === Number(streamName)) {
                    data.movieStreamInfo = null;
                    data.movieStream = null;
                }
                this.localDeviceService.setLocalDevice(data);
                return;
            }
            this.watchTogetherService.setStream(stream);
            this.localDeviceService.setLocalDevice({
                movieStream: stream,
                streamMode: getNewStreamModeByDevice(mediaType, this.localDeviceService.device, !!stream),
                movieStreamStoppedInfo: null,
            });
        };
        this.onLocalLiveUpdate = (externalId, movieState) => {
            this.logWarn('onLocalLiveUpdate', externalId, movieState);
            this.watchTogetherService.setMovieState(movieState);
        };
        this.onLocalSharedMovieInfo = (externalId, sharedMovieInfo) => {
            this.logWarn('onLocalSharedMovieInfo', externalId, sharedMovieInfo);
            if (this.pinnedParticipantService.mediaSharingPinnedParticipant) {
                this.pinnedParticipantService.clearMediaSharingPinnedParticipant();
            }
            this.watchTogetherService.setMovieInfo(sharedMovieInfo);
            this.watchTogetherService.setOwner(externalId);
            this.pinnedParticipantService.setWatchTogetherPinnedParticipant(externalId);
            this.localDeviceService.setLocalDevice({
                movieStreamInfo: sharedMovieInfo,
                movieStreamStoppedInfo: null,
            });
        };
        this.onLocalSharedMovieStoppedInfo = (externalId, sharedMovieStoppedInfo) => {
            this.logWarn('onLocalSharedMovieStoppedInfo', externalId, sharedMovieStoppedInfo);
            this.watchTogetherService.clear();
            this.pinnedParticipantService.clearWatchTogetherPinnedParticipant();
            this.localDeviceService.setLocalDevice({
                movieStreamStoppedInfo: sharedMovieStoppedInfo,
                movieStream: null,
                movieStreamInfo: null,
                streamMode: getNewStreamModeByDevice(sharedMovieStoppedInfo.source, this.localDeviceService.device, false),
            });
        };
        this.onScreenStream = (stream, mediaSettings) => {
            this.logWarn('onScreenStream', stream, mediaSettings);
            if (stream) {
                eventBus.emit(CallsEventType.SCREEN_SHARING_STARTED);
            }
            else {
                eventBus.emit(CallsEventType.SCREEN_SHARING_STOPPED);
            }
            this.localDeviceService.setLocalDevice({
                screenSharingStream: stream,
                mediaSettings,
                streamMode: getNewStreamModeByDevice(MediaType.SCREEN, this.localDeviceService.device, !!stream),
            });
            if (stream) {
                let reason;
                switch (true) {
                    case Boolean(mediaSettings.isFastScreenSharingEnabled && mediaSettings.isAudioSharingEnabled): {
                        reason = EScreenSharingReason.FastAudioScreenSharing;
                        break;
                    }
                    case Boolean(mediaSettings.isAudioSharingEnabled): {
                        reason = EScreenSharingReason.AudioScreenSharing;
                        break;
                    }
                    case Boolean(mediaSettings.isFastScreenSharingEnabled): {
                        reason = EScreenSharingReason.FastScreenSharing;
                        break;
                    }
                    default: {
                        reason = EScreenSharingReason.HDScreenSharing;
                    }
                }
                this.clickHouseService.sendStats(ClickHouseEventType.SCREEN_SHARING_STARTED, { reason });
            }
            else {
                this.clickHouseService.sendStats(ClickHouseEventType.SCREEN_SHARING_STOPPED);
            }
        };
        this.onVmojiStream = (stream, mediaSettings) => {
            this.logWarn('onVmojiStream', stream, mediaSettings);
            this.localDeviceService.setLocalDevice({
                animojiStream: stream,
                mediaSettings,
                streamMode: getNewStreamModeByDevice(MediaType.CAMERA, this.localDeviceService.device, !!stream),
            });
        };
        this.onPermissionsError = (error) => {
            this.logWarn('onPermissionsError', error);
            if (this.stateBridge.mode === Mode.CALL) {
                switch (error) {
                    case MediaError.CAMERA_PERMISSION:
                    case MediaError.CAMERA_ACCESS: {
                        void this.sdk.toggleLocalVideo(false);
                        break;
                    }
                    case MediaError.MIC_ACCESS:
                    case MediaError.MIC_NOT_FOUND: {
                        void this.sdk.toggleLocalAudio(false);
                        break;
                    }
                    case MediaError.SCREEN_PERMISSION:
                    case MediaError.SCREEN_ACCESS: {
                        void this.sdk.captureScreen(false);
                        break;
                    }
                    case MediaError.MIC_CAMERA_PERMISSION:
                        void this.sdk.toggleLocalAudio(false);
                        void this.sdk.toggleLocalVideo(false);
                        break;
                }
                this.stateBridge.dispatch({
                    type: E_ACTION.ERROR,
                    text: getMediaErrorMessage(error, this.getLang),
                    title: getMediaErrorTitle(error, this.getLang),
                });
            }
        };
        this.onRemoteStream = (externalId, stream) => {
            this.logWarn('onRemoteStream', externalId.id, stream);
            const device = this.devicesService.getDeviceByExternalId(externalId);
            const streamMode = getNewStreamModeByDevice(MediaType.CAMERA, device, !!stream);
            this.streamRegistry.setStream(externalId, MediaType.CAMERA, stream);
            // throttled version causes bug when streamMode may be overridden during batching
            this.devicesService.updateParticipantsBatch({
                [externalIdToString(externalId)]: {
                    stream,
                    streamMode,
                    externalId,
                },
            });
        };
        this.onRemoteLive = (externalId, movieData) => {
            const { streamName, stream, mediaType } = movieData;
            this.logWarn('onRemoteLive', { externalId, streamName, stream, mediaType });
            const device = this.devicesService.getDeviceByExternalId(externalId);
            const nextDeviceState = { externalId };
            if (stream) {
                this.streamRegistry.setStream(externalId, mediaType, stream);
                this.watchTogetherService.setStream(stream);
                nextDeviceState.movieStream = stream;
                nextDeviceState.streamMode = getNewStreamModeByDevice(mediaType, device, !!stream);
            }
            else {
                if (device?.movieStreamInfo?.movieId === Number(streamName)) {
                    this.streamRegistry.setStream(externalId, mediaType, null);
                    nextDeviceState.movieStreamInfo = null;
                    nextDeviceState.movieStream = null;
                }
                nextDeviceState.movieStreamStoppedInfo = null;
            }
            this.devicesService.throttleAccumulateDispatchParticipant(externalId, nextDeviceState);
        };
        this.onRemoteLiveUpdate = (externalId, movieState) => {
            this.logWarn('onRemoteLiveUpdate', externalId.id, movieState);
            this.watchTogetherService.setMovieState(movieState);
        };
        this.onRemoteSharedMovieInfo = (externalId, sharedMovieInfo, roomId) => {
            this.logWarn('onRemoteSharedMovieInfo', {
                externalId,
                sharedMovieInfo,
                roomId,
            });
            if (this.roomsService.equalsToMyRoom(roomId)) {
                this.watchTogetherService.setMovieInfo(sharedMovieInfo);
                this.watchTogetherService.setOwner(externalId);
                this.pinnedParticipantService.setWatchTogetherPinnedParticipant(externalId);
            }
            if (this.pinnedParticipantService.mediaSharingOldPinnedParticipant) {
                this.pinnedParticipantService.clearMediaSharingPinnedParticipant();
            }
            this.devicesService.throttleAccumulateDispatchParticipant(externalId, {
                movieStreamInfo: sharedMovieInfo,
                movieStreamStoppedInfo: null,
            });
            this.stateBridge.dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: NotificationType.SHARE_MOVIE_STARTED,
                    data: externalId.id,
                    hidden: true,
                },
            });
        };
        this.onRemoteSharedMovieStoppedInfo = (externalId, sharedMovieStoppedInfo, roomId) => {
            this.logWarn('onRemoteSharedMovieStoppedInfo', {
                externalId,
                sharedMovieStoppedInfo,
                roomId,
            });
            const device = this.devicesService.getDeviceByExternalId(externalId);
            if (this.roomsService.equalsToMyRoom(roomId)) {
                this.watchTogetherService.clear();
                this.pinnedParticipantService.clearWatchTogetherPinnedParticipant();
            }
            this.streamRegistry.setStream(externalId, MediaType.MOVIE, null);
            this.devicesService.throttleAccumulateDispatchParticipant(externalId, {
                movieStreamStoppedInfo: sharedMovieStoppedInfo,
                movieStream: null,
                movieStreamInfo: null,
                streamMode: device ? getNewStreamModeByDevice(sharedMovieStoppedInfo.source, device, false) : null,
            });
            this.stateBridge.dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: NotificationType.SHARE_MOVIE_STOPPED,
                    data: externalId.id,
                    hidden: true,
                },
            });
        };
        this.onRemoteStreamSuspended = (externalId, mediaType, isSuspended) => {
            this.logWarn('onRemoteStreamSuspended', {
                externalId,
                mediaType,
                isSuspended,
            });
            if (isSuspended) {
                if (!this.streamRegistry.hasStream(externalId, mediaType)) {
                    return;
                }
                this.streamRegistry.setStreamSuspended(externalId, mediaType, true);
                if (!this.stateBridge.featureNotification.shownTypes.has(FeatureNotification.VideoSuspendApplied)) {
                    const shownTimes = videoOptionsStorage.queryOption(EVideoOptionType.VIDEO_SUSPEND_BANNER_TIMES);
                    if (shownTimes < 5) {
                        this.stateBridge.dispatch(setFeatureNotification(FeatureNotification.VideoSuspendApplied));
                        videoOptionsStorage.saveOption(EVideoOptionType.VIDEO_SUSPEND_BANNER_TIMES, shownTimes + 1);
                    }
                }
            }
            else {
                this.streamRegistry.setStreamSuspended(externalId, mediaType, false);
            }
        };
        this.onRemoteSharedUrl = (externalId, sharedUrl, roomId) => {
            this.logWarn('onRemoteSharedUrl', externalId, sharedUrl, roomId);
            const internalAppId = sharedUrl && getSharedMiniAppIdFromUrl(sharedUrl);
            this.logWarn('onRemoteSharedUrl', {
                externalId,
                sharedUrl,
                roomId,
            });
            if (sharedUrl && !internalAppId && this.localDeviceService.isMeAnonym) {
                // Do not start legacy whiteboard for anonym
                this.logWarn('URL sharing is not supported for anonyms');
                return;
            }
            const isMyRoom = this.roomsService.equalsToMyRoom(roomId);
            if (!sharedUrl && isSameExternalId(externalId, this.localDeviceService.externalId)) {
                // stop could be made by server, e.g. when user's room changed
                // do nothing
            }
            else if (isMyRoom) {
                const dispatchAction = (sharedUrlWithParams) => {
                    const device = this.devicesService.getDeviceByExternalId(externalId);
                    // throttled version causes bug when streamMode may be overridden during batching
                    this.devicesService.updateParticipantsBatch({
                        [externalIdToString(externalId)]: {
                            sharedUrl: sharedUrlWithParams,
                            streamMode: getNewStreamModeByDevice(MediaType.SHARED_URL, device, !!sharedUrlWithParams),
                            externalId,
                        },
                    });
                    this.callService.toggleUrlSharingForParticipant(!!sharedUrlWithParams, externalId);
                };
                if (!sharedUrl) {
                    dispatchAction();
                }
                else if (internalAppId) {
                    // У текущего юзера-"ученика" может быть не включен тоггл, а у админа-"учителя" включен
                    // поэтому определяем какое приложение открывать на основании состава url
                    dispatchAction(sharedUrl);
                }
            }
        };
        this.onRemoteScreenStream = (externalId, stream) => {
            this.logWarn('onRemoteScreenStream', externalId.id, stream);
            const device = this.devicesService.getDeviceByExternalId(externalId);
            const streamMode = getNewStreamModeByDevice(MediaType.SCREEN, device, !!stream);
            this.streamRegistry.setStream(externalId, MediaType.SCREEN, stream);
            // throttled version causes bug when streamMode may be overridden during batching
            this.devicesService.updateParticipantsBatch({
                [externalIdToString(externalId)]: {
                    screenSharingStream: stream,
                    streamMode,
                    externalId,
                },
            });
            if (stream) {
                screenShareNotVisibleStat.measure(externalId);
            }
        };
        this.onRemoteVmojiStream = (externalId, stream) => {
            this.logWarn('onRemoteVmojiStream', externalId.id, stream);
            const device = this.devicesService.getDeviceByExternalId(externalId);
            const streamMode = getNewStreamModeByDevice(MediaType.CAMERA, device, !!stream ||
                // кейс при переключении на серверную отрисовку (медиасеттинг вимоджи true, но видео идет через стрим камеры)
                Boolean(device?.mediaSettings?.isAnimojiEnabled) ||
                Boolean(device?.mediaSettings?.isVideoEnabled && device?.stream));
            this.streamRegistry.setStream(externalId, MediaType.ANIMOJI, stream);
            this.devicesService.throttleAccumulateDispatchParticipant(externalId, {
                animojiStream: stream,
                streamMode,
            });
        };
        this.onParticipantVmojiUpdate = (externalId) => {
            this.logWarn('onParticipantVmojiUpdate', externalId);
            const peerIds = [externalId.id];
            if (this.config.enableParticipantsService) {
                void this.participantsService.addToParticipantLoadingQueue(peerIds);
            }
            else {
                const callId = this.stateBridge.callData.callId || '';
                // Загружаем обновленный animated_avatar - URL с обновленным файлом SVG
                void loadCallParticipantsAccumulate({
                    me: this.localDeviceService.me,
                    anonymSecret: this.stateBridge.anonymSecret,
                }, this.stateBridge.dispatch, callId, peerIds);
            }
        };
        this.onRemoteMediaSettings = (externalId, mediaSettings, markers) => {
            this.logWarn('onRemoteMediaSettings', {
                externalId,
                mediaSettings,
                markers,
            });
            const deviceState = this.devicesService.getDeviceByExternalId(externalId);
            /**
             * из за того, что натив и мобильные клиенты из за анимоджи будут спамить сообщениями
             * о mediaSettings - нужно проверять так же потенциальный throttled state;
             */
            const throttledDeviceState = this.devicesService.queryThrottledAccumulatedState(externalId);
            const currMediaSettings = { ...deviceState?.mediaSettings, ...throttledDeviceState?.mediaSettings };
            const currPermissionsOnce = throttledDeviceState?.permissionsOnce || deviceState?.permissionsOnce;
            if (['isVideoEnabled', 'isAudioEnabled', 'isAnimojiEnabled', 'isScreenSharingEnabled'].every(
            // @ts-expect-error TS2769: TODO CALL-23757 No overload matches this call.
            (key) => mediaSettings[key] === currMediaSettings[key])) {
                // skip when event has no changes
                return;
            }
            if (!!currMediaSettings.isScreenSharingEnabled !== mediaSettings.isScreenSharingEnabled) {
                this.callService.changeScreenSharingReaction(mediaSettings.isScreenSharingEnabled, externalId, true);
            }
            const permissionsOnce = getDecreasedPermissionsOnce(currMediaSettings, mediaSettings, currPermissionsOnce);
            const deviceData = getMediaSettingsWithStreamMode(mediaSettings, 
            // тут нужно передать наиболее свежий стейт девайса
            deviceState ? { ...deviceState, ...throttledDeviceState } : undefined);
            deviceData.permissionsOnce = permissionsOnce;
            // Отдаем приоритет streamMode, установленному одним из коллбеков, а не null, вычисленному по mediaSettings
            if (throttledDeviceState?.streamMode && !deviceData.streamMode) {
                deviceData.streamMode = throttledDeviceState.streamMode;
            }
            this.devicesService.throttleAccumulateDispatchParticipant(externalId, deviceData);
            callStatDataStorage.set({
                hadVideoEnabled: mediaSettings.isVideoEnabled,
            });
            // Need compare only boolean values, not falsy or truthy
            if (Boolean(currMediaSettings?.isVideoEnabled) !== Boolean(mediaSettings.isVideoEnabled)) {
                this.stateBridge.dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: {
                        type: mediaSettings.isVideoEnabled
                            ? NotificationType.PARTICIPANT_TURNED_ON_CAMERA
                            : NotificationType.PARTICIPANT_TURNED_OFF_CAMERA,
                        data: externalId.id,
                        hidden: true,
                    },
                });
            }
        };
        this.onRemoteStatus = (externalIds, status, statusData) => {
            this.logWarn('onRemoteStatus', externalIds, status, statusData);
            if (eventBus.has(CallsEventType.REMOTE_STATUS_CHANGED)) {
                eventBus.emit(CallsEventType.REMOTE_STATUS_CHANGED, {
                    externalIds,
                    status,
                });
            }
            const peerIds = [];
            for (let externalId of externalIds) {
                if (isSameExternalId(externalId, this.localDeviceService.externalId)) {
                    continue;
                }
                const peerId = externalId.id;
                const participant = this.stateBridge.participants[peerId];
                if (!participant || !participant.shortName) {
                    peerIds.push(peerId);
                }
                const data = { status };
                // тут может быть null, чтобы не переписывать старое значение в сторе
                if (statusData) {
                    data.statusData = statusData;
                }
                this.devicesService.throttleAccumulateDispatchParticipant(externalId, data);
            }
            if (peerIds.length) {
                if (this.config.enableParticipantsService) {
                    switch (status) {
                        case ParticipantStatus.HANGUP:
                            void this.participantsService.excludeFromParticipantLoadingQueue(peerIds);
                            break;
                        default:
                            void this.participantsService.addToParticipantLoadingQueue(peerIds);
                            break;
                    }
                }
                else {
                    const callId = this.stateBridge.callData.callId || '';
                    void loadCallParticipantsAccumulate({
                        me: this.localDeviceService.me,
                        anonymSecret: this.stateBridge.anonymSecret,
                    }, this.stateBridge.dispatch, callId, peerIds);
                }
            }
            callStatDataStorage.set({ connectionStep: status });
            // Фиксируем connect для 1-1 (может повторяться)
            const peerId = externalIds?.[0].id;
            if (peerId === this.stateBridge.peer) {
                const peerDevice = getPeerIdDeviceInfo(peerId, this.devicesService.devices);
                const callStatsLogEvent = (status, reason, miniAppId) => {
                    let eventRawData = {
                        call_event_type: status,
                        session_id: this.stateBridge.callData.callId,
                        peer_id: this.stateBridge.peer,
                        is_group_call: false,
                        device_id: this.config.deviceId,
                        source: this.stateBridge.entryPoint?.source,
                        mini_app_id: miniAppId,
                    };
                    if (reason) {
                        eventRawData.reason = reason;
                    }
                    this.clickHouseService.sendStats(status, { is_group_call: false, reason });
                };
                if (status === ParticipantStatus.CONNECTED) {
                    callStatsLogEvent(ClickHouseEventType.CALL_CONNECTED, undefined, this.stateBridge.entryPoint?.miniAppId);
                    mailRuCounter.push(EMailRuGoals.JoinCall);
                    if (!peerDevice?.wasConnected) {
                        if (isCreator(this.localDeviceService.device)) {
                            const { startType } = callStatDataStorage.get();
                            callStatsLogEvent(ClickHouseEventType.OUTGOING_CALL_ACCEPTED_REMOTELY, startType?.toString());
                        }
                    }
                }
            }
        };
        this.onRemoteRemoved = (externalId, markers) => {
            this.logWarn('onRemoteRemoved', externalId, markers);
            if (eventBus.has(CallsEventType.REMOTE_REMOVED)) {
                eventBus.emit(CallsEventType.REMOTE_REMOVED, { externalId, markers });
            }
            this.streamRegistry.unregisterDevice(externalId);
            this.stateBridge.dispatch({ type: E_ACTION.REMOVE_USER, participantId: externalId });
            if (isSameExternalId(this.pinnedParticipantService.pinnedParticipant, externalId)) {
                this.pinnedParticipantService.clearPinnedParticipant();
            }
            if (isSameExternalId(this.pinnedParticipantService.adminPinnedParticipant, externalId)) {
                this.pinnedParticipantService.clearAdminPinnedParticipant();
            }
            if (isSameExternalId(this.pinnedParticipantService.mediaSharingPinnedParticipant, externalId)) {
                this.pinnedParticipantService.clearMediaSharingPinnedParticipant();
            }
            this.stateBridge.dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: NotificationType.PARTICIPANT_LEFT_THE_CALL,
                    data: externalId.id,
                    hidden: true,
                    callback: () => {
                        // Если очистить сразу, то в нотификации не будет показано кастомное имя
                        this.stateBridge.dispatch({
                            type: E_ACTION.LOAD_PEERS,
                            members: [
                                {
                                    peerId: externalId.id,
                                    customName: undefined,
                                },
                            ],
                        });
                    },
                },
            });
            if (isSameExternalId(this.pinnedParticipantService.watchTogetherPinnedParticipant, externalId)) {
                this.watchTogetherService.clear();
                this.pinnedParticipantService.clearWatchTogetherPinnedParticipant();
            }
        };
        this.onVideoSuspendSuggest = (bandwidth) => {
            this.logWarn('onVideoSuspendSuggest', {
                bandwidth,
            });
            this.stateBridge.dispatch(setFeatureNotification(FeatureNotification.VideoSuspendSuggest));
        };
        this.onParticipantJoined = (externalId, markers) => {
            this.logWarn('onParticipantJoined', { externalId, markers });
            // При подключении нового участника добавляем его в основной зал
            this.roomsService.updateRoomParticipants({
                roomId: ROOM_MAIN_ID,
                addedParticipantIds: [externalId],
                myExternalId: this.localDeviceService.externalId,
            });
            this.devicesService.throttleAccumulateDispatchParticipant(externalId, { roomId: ROOM_MAIN_ID });
            this.stateBridge.dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: NotificationType.PARTICIPANT_JOINED_THE_CALL,
                    data: externalId.id,
                    hidden: true,
                },
            });
        };
        this.onParticipantAdded = (externalId) => {
            this.logWarn('onParticipantAdded', { externalId });
            this.roomsService.updateRoomParticipants({
                roomId: ROOM_MAIN_ID,
                addedParticipantIds: [externalId],
                myExternalId: this.localDeviceService.externalId,
            });
        };
        this.onParticipantIdChanged = (prevId, newId) => {
            this.logWarn('onParticipantIdChanged', { prevId, newId });
            if (isParticipantContact(prevId) && !isParticipantContact(newId)) {
                // contact deanon is the only scenario now
                const { isDev, me } = this.stateBridge;
                const dispatchAction = () => {
                    const idsToUpdate = getUpdatedSpeakerPeerId({
                        maps: this.stateBridge.maps,
                        me: this.localDeviceService.me,
                        externalId: this.localDeviceService.externalId,
                        devices: this.devicesService.devices,
                    }, this.speakersService.speakers, prevId.id, newId.id);
                    if (idsToUpdate) {
                        const [prevId, newId] = idsToUpdate;
                        this.speakersService.replaceSpeaker(prevId, newId);
                    }
                    this.pinnedParticipantService.changeIdForContact(prevId.id, newId.id);
                    this.stateBridge.dispatch({
                        type: E_ACTION.CHANGE_PARTICIPANT_ID,
                        peerId: newId.id,
                        prevPeerId: prevId.id,
                    });
                };
                const handleError = (err) => {
                    this.sdk.debugMessage(DebugMessageType.ERROR, err);
                };
                if (prevId.id === me) {
                    this.clickHouseService.sendStats(ClickHouseEventType.CONTACT_DEANONIMIZED);
                    // restore authorization as VK user
                    fetchCallTokenWithApiBaseUrl(newId.id, isDev)
                        .then(({ token, apiBaseUrl }) => {
                        this.sdk
                            .authorize(token, apiBaseUrl)
                            .then(() => {
                            dispatchAction();
                            const { peer } = this.stateBridge;
                            if (peer) {
                                loadConversationData(this.stateBridge.dispatch, peerIdToVkId(peer), undefined).catch(handleError);
                            }
                        })
                            .catch(handleError);
                    })
                        .catch(handleError);
                }
                else {
                    dispatchAction();
                    const callId = this.stateBridge.callData.callId || '';
                    if (this.config.enableParticipantsService) {
                        void this.participantsService.addToParticipantLoadingQueue([newId.id]);
                    }
                    else {
                        void loadCallParticipantsAccumulate({
                            me: this.localDeviceService.me,
                            anonymSecret: this.stateBridge.anonymSecret,
                        }, this.stateBridge.dispatch, callId, [newId.id]);
                    }
                    if (callId) {
                        getConversationByCall(callId).then(({ conversation }) => {
                            if (!conversation) {
                                return;
                            }
                            const peerId = conversation.peer.id;
                            void loadConversationData(this.stateBridge.dispatch, peerId, undefined);
                        });
                    }
                }
            }
        };
        this.onAcceptedCall = (externalId) => {
            this.logWarn('onAcceptedCall', { externalId });
            eventBus.emit(CallsEventType.OUTGOING_CALL_ACCEPTED);
            this.stateBridge.dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: NotificationType.PARTICIPANT_JOINED_THE_CALL,
                    data: externalId.id,
                    hidden: true,
                },
            });
        };
        this.onCallAccepted = () => {
            this.logWarn('onCallAccepted');
            eventBus.emit(CallsEventType.INCOMING_CALL_ACCEPTED);
            // Фиксируем connect для входящего группового
            if (isGroupCallByPeer(this.stateBridge.peer)) {
                this.clickHouseService.sendStats(ClickHouseEventType.CALL_CONNECTED);
                mailRuCounter.push(EMailRuGoals.JoinCall);
            }
        };
        this.onConversation = (userId, mediaModifiers, muteStates, participants, rooms) => {
            this.sdkService.log({
                type: 'start call info',
                os: Platform.OS,
                arch: Platform.ARCH,
                isMobile: Platform.isMobile,
                browser: getBrowserInfo(),
                config: this.config,
                cameras: this.sdk.browser.getCameras(),
                microphones: this.sdk.browser.getMicrophones(),
                hasMicrophonePermission: this.sdk.browser.hasMicrophonePermission(),
                hasCameraPermission: this.sdk.browser.hasCameraPermission(),
                screenHeight: window.screen.availHeight,
                screenWidth: window.screen.availWidth,
                windowHeight: window.screen.height,
                windowWidth: window.screen.width,
            });
            this.logWarn('onConversation', {
                userId,
                mediaModifiers,
                muteStates,
                participants,
                rooms,
            });
            if (!this.stateBridge.callData.ts) {
                const ts = Date.now();
                this.stateBridge.dispatch({
                    type: E_ACTION.TIME_START,
                    data: ts,
                });
            }
            if (this.stateBridge.peer !== EMPTY_PEER_ID) {
                void loadActiveCallDataAction(this.config.enableParticipantListChunk, this.stateBridge.dispatch, this.stateBridge.peer);
            }
            if (participants) {
                this.roomsService.updateRoomParticipants({
                    roomId: ROOM_MAIN_ID,
                    addedParticipantIds: participants.map((p) => p.uid),
                    myExternalId: this.localDeviceService.externalId,
                });
            }
            if (rooms) {
                if (rooms.rooms.length) {
                    for (const room of rooms.rooms) {
                        if (!room?.participants?.participants) {
                            continue;
                        }
                        this.roomsService.updateRoomParticipants({
                            roomId: room.id,
                            addedParticipantIds: room.participants.participants.map((p) => p.uid),
                            myExternalId: this.localDeviceService.externalId,
                        });
                        // Добавляем участников из комнат
                        this.callService.addParticipantsToStoreThrottled({
                            participants: room.participants.participants,
                            targetRoomId: room.id,
                        });
                    }
                    if (rooms.rooms) {
                        this.devicesService.updateRooms(rooms.rooms);
                    }
                }
                if (rooms.roomId) {
                    this.roomsService.setRoomId(rooms.roomId);
                }
            }
            this.callService.addParticipantsToStoreThrottled({
                participants,
                targetRoomId: null,
            });
        };
        this.onCallState = (isCallActive, canAddParticipants, callState) => {
            this.logWarn('onCallState', isCallActive, canAddParticipants, callState);
            const { id, direction, joinLink, externalId, options, topology, featuresPerRole, restricted } = callState;
            /* проверка на первое срабатываение, из которого получаем id звонка */
            this.stateBridge.dispatch(setRestrictedConversation(restricted));
            if (id && this.stateBridge.callData.callId) {
                if (topology !== this.stateBridge.callData.topology) {
                    this.stateBridge.dispatch({
                        type: E_ACTION.CALL_STATE,
                        callData: {
                            topology,
                        },
                    });
                }
                return;
            }
            if (featuresPerRole) {
                this.permissionsService.setGlobalMovieSharePermission(featuresPerRole, false);
            }
            if (featuresPerRole) {
                this.permissionsService.setGlobalCallFeatureRecordAndTranslationPermission(featuresPerRole);
            }
            this.stateBridge.dispatch({
                type: E_ACTION.CALL_STATE,
                callData: {
                    callId: id,
                    topology,
                },
                joinLink,
                externalId,
            });
            this.stateBridge.dispatch({
                type: E_ACTION.SET_CONVERSATION_OPTIONS,
                data: options,
            });
            /**
             * здесь можно будет изменить условие и делать запрос
             * на информацию о беседе всегда, когда данных не было при старте звонка
             */
            if (!this.stateBridge.peer) {
                const peerIds = [];
                objectForEach(this.stateBridge.participants, (participant) => {
                    peerIds.push(participant.peerId);
                });
                if (peerIds.length) {
                    if (this.config.enableParticipantsService) {
                        void this.participantsService.addToParticipantLoadingQueue(peerIds, id);
                    }
                    else {
                        void loadCallParticipantsAccumulate({
                            me: this.localDeviceService.me,
                            anonymSecret: this.stateBridge.anonymSecret,
                        }, this.stateBridge.dispatch, id, peerIds);
                    }
                }
            }
            // Фиксируем connect для группового исходящего и присоединения
            const peerId = this.stateBridge.peer || EMPTY_PEER_ID;
            if (isGroupCallByPeerAndMe(peerId, this.localDeviceService.me) &&
                [CallDirection.JOINING, CallDirection.OUTGOING].includes(direction)) {
                this.clickHouseService.sendStats(ClickHouseEventType.CALL_CONNECTED, {
                    is_group_call: true,
                    session_id: id,
                });
                mailRuCounter.push(EMailRuGoals.JoinCall);
            }
            if (this.stateBridge.startOptions && this.stateBridge.startOptions?.createLink) {
                void loadAndCopyJoinLink(this.stateBridge.dispatch, id, this.stateBridge.groupId);
            }
        };
        this.onSpeakerChanged = (externalId) => {
            this.logWarn('onSpeakerChanged', externalId);
            this.pinnedParticipantService.setOrator(externalId);
        };
        this.onFingerprintChange = (fingerprint) => {
            this.logWarn('onFingerprintChange', fingerprint);
        };
        this.onVolumeDetectorLevelReached = () => {
            this.stateBridge.dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: NotificationType.SPEAKING_ON_MUTE,
                },
            });
            sendStats(ClickHouseEventType.MIC_OFF_WHILE_TALKING_ALERT);
        };
        this.onVolumeDetectorLevelUpdated = (reached) => {
            const { externalId: localExternalId, device: localDevice, me } = this.localDeviceService;
            const isAudioEnabled = localDevice.mediaSettings?.isAudioEnabled;
            const myId = localExternalId ? externalIdToString(localExternalId) : me;
            if (!localExternalId) {
                return;
            }
            if (reached && isAudioEnabled) {
                this.speakersService.toggleSpeaker(myId, true);
            }
            else if (!reached) {
                this.speakersService.toggleSpeaker(myId, false);
            }
        };
        this.onLocalVolume = localVolumeDetectorGenerator({
            onVolumeLevelReached: this.onVolumeDetectorLevelReached,
            onVolumeLevelUpdated: this.onVolumeDetectorLevelUpdated,
            needCheckMicEnabled: true,
            volumeLevelDetection: VOLUME_LEVEL_DETECTION,
            vectorLength: 5,
            callbackFactorStep: 0,
            sensitivityCoefficient: 0.45,
            debugCallback: () => { },
        });
        this.onCustomData = (data, userId) => {
            this.logWarn('onCustomData', data, userId);
        };
        this.onNetworkStatusChanged = (status) => {
            this.logWarn('onNetworkStatusChanged', status);
            if (isGroupCallByPeer(this.stateBridge.peer) || this.config.badNetworkP2P) {
                for (const participantStatus of status) {
                    this.devicesService.throttleAccumulateDispatchParticipant(participantStatus.uid, {
                        networkStatus: participantStatus.rating,
                    });
                }
            }
        };
        this.onLocalNetworkStatusChanged = (rating) => {
            this.logWarn('onLocalNetworkStatusChanged', rating);
            if (isGroupCallByPeer(this.stateBridge.peer) || this.config.badNetworkP2P) {
                this.localDeviceService.setLocalDevice({ networkStatus: rating });
            }
        };
        this.onLocalParticipantState = (participantState) => {
            this.logWarn('onLocalParticipantState', {
                participantState,
            });
            const nextStatusData = convertParticipantStateFromSdk(participantState);
            const shouldBeRaised = getIsHandRaised({ statusData: nextStatusData });
            if (getIsHandRaised(this.localDeviceService.device) !== shouldBeRaised) {
                this.stateBridge.dispatch(setLocalHandState(this.localDeviceService.device.statusData, shouldBeRaised));
            }
        };
        this.onRemoteParticipantState = (externalId, participantState, markers) => {
            this.logWarn('onRemoteParticipantState', {
                externalId,
                participantState,
                markers,
            });
            this.participantStatusDataChangeHandler(externalId, participantState);
        };
        this.onRolesChanged = (userId, roles) => {
            this.logWarn('onRolesChanged', userId, roles);
            // При возвращении в звонок ивент прилетает
            const participant = this.stateBridge.participants[userId.id];
            if (roles.includes(UserRole.ADMIN) && participant && participant.peerId !== this.localDeviceService.me) {
                this.stateBridge.dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: {
                        type: NotificationType.USER_GRANTED_WITH_ADMIN_ROLE,
                        data: userId.id, // тут нужен peerId
                    },
                });
            }
            this.stateBridge.dispatch({
                type: E_ACTION.CHANGE_PARTICIPANT_ROLES,
                participantId: userId.id,
                data: roles,
            });
        };
        this.onRemoteParticipantsState = (stateList) => {
            this.logWarn('onRemoteParticipantsState', {
                stateList,
            });
            stateList.forEach(({ externalId, participantState }) => {
                this.participantStatusDataChangeHandler(externalId, participantState);
            });
        };
        this.onLocalRolesChanged = (roles) => {
            this.logWarn('onLocalRolesChanged', roles);
            const previousRoles = this.localDeviceService.device.roles;
            if (previousRoles.includes(UserRole.ADMIN) && !roles.includes(UserRole.ADMIN)) {
                this.stateBridge.dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: {
                        type: NotificationType.ADMIN_ROLE_REMOVED,
                        ts: Date.now(),
                    },
                });
            }
            if (roles.includes(UserRole.ADMIN)) {
                this.stateBridge.dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: {
                        type: NotificationType.ADMIN_ROLE_GRANTED,
                        ts: Date.now(),
                    },
                });
                // если стал админом, нужно переполучить media permissions участников
                this.devicesService.getParticipantsMuteStates();
                /**
                 * Jira task: https://jira.mvk.com/browse/CALL-18164
                 *
                 * У сферума есть специфическое требование, чтобы админы при входе были с включенными микрофонами
                 * Если просто игнорить все флаги и оставлят микро включенным, то другие не будут знать актуального состояния
                 * Потом инициируем включение микрофона от лица участника-админка
                 * При этом проверяем, что это сферум и что это подключение к звонку (по статусу)
                 */
                if (this.config.sferum && this.localDeviceService.device.status === ParticipantStatus.WAITING) {
                    this.sdk.toggleLocalAudio(true).catch(handlePromiseError);
                }
            }
            if (roles.includes(UserRole.ADMIN) || roles.includes(UserRole.CREATOR)) {
                if (isWaitingHallEnabled({ conversationOptions: this.stateBridge.conversationOptions })) {
                    loadWaitingHallFromScratch({
                        anonymSecret: this.stateBridge.anonymSecret,
                        callId: this.stateBridge.callData.callId ?? '',
                        me: this.localDeviceService.me,
                        waitingHall: this.stateBridge.waitingHall,
                    }).then((waitingHall) => {
                        this.stateBridge.dispatch(setWaitingHall(waitingHall));
                    });
                }
            }
            else {
                this.devicesService.abortGetParticipants();
                if (!!this.stateBridge.waitingHall) {
                    this.stateBridge.dispatch(setWaitingHall());
                }
                this.roomsService.clearRooms();
            }
            this.localDeviceService.setLocalDevice({ roles });
            return Promise.resolve();
        };
        this.onRecordStarted = (initiator, movieId, startTime, type, externalMovieId, externalOwnerId, roomId = null) => {
            this.logWarn('onRecordStarted', {
                initiator,
                movieId,
                startTime,
                type,
                externalMovieId,
                externalOwnerId,
                roomId,
            });
            // Если прилетела информация по записи в зале, в котором мы не находимся, то игнорируем
            if (!this.roomsService.equalsToMyRoom(roomId)) {
                return;
            }
            const broadcastId = `${externalOwnerId}_${externalMovieId}_`;
            const isRecord = type === 'RECORD';
            const data = {
                isOn: true,
                videoId: externalMovieId ? Number(externalMovieId) : undefined,
                ownerId: externalOwnerId ? Number(externalOwnerId) : undefined,
                host: initiator,
                startTime: startTime,
                link: getBroadcastLink(broadcastId, this.config.sferum) || undefined,
                startStreamParams: undefined,
                isRecord,
            };
            this.stateBridge.dispatch({
                type: E_ACTION.SET_TRANSLATION,
                data: data,
            });
            if (externalOwnerId && externalMovieId && this.localDeviceService.me !== externalOwnerId) {
                this.stateBridge.dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: {
                        type: isRecord
                            ? NotificationType.PARTICIPANT_CALL_RECORD_STARTED
                            : NotificationType.PARTICIPANT_CALL_STREAM_STARTED,
                        data: externalOwnerId,
                        hidden: true,
                    },
                });
            }
        };
        this.onRecordStopped = (roomId) => {
            this.logWarn('onRecordStopped', { roomId });
            // Если прилетела информация по записи в зале, в котором мы не находимся, то игнорируем
            if (!this.roomsService.equalsToMyRoom(roomId)) {
                return;
            }
            const { ownerId: recordOwnerId, isRecord } = this.stateBridge.translation;
            this.stateBridge.dispatch({
                type: E_ACTION.SET_TRANSLATION,
                data: {
                    isOn: false,
                    hasPermission: false,
                },
            });
            if (isMeRecordCreator({
                me: this.localDeviceService.me,
                translation: this.stateBridge.translation,
                groupId: this.stateBridge.groupId,
            })) {
                this.stateBridge.dispatch(setFeatureNotification(FeatureNotification.RecordEnded));
            }
            if (Number(recordOwnerId) !== peerIdToVkId(this.localDeviceService.me)) {
                this.stateBridge.dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: {
                        type: isRecord
                            ? NotificationType.PARTICIPANT_CALL_RECORD_STOPPED
                            : NotificationType.PARTICIPANT_CALL_STREAM_STOPPED,
                        data: recordOwnerId,
                        hidden: true,
                    },
                });
            }
        };
        this.onLocalPin = (unpin) => {
            this.logWarn('onLocalPin', { unpin });
            if (!unpin) {
                this.stateBridge.dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: {
                        type: NotificationType.PINNED_BY_ADMIN,
                    },
                });
            }
            if (!unpin && !this.localDeviceService.device.mediaSettings?.isAudioEnabled) {
                this.modalService.openModal(ModalType.ADMIN_PIN_UNMUTE_REQUEST);
            }
            if (!unpin && !this.stateBridge.isOratorMode) {
                this.stateBridge.dispatch({
                    type: E_ACTION.TOGGLE_ORATOR_MODE,
                    isOratorMode: true,
                });
            }
            if (this.localDeviceService.externalId) {
                this.pinnedParticipantService.setAdminPinnedParticipant(unpin ? null : this.localDeviceService.externalId);
            }
        };
        this.onPinnedParticipant = (externalId, unpin, markers, roomId) => {
            this.logWarn('onPinnedParticipant', { externalId, unpin, roomId });
            const participant = this.stateBridge.participants[externalId.id];
            if (this.roomsService.roomId !== roomId) {
                return;
            }
            if (!unpin && participant && !!(participant?.shortName || participant?.name)) {
                this.stateBridge.dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: {
                        type: NotificationType.USER_PINNED_BY_ADMIN,
                        data: externalId.id, // тут нужен peerId
                    },
                });
            }
            if (!this.stateBridge.isOratorMode) {
                this.stateBridge.dispatch({
                    type: E_ACTION.TOGGLE_ORATOR_MODE,
                    isOratorMode: true,
                });
            }
            this.pinnedParticipantService.setAdminPinnedParticipant(unpin ? null : externalId);
        };
        this.onOptionsChanged = (options) => {
            this.logWarn('onOptionsChanged', options);
            this.stateBridge.dispatch({
                type: E_ACTION.SET_CONVERSATION_OPTIONS,
                data: options,
            });
        };
        this.onLocalStatus = (status) => {
            this.logWarn('onLocalStatus', status);
            const { callData, me } = this.stateBridge;
            const isWaitingRequestAvailable = this.localDeviceService.device.status === ParticipantStatus.WAITING_HALL &&
                status === ParticipantStatus.WAITING;
            const isConnectedRequestAvailable = status === ParticipantStatus.CONNECTED && !this.stateBridge.peer;
            if (status === ParticipantStatus.CONNECTED) {
                // не загружаем сами себя если делаем звонок от имени сообщества
                if (callData.callId && !isParticipantAnonymOrContact(me) && !this.stateBridge.meGroup) {
                    if (this.config.enableParticipantsService) {
                        void this.participantsService.addToParticipantLoadingQueue([me]);
                    }
                    else {
                        void loadCallParticipantsAccumulate(this.stateBridge, this.stateBridge.dispatch, callData.callId, [
                            me,
                        ]);
                    }
                }
            }
            if (callData.callId &&
                !isParticipantAnonym(me) &&
                (isConnectedRequestAvailable || isWaitingRequestAvailable)) {
                getConversationByCall(callData.callId, this.roomsService.roomId)
                    .then(({ conversation }) => {
                    if (!conversation) {
                        return;
                    }
                    const peerId = conversation?.peer.id;
                    return loadConversationData(this.stateBridge.dispatch, peerId, undefined);
                })
                    .catch((error) => {
                    const errorCode = error?.apiError?.error_code || error?.error?.error_code;
                    if (skippedErrorCodes.includes(errorCode)) {
                        return 0;
                    }
                    throw error;
                });
            }
            this.localDeviceService.setLocalDevice({ status, wasConnected: true });
        };
        this.onChatRoomUpdated = (eventType, totalCount, firstParticipants, addedParticipantIds, removedParticipantIds) => {
            this.logWarn('onChatRoomUpdated', eventType, totalCount, firstParticipants, addedParticipantIds, removedParticipantIds);
            if (eventType === ChatRoomEventType.ATTENDEE) {
                loadWaitingHall({
                    me: this.localDeviceService.me,
                    callId: this.stateBridge.callData.callId ?? '',
                    anonymSecret: this.stateBridge.anonymSecret,
                    waitingHall: this.stateBridge.waitingHall,
                    totalCount,
                    firstParticipants,
                }).then((waitingHall) => {
                    this.stateBridge.dispatch(setWaitingHall(waitingHall));
                });
            }
        };
        this.onJoinLinkChanged = (joinLink) => {
            this.logWarn('onJoinLinkChanged', joinLink);
            const groupId = isAuthedByGroupId(this.stateBridge.groupId) ? this.stateBridge.groupId : 0;
            if (this.stateBridge.callData.callId) {
                loadCallUrlLink(this.stateBridge.dispatch, this.stateBridge.callData.callId, false, groupId).catch((err) => {
                    this.sdk.debugMessage(DebugMessageType.ERROR, 'onJoinLinkChanged -> loadCallUrlLink failed', err);
                });
            }
        };
        this.onFeedback = (feedback, roomId) => {
            this.logWarn('onFeedback', { feedback, roomId });
            if (this.roomsService.roomId !== roomId) {
                return;
            }
            this.stateBridge.dispatch({
                type: E_ACTION.SET_REACTIONS,
                data: { feedback },
            });
            // update participants
            for (const f of feedback) {
                const mapHistoryItems = f.items.map((item) => ({
                    key: f.key,
                    peerId: item.participantId.id,
                    ts: item.times[item.times.length - 1],
                }));
                this.stateBridge.dispatch(updateReactionsHistory(mapHistoryItems));
                for (const item of f.items) {
                    const reaction = { key: f.key, ts: item.times[item.times.length - 1] };
                    if (isSameExternalId(item.participantId, this.localDeviceService.externalId)) {
                        this.localDeviceService.setLocalDevice({ reaction });
                        continue;
                    }
                    this.devicesService.throttleAccumulateDispatchParticipant(item.participantId, { reaction });
                }
            }
        };
        this.onChatMessage = (message, externalId) => {
            this.logWarn('onChatMessage', { message, externalId });
            const author = createParticipantSelector(externalId.id)({ participants: this.stateBridge.participants });
            if (!this.roomsService.isInNotMainRoom || !author) {
                // показываем только не в основном СЗ
                return;
            }
            AdminMessagesController.getInstance().addMessage(message, author);
        };
        this.onRoomStart = (roomId) => {
            this.logWarn('onRoomsStart', { roomId });
            this.roomsService.setRoomId(roomId);
        };
        this.onRoomsUpdated = (updates) => {
            this.logWarn('onRoomsUpdated', { updates });
            const { maps, modal, participants } = this.stateBridge;
            const devices = this.devicesService.devices;
            const me = this.localDeviceService.me;
            const messagesCtrl = AdminMessagesController.getInstance();
            let roomsCount = Object.values(this.roomsService.rooms).length;
            objectForEach(updates, (update, eventType) => {
                if (!update) {
                    return;
                }
                switch (eventType) {
                    case RoomsEventType.UPDATE:
                        roomsCount += update?.rooms?.length ?? 0;
                        this.devicesService.updateRooms(update.rooms ?? []);
                        break;
                    case RoomsEventType.ACTIVATE:
                        for (const roomId of update.roomIds ?? update.rooms?.map((room) => room.id) ?? []) {
                            this.roomsService.setRoomActive({
                                roomId,
                                active: !update.deactivated,
                            });
                        }
                        this.roomsService.setCountdown({
                            countdownSec: update.rooms?.[0]?.countdownSec,
                            timeoutMs: update.rooms?.[0]?.timeoutMs,
                        });
                        break;
                    case RoomsEventType.REMOVE:
                        if (checkAreRoomsClosed({
                            devices,
                            maps,
                            me,
                            participants,
                        }, this.roomsService.participantIdsByRoomIdMap, this.roomsService.roomId)) {
                            this.roomsService.resetTimer();
                            messagesCtrl.clear();
                        }
                        roomsCount -= update?.roomIds?.length ?? 0;
                        for (const roomId of update.roomIds ?? []) {
                            this.roomsService.removeRoom(roomId);
                            this.roomsService.clearRoomParticipants(roomId);
                        }
                        break;
                }
            });
            if (modalHasType(modal, ModalType.ROOM_CONTROL_CREATE) && roomsCount > 0) {
                // Если было открыто окно создания залов и появились комнаты, то открываем окно распределения
                this.modalService.openModal(ModalType.ROOM_CONTROL);
            }
            else if (modalHasType(modal, ModalType.ROOM_CONTROL) && !roomsCount) {
                // Если было окно распределения и залы закрыли, то показываем окно создания залов
                this.modalService.openModal(ModalType.ROOM_CONTROL_CREATE);
            }
            if (!roomsCount) {
                messagesCtrl.clear();
                this.roomsService.resetTimer();
            }
        };
        // событие onRoomUpdate вызывается только у пользователя, находящегося в зале - и запускается по залу пользователя.
        // если пользователь в основном зале, вызов не будет произведен при апдейте (например, при закрытии СЗ)
        this.onRoomUpdated = (eventTypes, roomId, room, deactivate) => {
            this.logWarn('onRoomUpdated', { eventTypes, roomId, room });
            const { maps, participants } = this.stateBridge;
            const devices = this.devicesService.devices;
            const localDevice = this.localDeviceService.device;
            const me = this.localDeviceService.me;
            for (const eventType of eventTypes) {
                switch (eventType) {
                    case RoomsEventType.UPDATE:
                        if (room) {
                            this.devicesService.updateRooms([room]);
                        }
                        break;
                    case RoomsEventType.ACTIVATE:
                        const active = !deactivate;
                        this.roomsService.setRoomActive({ roomId, active });
                        if (participantIsAdmin(localDevice) && room?.timeoutMs) {
                            this.roomsService.setCountdown({
                                countdownSec: room?.countdownSec,
                                timeoutMs: room?.timeoutMs,
                            });
                        }
                        if (room?.timeoutMs) {
                            this.roomsService.setCountdown({
                                countdownSec: room?.countdownSec,
                                timeoutMs: room?.timeoutMs,
                            });
                        }
                        else if (active && this.roomsService?.countdownSec && !this.localDeviceService.isMeAdmin) {
                            this.roomsService.setCountdown({
                                countdownSec: this.roomsService.countdownSec,
                                timeoutMs: Date.now() + this.roomsService.countdownSec * 1000,
                            });
                        }
                        break;
                    case RoomsEventType.REMOVE:
                        if (checkAreRoomsClosed({
                            devices,
                            maps,
                            me,
                            participants,
                        }, this.roomsService.participantIdsByRoomIdMap, this.roomsService.roomId)) {
                            this.roomsService.resetTimer();
                            AdminMessagesController.getInstance().clear();
                            roomsClosedNotification(this.stateBridge.dispatch);
                        }
                        this.roomsService.removeRoom(roomId);
                        this.roomsService.setRoomId(ROOM_MAIN_ID);
                        this.roomsService.setRoomChatId({ roomId, chatId: 0 });
                        break;
                }
            }
        };
        this.onRoomSwitched = async (roomId) => {
            this.logWarn('onRoomSwitched', { roomId });
            if (this.watchTogetherService.movieInfo && this.watchTogetherService.stream) {
                this.watchTogetherService.clear();
                this.pinnedParticipantService.clearWatchTogetherPinnedParticipant();
            }
            const resetSharedUrl = () => {
                if (this.config.sferum) {
                    const externalId = getSharingMiniAppParticipantId({
                        devices: this.devicesService.devices,
                        localDevice: this.localDeviceService.device,
                        externalId: this.localDeviceService.externalId,
                    });
                    if (externalId) {
                        const deviceData = {
                            sharedUrl: undefined,
                            streamMode: getNewStreamModeByDevice(MediaType.SHARED_URL, this.devicesService.getDeviceByExternalId(externalId), false),
                            externalId,
                        };
                        this.devicesService.updateParticipantsBatch({
                            [externalIdToString(externalId)]: deviceData,
                        });
                    }
                }
            };
            const stopMyVideoStreamInRoom = (roomId) => {
                // Если есть нотификация о завершенной трансляции - скрываем
                if (isSameFeatureNotification(FeatureNotification.RecordEnded, this.stateBridge.featureNotification.type)) {
                    this.stateBridge.dispatch(setFeatureNotification(undefined));
                }
                // Если есть запущенная трансляция - стопаем
                if (this.stateBridge.translation.isOn &&
                    this.localDeviceService.me === vkIdToPeerId(this.stateBridge.translation.ownerId ?? 0)) {
                    return this.sdk.stopStream(roomId);
                }
            };
            const resetStatusData = () => {
                // сбрасываем поднятую руку
                const isRaising = getIsHandRaised(this.localDeviceService.device);
                if (!isRaising) {
                    return;
                }
                this.sdk.changeParticipantState(createSdkParticipantState(this.localDeviceService.device.statusData, {
                    hand: false,
                    drat: false,
                }));
                this.stateBridge.dispatch(resetLocalStatusData());
            };
            const resetOrator = () => {
                this.pinnedParticipantService.clearOrator();
                this.pinnedParticipantService.clearPinnedParticipant();
                this.pinnedParticipantService.clearAdminPinnedParticipant();
                this.pinnedParticipantService.clearMediaSharingPinnedParticipant();
            };
            const resetRequestHelpPopup = () => {
                if (modalHasType(this.stateBridge.modal, ModalType.ROOM_REQUEST_HELP)) {
                    this.modalService.closeModal();
                }
            };
            const resetMic = () => {
                if (!!this.localDeviceService.device?.mediaSettings?.isAudioEnabled) {
                    this.sdk.toggleLocalAudio(false);
                }
            };
            const stopScreenShare = () => {
                if (this.localDeviceService.device.mediaSettings.isScreenSharingEnabled) {
                    return this.sdk
                        .captureScreen({
                        captureScreen: false,
                        captureAudio: false,
                        fastScreenSharing: false,
                    })
                        .catch(() => handleErrorScreenShare(this.stateBridge.dispatch, this.getLang));
                }
            };
            const removeChatMessages = () => {
                if (roomId === ROOM_MAIN_ID) {
                    AdminMessagesController.getInstance().clear();
                }
            };
            const prevRoomId = this.roomsService.roomId;
            this.roomsService.setRoomId(roomId);
            removeChatMessages();
            await stopMyVideoStreamInRoom(prevRoomId);
            await stopScreenShare();
            !participantIsAdmin(this.localDeviceService.device) && resetMic();
            resetSharedUrl();
            resetStatusData();
            resetOrator();
            resetRequestHelpPopup();
            if (roomId) {
                if (this.roomsService.rooms[roomId]) {
                    enterToRoomNotification(this.stateBridge.dispatch, this.roomsService.rooms[roomId].name);
                    this.clickHouseService.sendStats(ClickHouseEventType.SESSION_ROOMS_USER_MOVED, { hall_id: roomId });
                }
            }
            else {
                exitFromRoomNotification(this.stateBridge.dispatch);
                this.clickHouseService.sendStats(ClickHouseEventType.SESSION_ROOMS_USER_LEFT);
            }
            this.refetchParticipants(roomId);
        };
        this.onRoomParticipantsUpdated = (update) => {
            this.logWarn('onRoomParticipantsUpdated', { update });
            // Если пришло не полное обновление, то запрашиваем все инфу
            // возникает при массовых перемещениях, к примеру открыли зал с 100+ чел
            if (isEmpty(update.addedParticipantIds) && isEmpty(update.removedParticipantIds)) {
                this.refetchParticipants(update.roomId);
                return;
            }
            this.roomsService.updateRoomParticipants({
                roomId: update.roomId,
                addedParticipantIds: update.addedParticipantIds,
                removedParticipantIds: update.removedParticipantIds,
                myExternalId: this.localDeviceService.externalId,
            });
            if (update.removedParticipantIds && !isEmpty(update.removedParticipantIds)) {
                for (const participantId of update.removedParticipantIds) {
                    if (isSameExternalId(participantId, this.localDeviceService.externalId)) {
                        continue;
                    }
                    this.devicesService.throttleAccumulateDispatchParticipant(participantId, {
                        roomId: ROOM_UNDEFINED_ID,
                    });
                    if (isSameExternalId(this.pinnedParticipantService.orator, participantId)) {
                        this.pinnedParticipantService.clearOrator();
                    }
                    if (isSameExternalId(this.pinnedParticipantService.adminPinnedParticipant, participantId)) {
                        this.pinnedParticipantService.clearAdminPinnedParticipant();
                    }
                    if (isSameExternalId(this.pinnedParticipantService.mediaSharingPinnedParticipant, participantId)) {
                        this.pinnedParticipantService.clearMediaSharingPinnedParticipant();
                    }
                    if (isSameExternalId(this.pinnedParticipantService.pinnedParticipant, participantId)) {
                        this.pinnedParticipantService.clearPinnedParticipant();
                    }
                }
            }
            if (update.addedParticipants && !isEmpty(update.addedParticipants)) {
                this.callService.addParticipantsToStoreThrottled({
                    participants: update.addedParticipants.filter((participant) => !isSameExternalId(participant.uid, this.localDeviceService.externalId)),
                    targetRoomId: update.roomId,
                });
                // Если админ зашел в нашу комнату, то снимаем запрос о помощи
                if (getIsHelpRequested(this.localDeviceService.device) &&
                    update.roomId === this.roomsService.roomId &&
                    update.addedParticipantIds?.some((participantId) => participantIsAdmin(this.stateBridge.participants[participantId.id]))) {
                    void this.sdk.changeParticipantState(createSdkParticipantState(this.localDeviceService.device.statusData, {
                        drat: false,
                    }));
                    this.stateBridge.dispatch(setLocalDratState(this.localDeviceService.device.statusData, false));
                }
            }
        };
        this.onAsrSet = (data, roomId) => {
            this.logWarn('onSetAsr', data, roomId);
        };
        this.onAsrStarted = (externalId, movieId, roomId) => {
            this.logWarn('onAsrStarted', externalId, movieId, roomId);
            if (isSameExternalId(externalId, this.localDeviceService.externalId)) {
                this.clickHouseService.sendStats(ClickHouseEventType.TRANSCRIPTION_STARTED);
            }
        };
        this.onAsrStopped = (roomId) => {
            this.logWarn('onAsrStopped', roomId);
        };
        this.onAsrTranscription = (externalId, text, timestamp, duration) => {
            if (this.config.debugSubtitlesLog) {
                this.logWarn('onAsrTranscription', externalId, text, timestamp, duration);
            }
            if (!text) {
                return;
            }
        };
        this.onPromotionApproved = (externalId) => {
            this.logWarn('onPromotionApproved', externalId);
        };
        this.onPeerRegistered = () => {
            const isGroupCall = getIsGroupCall(this.localDeviceService.me, this.stateBridge.peer, this.stateBridge.callData.topology);
            const isMeCreator = isCreator(this.localDeviceService.device);
            const activeParticipantsCount = getActiveParticipantsCount({
                devices: this.devicesService.devices,
                maps: this.stateBridge.maps,
                me: this.localDeviceService.me,
                participants: this.stateBridge.participants,
            });
            // Сохраняем статистику подключенных к сигналлингу собеседников только в p2p от лица инициатора звонка
            if (!isGroupCall && isMeCreator && activeParticipantsCount <= 2) {
                this.clickHouseService.sendStats(ClickHouseEventType.OUTGOING_CALL_REMOTE_RINGING, {
                    is_group_call: false,
                });
            }
        };
        makeAutoObservable(this);
    }
    get logWarn() {
        return this.sdkService.logWarn;
    }
    get sdk() {
        return this.sdkService.getSdk();
    }
    get config() {
        return this.configService.getConfig();
    }
};
CallsSdkSubscribeService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [WatchTogetherService,
        DevicesService,
        LocalDeviceService,
        CallsSdkService,
        StreamRegistry,
        PinnedParticipantService,
        StateBridge,
        RoomsService,
        CallService,
        ClickHouseService,
        Langs,
        CallsConfigService,
        PermissionsService,
        ModalService,
        SpeakersService,
        ParticipantsService])
], CallsSdkSubscribeService);
export { CallsSdkSubscribeService };
//# sourceMappingURL=CallsSdkSubscribeService.js.map