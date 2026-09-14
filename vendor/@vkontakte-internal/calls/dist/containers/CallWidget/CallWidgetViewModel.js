import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { RoomHandlersService, RoomsService } from '../../features/rooms';
import { DevicesService } from '../../services/devices/DevicesService';
import { ClickHouseEventType, externalIdToString, isSameExternalId } from '@vkontakte-internal/calls-core';
import { CallService } from '../../services/call/CallService';
import { StateBridge } from '../../utils/stateBridge';
import { E_ACTION } from '../../constants';
import { SpeakersService } from '../../services/speakers';
import { VmojiService } from '../../services/vmoji';
import { SubtitlesService } from '../../services/subtitles';
import { OnboardingService } from '../../services/onboarding';
import { PermissionsService } from '../../services/permissions';
import { PinnedParticipantService } from '../../services/PinnedParticipantService';
import { LocalDeviceService } from '../../services/localDevice';
import { handlePromiseError } from '../../helpers/logger';
import { CallsSdkService } from '../../services/sdk';
import { ClickHouseService } from '../../services/shared/ClickHouseService';
import { WatchTogetherPermissionService } from '../../features/watchTogether/services/WatchTogetherPermissionService';
import { WatchTogetherService } from '../../features/watchTogether/services/WatchTogetherService';
import { CallsConfigService } from '../../services/config';
import { Langs } from '@vkontakte-internal/plugins';
import { ParticipantsService } from '../../services/participants';
let CallWidgetViewModel = class CallWidgetViewModel {
    constructor(devicesService, localDeviceService, roomsService, roomHandlersService, callService, stateBridge, speakersService, vmojiService, subtitlesService, onboardingService, permissionsService, pinnedParticipantService, sdkService, clickHouseService, watchTogetherPermissionService, watchTogetherService, langs, configService, participantsService) {
        this.devicesService = devicesService;
        this.localDeviceService = localDeviceService;
        this.roomsService = roomsService;
        this.roomHandlersService = roomHandlersService;
        this.callService = callService;
        this.stateBridge = stateBridge;
        this.speakersService = speakersService;
        this.vmojiService = vmojiService;
        this.subtitlesService = subtitlesService;
        this.onboardingService = onboardingService;
        this.permissionsService = permissionsService;
        this.pinnedParticipantService = pinnedParticipantService;
        this.sdkService = sdkService;
        this.clickHouseService = clickHouseService;
        this.watchTogetherPermissionService = watchTogetherPermissionService;
        this.watchTogetherService = watchTogetherService;
        this.langs = langs;
        this.configService = configService;
        this.participantsService = participantsService;
        this.onPinParticipant = (_, id) => {
            let newPin = isSameExternalId(this.pinnedParticipantService.pinnedParticipant, id) ? null : id;
            if (isSameExternalId(this.pinnedParticipantService.mediaSharingPinnedParticipant, id)) {
                newPin = null;
            }
            if (this.pinnedParticipantService.watchTogetherPinnedParticipant) {
                this.pinnedParticipantService.clearWatchTogetherPinnedParticipant();
            }
            if (this.pinnedParticipantService.mediaSharingPinnedParticipant) {
                this.pinnedParticipantService.clearMediaSharingPinnedParticipant();
            }
            this.pinnedParticipantService.setPinnedParticipant(newPin);
        };
        this.onPinParticipantForce = (_, id) => {
            if (!this.callService.isOratorMode) {
                this.stateBridge.dispatch({
                    type: E_ACTION.TOGGLE_ORATOR_MODE,
                    isOratorMode: true,
                });
            }
            if (!isSameExternalId(this.pinnedParticipantService.pinnedParticipant, id)) {
                this.pinnedParticipantService.setPinnedParticipant(id);
            }
        };
        this.clearWatchTogetherPinnedParticipant = () => {
            this.pinnedParticipantService.setWatchTogetherPinnedParticipant(null);
        };
        this.setFirstVisibleDevice = (value) => {
            this.devicesService.setFirstVisibleDevice(value);
        };
        this.setDevicesVisibleCount = (value) => {
            this.devicesService.setDevicesVisibleCount(value);
        };
        this.leaveCall = () => this.callService.leaveCall();
        this.leaveRoom = () => {
            this.roomHandlersService.switchRoom();
        };
        this.onOpenWatchTogetherFeature = () => {
            this.onboardingService.onOpenWatchTogetherFeature();
        };
        this.onOratorUnpin = () => {
            if (this.pinnedParticipantService.adminPinnedParticipant && this.localDeviceService.isMeAdmin) {
                this.sdk
                    .pinParticipant(this.pinnedParticipantService.adminPinnedParticipant, true, this.roomsService.roomId)
                    .then(() => {
                    this.pinnedParticipantService.setAdminPinnedParticipant(null);
                })
                    .catch(handlePromiseError);
                this.clickHouseService.sendStats(ClickHouseEventType.ADMIN_UNPIN);
            }
            else {
                this.pinnedParticipantService.clearWatchTogetherPinnedParticipant();
                this.pinnedParticipantService.clearMediaSharingPinnedParticipant();
                this.pinnedParticipantService.clearPinnedParticipant();
            }
        };
        makeAutoObservable(this);
    }
    get sdk() {
        return this.sdkService.getSdk();
    }
    get canFinishCall() {
        return this.callService.canFinishCall;
    }
    get canTransferAdminRights() {
        return this.callService.canTransferAdminRights;
    }
    get localDevice() {
        return this.stateBridge.localDevice;
    }
    get roomId() {
        return this.roomsService.roomId;
    }
    get roomChatIds() {
        return this.roomsService.roomChatIds;
    }
    get activeDevicesCount() {
        return this.devicesService.activeDevicesCount;
    }
    get activeParticipantsList() {
        return this.devicesService.activeParticipantsList;
    }
    get myExternalId() {
        return this.stateBridge.externalId;
    }
    get isGroupCall() {
        return this.callService.isGroupCall;
    }
    get isMultiView() {
        return this.callService.isMultiView;
    }
    get isGridViewShown() {
        return this.callService.isGridViewShown;
    }
    get isOratorViewShown() {
        return this.callService.isOratorViewShown;
    }
    get isAudioAllowed() {
        return this.permissionsService.isMediaAllowed('audio', this.localDevice);
    }
    get isVideoAllowed() {
        return this.permissionsService.isMediaAllowed('video', this.localDevice);
    }
    get isScreenSharingAllowed() {
        return this.permissionsService.isMediaAllowed('screenSharing', this.localDevice);
    }
    get hasOtherDevices() {
        return this.callService.hasOtherDevices;
    }
    get hasParticipantsToShow() {
        return this.callService.hasParticipantsToShow;
    }
    get speakersInHeader() {
        return this.speakersService.speakersInHeader;
    }
    get addToParticipantLoadingQueue() {
        return this.participantsService.addToParticipantLoadingQueue;
    }
    get pinnedParticipant() {
        return this.pinnedParticipantService.pinnedParticipant;
    }
    get watchTogetherPinnedParticipant() {
        return this.pinnedParticipantService.watchTogetherPinnedParticipant;
    }
    get mediaSharingPinnedParticipant() {
        return this.pinnedParticipantService.mediaSharingPinnedParticipant;
    }
    get adminPinnedParticipant() {
        return this.pinnedParticipantService.adminPinnedParticipant;
    }
    get firstVisibleDevice() {
        return this.devicesService.firstVisibleDevice;
    }
    get devicesVisibleCount() {
        return this.devicesService.devicesVisibleCount;
    }
    get renderedParticipantListBoundaryIndexes() {
        return this.devicesService.renderedBoundaryIndexes;
    }
    get isSubtitlesEnabled() {
        return this.subtitlesService.isEnabled;
    }
    get orator() {
        if (this.pinnedParticipantService.firstMatchedId &&
            !isSameExternalId(this.localDeviceService.externalId, this.pinnedParticipantService.firstMatchedId)) {
            const device = this.stateBridge.devices[externalIdToString(this.pinnedParticipantService.firstMatchedId)];
            const participant = this.stateBridge.participants[this.pinnedParticipantService.firstMatchedId.id];
            if (device && participant) {
                return { device, participant, externalId: this.pinnedParticipantService.firstMatchedId };
            }
        }
        return {
            device: this.localDeviceService.device,
            participant: this.stateBridge.participants[this.localDeviceService.me],
            externalId: this.localDeviceService.externalId,
        };
    }
    get isMeCanManageWatchTogether() {
        return this.watchTogetherPermissionService.isMeCanManageWatchTogether;
    }
    get watchTogetherMovieState() {
        return this.watchTogetherService.movieState;
    }
    get watchTogetherMovieInfo() {
        return this.watchTogetherService.movieInfo;
    }
    get watchTogetherHint() {
        const { enableNewViewOfMuteActions, sferum: isSferum } = this.configService.getConfig();
        const hasNewViewOfMuteActions = isSferum || enableNewViewOfMuteActions;
        const isHasMovieInCall = !!this.watchTogetherService.movieInfo;
        switch (true) {
            // Пользователь админ иначе =>
            // Мувика нет в звонке и у пользователя не установлен пермамьют на СП иначе =>
            // Мувик есть в звонке и запущен этим пользователем и у пользователя не установлен пермамьют на СП
            case this.watchTogetherPermissionService.isMeCanManageWatchTogether: {
                // Смотреть VK Видео вместе
                return hasNewViewOfMuteActions
                    ? this.langs.getLang('calls_watch_together_hint')
                    : this.langs.getLang('calls_watch_movie_together');
            }
            // У пользователя Пермамьют на СП
            case !this.watchTogetherPermissionService.isWatchTogetherAllowed: {
                // Администратор запретил включать совместный просмотр видео
                return this.langs.getLang('calls_notification_admin_permanent_mute_watch_together');
            }
            // Мувик есть в звонке и запущен не этим пользователем
            case isHasMovieInCall && !this.localDeviceService.isMovieOwner: {
                // Другой участник включил просмотр видео
                return this.langs.getLang('calls_movie_already_started');
            }
            // На всякий случай если что-то пошло не так, покажем обычный хинт
            default: {
                // Смотреть VK Видео вместе
                return hasNewViewOfMuteActions
                    ? this.langs.getLang('calls_watch_together_hint')
                    : this.langs.getLang('calls_watch_movie_together');
            }
        }
    }
};
CallWidgetViewModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [DevicesService,
        LocalDeviceService,
        RoomsService,
        RoomHandlersService,
        CallService,
        StateBridge,
        SpeakersService,
        VmojiService,
        SubtitlesService,
        OnboardingService,
        PermissionsService,
        PinnedParticipantService,
        CallsSdkService,
        ClickHouseService,
        WatchTogetherPermissionService,
        WatchTogetherService,
        Langs,
        CallsConfigService,
        ParticipantsService])
], CallWidgetViewModel);
export const { Provider: CallProvider, useModel: useCallWidgetViewModel } = createProvider(CallWidgetViewModel);
//# sourceMappingURL=CallWidgetViewModel.js.map