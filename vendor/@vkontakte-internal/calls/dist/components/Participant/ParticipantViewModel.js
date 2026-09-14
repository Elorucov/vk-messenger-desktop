import { __decorate, __metadata } from "tslib";
import { MediaType, ParticipantStatus } from '@vkontakte/calls-sdk';
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { getVideoSuspendReason, StreamRegistry } from '../../services/stream';
import { EVideoOptionType, externalIdToString, isSameExternalId, } from '@vkontakte-internal/calls-core';
import { getAvailableStreamModes, getDeviceHasVideo, getIsHandRaised, getSingleLetter, isParticipantAnonymOrContact, } from '../../helpers/participant';
import { StateBridge } from '../../utils/stateBridge';
import { getRemoteDeviceByExternalId } from '../../selectors';
import { isScreenShareShown } from './helpers';
import { ParticipantAppearance } from './types';
import { LangUtils } from '../../services/Lang';
import { getNetworkRatingColorClass } from '../../features/networkIndicator';
import { getTypeSizeOfStream } from '../../features/simplePiP/utils';
import { SpeakersService } from '../../services/speakers';
import { CallsConfigService } from '../../services/config';
import { DevicesService } from '../../services/devices';
let ParticipantViewModel = class ParticipantViewModel {
    constructor(_config, _props, stateBridge, langUtils, streamRegistry, speakersService, devicesService) {
        this._config = _config;
        this._props = _props;
        this.stateBridge = stateBridge;
        this.langUtils = langUtils;
        this.streamRegistry = streamRegistry;
        this.speakersService = speakersService;
        this.devicesService = devicesService;
        this.handleClick = (e) => {
            this.props.onClickParticipant?.(e, this.externalId);
        };
        this.handleDblClick = (e) => {
            this.props.onDblClickParticipant?.(e, this.externalId);
        };
        this.handleStopScreenShare = (e) => {
            this.props.onStopScreenShare?.(e);
        };
        makeAutoObservable(this);
    }
    get id() {
        return externalIdToString(this.externalId);
    }
    get peerId() {
        return this.externalId.id;
    }
    get props() {
        return this._props.current;
    }
    get config() {
        return this._config.getConfig();
    }
    get device() {
        const { devices, externalId: myExternalId, localDevice } = this.stateBridge;
        if (myExternalId && isSameExternalId(myExternalId, this.externalId)) {
            return localDevice;
        }
        else {
            return getRemoteDeviceByExternalId({ devices }, this.externalId);
        }
    }
    get mediaSettings() {
        return this.device?.mediaSettings;
    }
    get isAnimojiEnabled() {
        return !!this.mediaSettings?.isAnimojiEnabled;
    }
    get isAudioEnabled() {
        return !!this.mediaSettings?.isAudioEnabled;
    }
    get hasMovieStream() {
        return !!this.device?.movieStreamInfo;
    }
    get isOratorAppearance() {
        return this.appearance === ParticipantAppearance.ORATOR;
    }
    get isGridAppearance() {
        return this.appearance === ParticipantAppearance.GRID;
    }
    get isSausageAppearance() {
        return this.appearance === ParticipantAppearance.SAUSAGE;
    }
    get isMiniAppearance() {
        return this.appearance === ParticipantAppearance.MINI;
    }
    get isWaitingHallAppearance() {
        return this.appearance === ParticipantAppearance.WAITING;
    }
    get streamData() {
        return this.devicesService.getDeviceStreamData({
            isMe: this.isMe,
            isOrator: !!this.props.isOrator,
            isSausageStream: this.isSausageAppearance,
            device: this.device,
            topology: this.stateBridge.callData?.topology,
        });
    }
    get mediaStream() {
        return this.streamData?.data;
    }
    get mediaType() {
        return this.streamData?.type;
    }
    get hasVideo() {
        return getDeviceHasVideo(this.device);
    }
    get isSharingScreen() {
        return isScreenShareShown(this.mediaSettings, this.isSausageAppearance && !!this.props.isOrator);
    }
    get isWatchTogether() {
        return getTypeSizeOfStream(this.streamData?.type ?? MediaType.CAMERA) === 'wide';
    }
    get isMeMainScreenSharer() {
        return Boolean(this.isMe &&
            this.isOratorAppearance &&
            this.isSharingScreen &&
            this.streamData?.type === MediaType.SCREEN);
    }
    get isShowCamera() {
        return this.hasVideo && (!this.isMeMainScreenSharer || this.streamData?.type === MediaType.CAMERA);
    }
    get isShowVideo() {
        return Boolean(this.streamData?.data &&
            (this.isShowCamera ||
                this.streamData?.type === MediaType.MOVIE ||
                this.streamData?.type === MediaType.STREAM));
    }
    get storedVideoOptions() {
        return this.stateBridge.virtualBackgroundSettings?.videoOptions;
    }
    get isMirrored() {
        return Boolean(this.isMe &&
            !this.isAnimojiEnabled &&
            this.streamData?.type === MediaType.CAMERA &&
            this.storedVideoOptions?.[EVideoOptionType.IS_VIDEO_MIRRORED]);
    }
    get videoSuspendReason() {
        if (this.isMe || !this.mediaSettings) {
            // Мой видео поток не может быть остановлен сервером для меня же
            return undefined;
        }
        return getVideoSuspendReason({
            hasMovieStream: this.hasMovieStream,
            videoSuspendMode: this.stateBridge.videoSuspendMode,
            mediaSettings: this.mediaSettings,
            deviceStreams: this.streamRegistry.streams.get(this.id),
            mediaType: this.streamData?.type,
        });
    }
    get allowContain() {
        return (this.isOratorAppearance ||
            this.isWaitingHallAppearance ||
            this.appearance === ParticipantAppearance.ONE_TO_ONE);
    }
    get letter() {
        return this.props.letter ?? getSingleLetter(this.name);
    }
    /**
     * индикатор плохой сети
     */
    get networkStateColorClass() {
        return getNetworkRatingColorClass(this.device?.networkStatus ?? 1);
    }
    get isInteractive() {
        return !!this.props.onClickParticipant || !!this.props.onDblClickParticipant;
    }
    get shouldHidePhoto() {
        return !this.config.anonymPhoto && this.isAnonymOrContact;
    }
    get isAnonymOrContact() {
        return isParticipantAnonymOrContact(this.externalId);
    }
    get isHandRaised() {
        return (this.isSausageAppearance || this.isGridAppearance) && getIsHandRaised(this.device);
    }
    get raisedHandLabel() {
        const string = this.langUtils.langSex(this.props.gender ?? 0, 'calls_notification_raised_hand', this.langUtils.getLang('calls_notification_raised_hand', 'raw'));
        return string.replace('{user}', this.name);
    }
    get participantLabel() {
        return this.isHandRaised ? this.raisedHandLabel : this.name;
    }
    get isInfoShown() {
        return !!this.props.isInfoShown;
    }
    get isMe() {
        return !!this.props.isMe;
    }
    get isMiniApp() {
        return !!this.props.isMiniApp;
    }
    get isNFT() {
        return !!this.props.isNFT;
    }
    get isPinned() {
        return !!this.props.isPinned;
    }
    get isPinnedByAdmin() {
        return !!this.props.isPinnedByAdmin;
    }
    get isSpeaking() {
        const isSpeaker = this.speakersService.isSpeaker(this.id);
        return (this.isAudioEnabled &&
            isSpeaker &&
            this.isVisible &&
            (this.isSausageAppearance || this.isGridAppearance));
    }
    get isVisible() {
        return this.props.isVisible !== false;
    }
    get name() {
        return this.props.name ?? '';
    }
    get photo() {
        return this.shouldHidePhoto ? '' : this.props.photo ?? '';
    }
    get photoSize() {
        return this.props.photoSize;
    }
    get shouldShowStatus() {
        return this.status !== ParticipantStatus.CONNECTED && !this.isMe;
    }
    get streamModes() {
        return this.device
            ? getAvailableStreamModes(this.device).filter((mode) => mode !== MediaType.CAMERA)
            : [];
    }
    /**
     * список урлов на картинки с реакциями
     */
    get reactions() {
        return this.stateBridge.reactions?.reactions;
    }
    get reaction() {
        return this.props.reaction;
    }
    get wasConnected() {
        return !!this.device?.wasConnected;
    }
    get appearance() {
        return this.props.appearance;
    }
    get externalId() {
        return this.props.externalId;
    }
    get status() {
        return this.props.status ?? ParticipantStatus.CONNECTED;
    }
};
ParticipantViewModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [CallsConfigService,
        Props,
        StateBridge,
        LangUtils,
        StreamRegistry,
        SpeakersService,
        DevicesService])
], ParticipantViewModel);
export { ParticipantViewModel };
export const { Provider: ParticipantViewModelProvider, useModel: useParticipantViewModel } = createProvider(ParticipantViewModel, { isolatedContext: false, onlyTransient: true });
//# sourceMappingURL=ParticipantViewModel.js.map