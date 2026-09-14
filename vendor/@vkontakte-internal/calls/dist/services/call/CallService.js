import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { ErrorHandleType, ModalType, isCreator, isEmptyPeerId, isGroupCall, participantIsAdmin, objectReduce, getSharingMiniAppParticipantId, NotificationType, CallsEventType, ROOM_MAIN_ID, isSameExternalId, UIMode, getDefaultExternalId, externalIdToString, ECallViewMode, } from '@vkontakte-internal/calls-core';
import { StateBridge } from '../../utils/stateBridge';
import { scope, destroy } from '@vkontakte-internal/di';
import { DevicesService } from '../devices/DevicesService';
import { LocalDeviceService } from '../localDevice';
import { isMiniAppSource } from '../../helpers/apps';
import { Langs, MessagesApi } from '@vkontakte-internal/plugins';
import { RoomsService } from '../../features/rooms';
import { getIsVoiceRoomTribuneMode } from '../../features/voiceRoom/selectors/computed/common';
import { setShowLoader, toggleModal } from '../../actions';
import { ClickHouseEventType, sendStats } from '../../stats/clickHouse';
import { CallsSdkService } from '../sdk';
import { objectSome } from '../../helpers/helpers';
import { E_ACTION } from '../../constants';
import { sendVirtualBackgroundDisabled } from '../../helpers/statsVirtualBackground';
import { WatchTogetherService } from '../../features/watchTogether/services/WatchTogetherService';
import { createUnsubscribes } from '../../helpers/serviceUnsubscribers';
import { eventBus } from '../eventBus';
import { callStatDataStorage } from '../../stats/callStatDataStorage';
import { PinnedParticipantService } from '../PinnedParticipantService';
import { mapExternalParticipantToDevice } from '../../helpers/throttleAccumulateDispatch';
import { getPeerIdDeviceInfo } from '../../helpers/participant';
var CallService = class CallService {
    constructor(devicesService, langs, localDeviceService, messagesApi, roomsService, sdkService, stateBridge, watchTogetherService, pinnedParticipantService) {
        this.devicesService = devicesService;
        this.langs = langs;
        this.localDeviceService = localDeviceService;
        this.messagesApi = messagesApi;
        this.roomsService = roomsService;
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        this.watchTogetherService = watchTogetherService;
        this.pinnedParticipantService = pinnedParticipantService;
        this._unsubscribes = createUnsubscribes();
        this._isInActiveCall = false;
        this.setOratorMode = (isOratorMode) => {
            this.stateBridge.dispatch({
                type: E_ACTION.TOGGLE_ORATOR_MODE,
                isOratorMode,
            });
        };
        this.updateCallScreenForMediaSharer = (mediaSharingPinnedParticipant) => {
            const isOratorMode = !!mediaSharingPinnedParticipant ||
                (this.totalMediaSharers === 1 &&
                    !!(this.pinnedParticipantService.adminPinnedParticipant ||
                        this.pinnedParticipantService.pinnedParticipant));
            if (isOratorMode && !this.isOratorMode) {
                this.setOratorMode(true);
            }
            if (!isOratorMode && this.pinnedParticipantService.mediaSharingNeedDisableOratorModeAfterStop) {
                this.setOratorMode(false);
            }
            this.pinnedParticipantService.setMediaSharingPinnedParticipant(this.pinnedParticipantService.watchTogetherPinnedParticipant ? null : mediaSharingPinnedParticipant, !this.isOratorMode, this.pinnedParticipantService.pinnedParticipant);
            if (mediaSharingPinnedParticipant && this.pinnedParticipantService.pinnedParticipant) {
                this.pinnedParticipantService.setPinnedParticipant(null);
            }
            if (!mediaSharingPinnedParticipant &&
                !this.pinnedParticipantService.pinnedParticipant &&
                this.pinnedParticipantService.mediaSharingOldPinnedParticipant) {
                this.pinnedParticipantService.setPinnedParticipant(this.pinnedParticipantService.mediaSharingOldPinnedParticipant);
            }
        };
        this.toggleUrlSharingForParticipant = (isUrlSharingEnabled, participantId) => {
            this.updateCallScreenForMediaSharer(isUrlSharingEnabled ? participantId : null);
            const device = this.devicesService.getDeviceByExternalId(participantId);
            const hadSharedApp = !!device?.sharedUrl || !!device?.sharedMiniAppId;
            if (hadSharedApp !== isUrlSharingEnabled) {
                this.stateBridge.dispatch({
                    type: E_ACTION.SET_MEDIA_SHARER,
                    participantId,
                    isMediaSharingEnabled: isUrlSharingEnabled,
                });
            }
        };
        this.changeScreenSharingReaction = (isScreenSharingEnabled, participantId, isWithNotification) => {
            if (!this.roomsService.checkIsInMyRoom(participantId)) {
                return;
            }
            if (!isScreenSharingEnabled && getSharingMiniAppParticipantId(this.stateBridge)) {
                // prevent pin changing if it's initialized by url sharing
                return;
            }
            this.updateCallScreenForMediaSharer(isScreenSharingEnabled ? participantId : null);
            const device = this.devicesService.getDeviceByExternalId(participantId);
            const currentMediaSettings = device?.mediaSettings;
            if (!!currentMediaSettings?.isScreenSharingEnabled !== isScreenSharingEnabled) {
                this.stateBridge.dispatch({
                    type: E_ACTION.SET_MEDIA_SHARER,
                    participantId,
                    isMediaSharingEnabled: isScreenSharingEnabled,
                });
            }
            if (isWithNotification) {
                this.stateBridge.dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: {
                        type: isScreenSharingEnabled
                            ? NotificationType.SCREEN_SHARING_STARTED
                            : NotificationType.SCREEN_SHARING_STOPPED,
                        data: participantId.id,
                        hidden: !isScreenSharingEnabled,
                    },
                });
            }
        };
        this.handleLocalStreamUpdate = (mediaSettings) => {
            // TODO CHECK WITH MOBILE was duplicated MuteStatesHandler.decreasePermissionsOnce(state, dispatch, mediaSettings);
            if (mediaSettings.isScreenSharingEnabled !==
                this.localDeviceService.device.mediaSettings?.isScreenSharingEnabled) {
                if (this.localDeviceService.externalId) {
                    this.changeScreenSharingReaction(mediaSettings.isScreenSharingEnabled, this.localDeviceService.externalId);
                    if (mediaSettings.isScreenSharingEnabled) {
                        eventBus.emit(CallsEventType.SCREEN_SHARING_ENABLED);
                    }
                    else {
                        eventBus.emit(CallsEventType.SCREEN_SHARING_DISABLED);
                    }
                }
            }
            callStatDataStorage.set({
                hadVideoEnabled: mediaSettings.isVideoEnabled,
            });
        };
        this.addParticipantsToStoreThrottled = ({ participants, targetRoomId = ROOM_MAIN_ID, toggleScreenShareForce, }) => {
            for (const participant of participants) {
                if (isSameExternalId(participant.uid, this.localDeviceService.externalId)) {
                    continue;
                }
                const movieShareInfos = participant.movieShareInfos;
                const participantData = mapExternalParticipantToDevice(participant);
                if (movieShareInfos?.length) {
                    if (this.pinnedParticipantService.mediaSharingOldPinnedParticipant) {
                        this.pinnedParticipantService.clearMediaSharingPinnedParticipant();
                    }
                    if (this.roomsService.equalsToMyRoom(targetRoomId)) {
                        this.watchTogetherService.setMovieInfo(movieShareInfos[0]);
                        this.watchTogetherService.setOwner(participant.uid);
                        this.pinnedParticipantService.setWatchTogetherPinnedParticipant(participant.uid);
                    }
                    participantData.movieStreamInfo = movieShareInfos[0];
                    participantData.movieStreamStoppedInfo = null;
                }
                // В случае если roomId указан, прокидываем его, чтобы привязать девайсы к комнате
                if (targetRoomId !== undefined) {
                    participantData.roomId = targetRoomId;
                }
                this.devicesService.throttleAccumulateDispatchParticipant(participant.uid, participantData);
                const deviceState = this.devicesService.getDeviceByExternalId(participant.uid);
                const wasSharingScreen = deviceState?.mediaSettings?.isScreenSharingEnabled || false;
                if (toggleScreenShareForce || participant?.mediaSettings?.isScreenSharingEnabled !== wasSharingScreen) {
                    this.changeScreenSharingReaction(Boolean(participant?.mediaSettings?.isScreenSharingEnabled), participant.uid, true);
                }
            }
        };
        makeAutoObservable(this);
        this._unsubscribes.add(this.sdkService.subscribe('onLocalStreamUpdate', this.handleLocalStreamUpdate));
    }
    [destroy]() {
        this._unsubscribes.clear();
    }
    get isGroupCall() {
        const { me, peer, callData } = this.stateBridge;
        return isGroupCall(me, peer, callData.topology);
    }
    get isMultiView() {
        return this.isGroupCall || this.devicesService.activeDevicesCount > 2;
    }
    get hasOtherDevices() {
        return this.devicesService.activeDevicesCount > 1;
    }
    get hasParticipantsToShow() {
        const { isMeWithVideo, isMeWithMovieShare, isSharedMiniAppShownFromMe } = this.localDeviceService;
        return this.hasOtherDevices || isMeWithVideo || isMeWithMovieShare || isSharedMiniAppShownFromMe;
    }
    get isOratorMode() {
        return this.stateBridge.isOratorMode;
    }
    get isGridViewShown() {
        return this.isMultiView && this.hasParticipantsToShow && !this.isOratorMode;
    }
    get isOratorViewShown() {
        return this.isMultiView && this.hasParticipantsToShow && this.isOratorMode;
    }
    get isMiniApp() {
        return isMiniAppSource(this.stateBridge.entryPoint?.source);
    }
    get callViewMode() {
        if (!this.isGroupCall) {
            return ECallViewMode.P2P;
        }
        if (this.stateBridge.uiMode === UIMode.COLLAPSED) {
            return ECallViewMode.Collapsed;
        }
        if (this.isOratorMode) {
            return ECallViewMode.Orator;
        }
        return ECallViewMode.Grid;
    }
    get oratorDevice() {
        return 'externalId' in this.orator.device
            ? this.orator.device
            : {
                ...this.orator.device,
                externalId: this.stateBridge.externalId || getDefaultExternalId(),
            };
    }
    get oratorExternalId() {
        return this.pinnedParticipantService.firstMatchedId || this.stateBridge.externalId;
    }
    get orator() {
        const externalId = this.oratorExternalId;
        const { localDevice, me, externalId: myExternalId, participants, devices } = this.stateBridge;
        if (externalId && !isSameExternalId(myExternalId, externalId)) {
            const device = devices[externalIdToString(externalId)];
            const participant = participants[externalId.id];
            if (device && participant) {
                return { device, participant, externalId };
            }
        }
        return {
            device: localDevice,
            participant: participants[me],
            externalId: myExternalId,
        };
    }
    get peerDevice() {
        return getPeerIdDeviceInfo(this.stateBridge.peer, this.stateBridge.devices);
    }
    get isInActiveCall() {
        return this._isInActiveCall;
    }
    set isInActiveCall(value) {
        this._isInActiveCall = value;
    }
    get hasOtherParticipants() {
        const { devices, externalId, me } = this.stateBridge;
        const myId = externalId?.id || me.toString();
        return objectSome(devices, (device) => {
            return device.externalId.id !== myId;
        });
    }
    get canFinishCall() {
        const { callData, localDevice, peer: peerId } = this.stateBridge;
        return this.isGroupCall && isCreator(localDevice) && (callData?.canFinishCall || isEmptyPeerId(peerId));
    }
    get canTransferAdminRights() {
        const { externalId, isVoiceRoom, localDevice, maps, voiceRoom } = this.stateBridge;
        const isTribune = getIsVoiceRoomTribuneMode({ isVoiceRoom, voiceRoom });
        if (!this.isGroupCall || !participantIsAdmin(localDevice) || !isTribune) {
            return false;
        }
        if (externalId) {
            const isOtherDevices = !!maps.peerIdToDevices.get(externalId.id)?.size;
            if (isOtherDevices) {
                return false;
            }
        }
        const { admins, users } = this.devicesService.getNonAnonymousConnectedParticipantsCount();
        return !!users && !admins;
    }
    leaveCall(shouldSendStats = true) {
        if (this.canTransferAdminRights) {
            this.showTransferAdminRightsDialog();
        }
        else if (this.canFinishCall) {
            this.showLeaveBox();
        }
        else {
            this.sdkService.getSdk().hangup();
            if (shouldSendStats) {
                sendStats(ClickHouseEventType.CALL_DECLINED_OR_HANGED_LOCALLY, {
                    reason: 'none',
                    group_call_users_count: this.devicesService.activeDevicesCount,
                });
            }
        }
    }
    showTransferAdminRightsDialog() {
        this.stateBridge.dispatch(toggleModal(ModalType.TRANSFER_ADMIN_RIGHTS));
    }
    showLeaveBox() {
        this.stateBridge.dispatch(toggleModal(ModalType.EXIT));
    }
    forceCallFinish() {
        // getLang: TGetLang, // dispatch: IDispatchCallsActions, // peer: IPeerId, // callId: string, // bridge: Bridge, // SDK: { hangup: () => Promise<void> },
        const { callData: { callId = '' }, dispatch, peer, } = this.stateBridge;
        dispatch(setShowLoader(true));
        // тк именно мы "закончили звонок для всех" - оставляем пометку
        dispatch({
            type: E_ACTION.SET_LAST_CALL_DATA,
            data: { isMeEndedCallForAll: true },
        });
        this.messagesApi
            .forceCallFinish({ call_id: callId })
            .catch((error) => {
            console.error(error);
            dispatch({
                type: E_ACTION.ERROR,
                text: this.langs.getLang('calls_error_force_call_finish'),
                handleType: ErrorHandleType.FATAL,
            });
            dispatch({
                type: E_ACTION.CLEAN_LAST_CALL_DATA,
            });
            if (!window.navigator.onLine) {
                this.isInActiveCall = false;
                window.addEventListener('online', () => {
                    void this.sdkService.getSdk().hangup();
                }, { once: true });
            }
        })
            .finally(() => {
            dispatch(setShowLoader(false));
        });
        sendVirtualBackgroundDisabled(callId, peer);
    }
    get totalMediaSharers() {
        return objectReduce(this.stateBridge.mediaSharers, (count, sharer) => {
            return sharer ? count + 1 : count;
        }, 0);
    }
};
CallService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [DevicesService,
        Langs,
        LocalDeviceService,
        MessagesApi,
        RoomsService,
        CallsSdkService,
        StateBridge,
        WatchTogetherService,
        PinnedParticipantService])
], CallService);
export { CallService };
//# sourceMappingURL=CallService.js.map