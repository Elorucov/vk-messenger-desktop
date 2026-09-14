import { __decorate, __metadata } from "tslib";
import { MediaType } from '@vkontakte/calls-sdk';
import { createProvider, destroy, init, scope } from '@vkontakte-internal/di';
import { makeAutoObservable, reaction } from 'mobx';
import { externalIdToString, isSameExternalId, isGroupCallByPeerAndMe, isParticipantWithVideo, isParticipantWithMovie, UIMode, ClickHouseEventType, } from '@vkontakte-internal/calls-core';
import { getStream } from '../../helpers/participant';
import { getVideoSuspendReason, StreamRegistry } from '../../services/stream';
import { StateBridge } from '../../utils/stateBridge';
import { CallService } from '../../services/call';
import { PermissionsService } from '../../services/permissions';
import { createLogger } from '../../services/logger';
import { CallsSdkService } from '../../services/sdk';
import { PictureInPictureService } from './models/PictureInPictureService';
import { changeUiMode } from '../../actions';
import { sendStats } from '../../stats/clickHouse';
import { VmojiService } from '../../services/vmoji';
import { DevicesService } from '../../services/devices/DevicesService';
import { RoomHandlersService, RoomsService } from '../rooms';
let PiPViewModel = class PiPViewModel {
    constructor(callService, devicesService, permissionsService, pipService, roomHandlersService, roomsService, sdkService, stateBridge, streamRegistry, vmojiService) {
        this.callService = callService;
        this.devicesService = devicesService;
        this.permissionsService = permissionsService;
        this.pipService = pipService;
        this.roomHandlersService = roomHandlersService;
        this.roomsService = roomsService;
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        this.streamRegistry = streamRegistry;
        this.vmojiService = vmojiService;
        this.pipRunInAuto = false;
        this.logger = createLogger('PiPViewModel', this.sdkService.getSdk());
        this.onToggleAudio = () => {
            if (!this.permissionsService.isMediaAllowed('audio', this.localDevice)) {
                return;
            }
            this.logger.warn('onToggleAudio');
            this.sdkService.getSdk().toggleLocalAudio(!this.isLocalAudioEnabled);
        };
        this.onToggleVideo = () => {
            if (!this.permissionsService.isMediaAllowed('video', this.localDevice)) {
                return;
            }
            this.logger.warn('onToggleVideo');
            this.sdkService.getSdk().toggleLocalVideo(!this.isLocalVideoEnabled);
        };
        this.closePiP = () => {
            this.stateBridge.dispatch(changeUiMode(UIMode.DEFAULT));
        };
        this.enablePiP = () => {
            this.pipRunInAuto = true;
            this.stateBridge.dispatch(changeUiMode(UIMode.COLLAPSED));
        };
        this.hangup = () => {
            if (this.roomsService.roomsCount > 0) {
                this.closePiP();
                void this.roomHandlersService.switchRoom();
                return;
            }
            if (!this.canTransferAdminRights && !this.canFinishCall) {
                this.closePiP();
                this.callService.leaveCall();
                return;
            }
            this.closePiP();
            if (this.canTransferAdminRights) {
                this.callService.showTransferAdminRightsDialog();
            }
            else {
                this.callService.showLeaveBox();
            }
        };
        this.disposeModeReaction = null;
        this.disposeReactionOnParticipant = null;
        makeAutoObservable(this);
    }
    /**
     * Зеркалить видео или нет
     * Только для своей камеры
     */
    get shouldMirrorMainVideo() {
        return this.isMe && this.streamData?.type === MediaType.CAMERA;
    }
    get streamData() {
        return this.devicesService.visibleParticipantStreamData;
    }
    get videoSuspendReason() {
        if (this.isMe || !this.visibleParticipant) {
            return undefined;
        }
        const device = this.visibleParticipant;
        return getVideoSuspendReason({
            hasMovieStream: !!device.movieStreamInfo,
            videoSuspendMode: this.stateBridge.videoSuspendMode,
            mediaSettings: device.mediaSettings,
            deviceStreams: this.streamRegistry.streams.get(externalIdToString(device.externalId)),
            mediaType: this.streamData?.type,
        });
    }
    get visibleParticipant() {
        return this.devicesService.visibleParticipant;
    }
    get isMe() {
        return isSameExternalId(this.visibleParticipant.externalId, this.stateBridge.externalId);
    }
    get localDevice() {
        return this.stateBridge.localDevice;
    }
    get localVideoStreamData() {
        return getStream(this.localDevice, { useCameraOrAnimoji: true });
    }
    get isOverlayLocalVideoEnabled() {
        return Boolean(this.localVideoStreamData && this.visibleParticipant && !this.isMe);
    }
    get localOverlayStream() {
        if (this.isOverlayLocalVideoEnabled) {
            return this.localVideoStreamData;
        }
    }
    get activeParticipantsList() {
        const visibleExternalId = this.visibleParticipant.externalId;
        if (!this.stateBridge.externalId || isSameExternalId(visibleExternalId, this.stateBridge.externalId)) {
            return [visibleExternalId];
        }
        return [visibleExternalId, this.stateBridge.externalId];
    }
    get visibleParticipantData() {
        const opponent = isGroupCallByPeerAndMe(this.stateBridge.peer, this.stateBridge.me)
            ? this.stateBridge.callData.conversation
            : this.stateBridge.participants[this.stateBridge.peer];
        const opponentPhoto = opponent?.photo ?? '';
        if (!this.visibleParticipant) {
            return {
                isWithVideo: false,
                photo: opponentPhoto,
            };
        }
        const participant = this.stateBridge.participants[this.visibleParticipant.externalId.id];
        if (!participant) {
            return {
                isWithVideo: false,
                photo: opponentPhoto,
            };
        }
        return {
            isWithVideo: isParticipantWithVideo(this.visibleParticipant) || isParticipantWithMovie(this.visibleParticipant),
            photo: participant.photo,
            isNFT: participant?.is_nft,
        };
    }
    get isLocalAudioEnabled() {
        return Boolean(this.localDevice.mediaSettings?.isAudioEnabled);
    }
    get isLocalVideoEnabled() {
        return Boolean(this.localDevice.mediaSettings?.isVideoEnabled);
    }
    get shouldMirrorOverlayVideo() {
        return !this.localDevice.animojiStream && this.localVideoStreamData?.type === MediaType.CAMERA;
    }
    get targetElement() {
        return this.pipService.targetElement;
    }
    get pipIsRunning() {
        return this.pipService.isRunning;
    }
    get activeDevicesCount() {
        return this.devicesService.activeDevicesCount;
    }
    get canFinishCall() {
        return this.callService.canFinishCall;
    }
    get canTransferAdminRights() {
        return this.callService.canTransferAdminRights;
    }
    [init]() {
        this.disposeReactionOnParticipant = reaction(() => this.activeParticipantsList, (externalIds) => {
            this.vmojiService.loadMultipleSvg(externalIds);
        });
        this.disposeModeReaction = reaction(() => this.stateBridge.uiMode, (mode) => {
            if (!this.pipService.isSupportApi) {
                return;
            }
            if (mode === UIMode.DEFAULT) {
                this.pipService.toggleRunning(false);
                this.pipRunInAuto = false;
            }
            if (mode === UIMode.COLLAPSED) {
                this.pipService.toggleRunning(true);
                sendStats(ClickHouseEventType.CALL_COLLAPSED, { event_param: this.pipRunInAuto ? 3 : 2 });
            }
        });
    }
    [destroy]() {
        this.disposeReactionOnParticipant?.();
        this.disposeModeReaction?.();
    }
};
PiPViewModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [CallService,
        DevicesService,
        PermissionsService,
        PictureInPictureService,
        RoomHandlersService,
        RoomsService,
        CallsSdkService,
        StateBridge,
        StreamRegistry,
        VmojiService])
], PiPViewModel);
export { PiPViewModel };
export const { Provider: PiPViewModelProvider, useModel: usePiPViewModel } = createProvider(PiPViewModel);
//# sourceMappingURL=PiPViewModel.js.map