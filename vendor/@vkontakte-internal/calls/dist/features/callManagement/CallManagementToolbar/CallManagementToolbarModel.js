import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { CallStatScreen, MuteParticipantMode, participantIsAdmin, } from '@vkontakte-internal/calls-core';
import { MediaOption } from '@vkontakte/calls-sdk';
import { makeAutoObservable } from 'mobx';
import { RoomsService } from '../../rooms';
import { StateBridge } from '../../../utils/stateBridge';
import { CallService } from '../../../services/call';
import { DevicesService } from '../../../services/devices/DevicesService';
import { PermissionsService } from '../../../services/permissions';
import { CallsSdkService } from '../../../services/sdk';
import { ClickHouseEventType, sendStats } from '../../../stats/clickHouse';
import { handlePromiseError } from '../../../helpers/logger';
import { canMuteParticipants, getIsHandRaised } from '../../../helpers/participant';
let CallManagementToolbarModel = class CallManagementToolbarModel {
    constructor(_props, callService, devicesService, permissionsService, roomsService, sdkService, stateBridge) {
        this._props = _props;
        this.callService = callService;
        this.devicesService = devicesService;
        this.permissionsService = permissionsService;
        this.roomsService = roomsService;
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        this.isMediaSettingEnabled = (device, mediaSettingsKey) => {
            if (!device?.mediaSettings[mediaSettingsKey]) {
                return false;
            }
            const id = device?.externalId?.id;
            return id && this.stateBridge.participants[id] && !participantIsAdmin(this.stateBridge.participants[id]);
        };
        this.muteMicrophones = () => this.permissionsService.getMuteController(MuteParticipantMode.ALL_AUDIO).mute({
            additionalStatsData: { screen: CallStatScreen.ParticipantsManager },
            participantExternalId: null,
            roomId: this.roomId,
        });
        this.muteCameras = () => this.permissionsService.getMuteController(MuteParticipantMode.ALL_VIDEO).mute({
            additionalStatsData: { screen: CallStatScreen.ParticipantsManager },
            participantExternalId: null,
            roomId: this.roomId,
        });
        this.unmuteAll = () => {
            this.sdkService
                .getSdk()
                .muteParticipant({
                muteStates: {},
                requestedMedia: [MediaOption.AUDIO, MediaOption.VIDEO],
                roomId: this.roomId,
            })
                .then(() => sendStats(ClickHouseEventType.ASK_ALL_TO_UNMUTE, {
                screen: CallStatScreen.ParticipantsManager,
            }))
                .catch(handlePromiseError);
        };
        this.putAllHandsDown = () => {
            this.sdkService
                .getSdk()
                .putHandsDown()
                .then(() => sendStats(ClickHouseEventType.ALL_HAND_LOWERED, {
                screen: CallStatScreen.ParticipantsManager,
            }))
                .catch(handlePromiseError);
        };
        makeAutoObservable(this);
    }
    get props() {
        return this._props.current;
    }
    get roomId() {
        return this.roomsService?.roomId;
    }
    get isSomeHandRaised() {
        return this.devicesService.devicesInMyRoom.some(getIsHandRaised);
    }
    get isSomeUserMicrophoneEnabled() {
        return this.devicesService.devicesInMyRoom.some((device) => this.isMediaSettingEnabled(device, 'isAudioEnabled'));
    }
    get isSomeUserCameraEnabled() {
        return this.devicesService.devicesInMyRoom.some((device) => this.isMediaSettingEnabled(device, 'isVideoEnabled'));
    }
    get isMeCanMuteParticipants() {
        return canMuteParticipants(this.stateBridge.localDevice);
    }
    get isMeAdmin() {
        return participantIsAdmin(this.stateBridge.localDevice);
    }
    get canFinishCall() {
        return this.callService.canFinishCall;
    }
    get hasOtherParticipants() {
        return this.callService.hasOtherParticipants;
    }
    get isAllowedAddMembers() {
        return this.props.isAllowedAddMembers;
    }
    get addUserClick() {
        return this.props.addUserClick;
    }
    get onLinkBlockClick() {
        return this.props.onLinkBlockClick;
    }
};
CallManagementToolbarModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        CallService,
        DevicesService,
        PermissionsService,
        RoomsService,
        CallsSdkService,
        StateBridge])
], CallManagementToolbarModel);
export { CallManagementToolbarModel };
export const { Provider: CallManagementToolbarProvider, useModel: useCallManagementToolbarModel } = createProvider(CallManagementToolbarModel);
//# sourceMappingURL=CallManagementToolbarModel.js.map