import { __decorate, __metadata } from "tslib";
import { CallsEventType, isAdmin, isCreator, isSameExternalId, participantIsAdmin, } from '@vkontakte-internal/calls-core';
import { Props, createProvider, scope } from '@vkontakte-internal/di';
import { Langs } from '@vkontakte-internal/plugins';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { makeAutoObservable } from 'mobx';
import { RoomsService } from '../../features/rooms';
import { canMuteParticipants, isParticipantAnonym, isParticipantContact } from '../../helpers/participant';
import { getParticipantActions } from '../../helpers/participantActions';
import { createDeviceByExternalIdSelector } from '../../selectors';
import { CallsConfigService } from '../../services/config';
import { bridgeEventBus } from '../../services/eventBus';
import { NavigationService } from '../../services/navigation';
import { PermissionsService } from '../../services/permissions';
import { CallsSdkService } from '../../services/sdk';
import { StateBridge } from '../../utils/stateBridge';
import { CallMembersService } from '../../services/callMembers';
import { isEmpty } from '../../helpers/helpers';
import { PinnedParticipantService } from '../../services/PinnedParticipantService';
import { DevicesService } from '../../services/devices';
import { LocalDeviceService } from '../../services/localDevice';
let ParticipantMenuModel = class ParticipantMenuModel {
    constructor(_props, callMembersService, configService, langs, navigationService, permissionsService, roomsService, sdkService, stateBridge, pinnedParticipantService, devicesService, localDeviceService) {
        this._props = _props;
        this.callMembersService = callMembersService;
        this.configService = configService;
        this.langs = langs;
        this.navigationService = navigationService;
        this.permissionsService = permissionsService;
        this.roomsService = roomsService;
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        this.pinnedParticipantService = pinnedParticipantService;
        this.devicesService = devicesService;
        this.localDeviceService = localDeviceService;
        this.forEachDeviceByParticipant = (peerId, callback) => {
            const { maps: { peerIdToDevices }, devices, } = this.stateBridge;
            const deviceSet = peerIdToDevices.get(peerId);
            if (!deviceSet) {
                return;
            }
            for (const id of deviceSet) {
                const device = devices[id];
                if (!device) {
                    continue;
                }
                callback(device);
            }
        };
        makeAutoObservable(this);
    }
    get props() {
        return this._props.current;
    }
    get device() {
        const { externalId } = this.props;
        const { devices, externalId: myExternalId, localDevice } = this.stateBridge;
        return createDeviceByExternalIdSelector(externalId)({ externalId: myExternalId, devices, localDevice });
    }
    get participant() {
        return this.stateBridge.participants[this.props.externalId.id];
    }
    get isMeAnonym() {
        return isParticipantAnonym(this.stateBridge.me);
    }
    get isMeSuperUser() {
        const { localDevice } = this.stateBridge;
        return isAdmin(localDevice) || isCreator(localDevice);
    }
    get isMyDevice() {
        return isSameExternalId(this.props.externalId, this.stateBridge.externalId);
    }
    get isHeAnonym() {
        return !!this.participant && isParticipantAnonym(this.participant.peerId);
    }
    get isHeContact() {
        return !!this.participant && isParticipantContact(this.participant.peerId);
    }
    get isHeSuperUser() {
        const { participant } = this;
        return isAdmin(participant) || isCreator(participant);
    }
    get isHeWaiting() {
        return this.device?.status === ParticipantStatus.WAITING;
    }
    get hasPermissionToToggleAdminRole() {
        return this.isMeSuperUser && !this.isHeWaiting;
    }
    get canBeAdmin() {
        return (this.hasPermissionToToggleAdminRole &&
            !this.isMyDevice &&
            !this.isHeAnonym &&
            !this.isHeContact &&
            !this.isHeSuperUser &&
            this.callMembersService.someDeviceByParticipant(this.participant, (device) => {
                return device.status === ParticipantStatus.CONNECTED;
            }));
    }
    get isMeCanMuteParticipants() {
        return canMuteParticipants(this.stateBridge.localDevice);
    }
    /**
     * Проверяет включены ли у пользователя микро и камера.
     */
    get isSomeMicAndCameraEnabled() {
        return (!!this.participant &&
            this.callMembersService.someDeviceByParticipant(this.participant, (device) => {
                if (isEmpty(device.mediaSettings)) {
                    return false;
                }
                const { isAudioEnabled, isVideoEnabled } = device.mediaSettings;
                return !!(isAudioEnabled && isVideoEnabled);
            }));
    }
    get canEnableMediaRequest() {
        return (!this.isMyDevice &&
            this.isMeCanMuteParticipants &&
            !this.isSomeMicAndCameraEnabled &&
            !this.isMeAnonym &&
            !this.isHeWaiting);
    }
    get actions() {
        const { externalId } = this.props;
        const { callData, dispatch, groupId, modal: openedModal, onlyAdminCanShareMovie, participants, peer: chatPeerId, } = this.stateBridge;
        const participant = participants[externalId.id];
        if (!participant) {
            return [];
        }
        const device = this.devicesService.getDeviceByExternalId(externalId);
        const actions = getParticipantActions({
            adminPinnedParticipant: this.pinnedParticipantService.adminPinnedParticipant,
            canBeAdmin: this.canBeAdmin,
            canEnableMediaRequest: this.canEnableMediaRequest,
            callId: callData?.callId,
            chatPeerId,
            config: this.configService.getConfig(),
            device: device && { ...device, externalId },
            dispatch,
            forEachDeviceByParticipant: this.forEachDeviceByParticipant,
            getMuteParticipantIndicators: (mode) => this.permissionsService.getIndicators(mode, externalId),
            getLang: (key) => this.langs.getLang(key),
            groupId,
            isVkme: this.configService.isVkMe(),
            isShareMovieEnabled: this.permissionsService.isMediaAllowed('movieSharing', device),
            localDevice: this.localDeviceService.device,
            muteDevice: (params) => this.permissionsService.muteDevice(params),
            myExternalId: this.localDeviceService.externalId,
            myPeerId: this.localDeviceService.me,
            myRoomId: this.roomsService.roomId,
            navigateToConvo: this.navigationService.navigateToConvo,
            navigateToProfile: this.navigationService.navigateToProfile,
            onCollapse: () => bridgeEventBus.emit(CallsEventType.LAYOUT_COLLAPSED),
            onlyAdminCanShareMovie,
            onWatchTogetherMute: (device) => this.permissionsService.muteWatchTogetherParticipant(device),
            openedModal,
            participant,
            SDK: this.sdkService.getSdk(),
            setAdminPinnedParticipant: this.pinnedParticipantService.setAdminPinnedParticipant,
            clearAdminPinnedParticipant: this.pinnedParticipantService.clearAdminPinnedParticipant,
        });
        return this.hasNewViewOfMuteActions
            ? actions
            : actions.reduce((result, action) => 'items' in action ? [...result, ...action.items] : [...result, action], []);
    }
    get isMeAdmin() {
        return participantIsAdmin(this.stateBridge.localDevice);
    }
    get hasNewViewOfMuteActions() {
        const { enableNewViewOfMuteActions, enableNewViewOfMuteActionsSferum, sferum: isSferum, } = this.configService.getConfig();
        return isSferum ? enableNewViewOfMuteActionsSferum : enableNewViewOfMuteActions;
    }
};
ParticipantMenuModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        CallMembersService,
        CallsConfigService,
        Langs,
        NavigationService,
        PermissionsService,
        RoomsService,
        CallsSdkService,
        StateBridge,
        PinnedParticipantService,
        DevicesService,
        LocalDeviceService])
], ParticipantMenuModel);
export { ParticipantMenuModel };
export const { Provider, useModel } = createProvider(ParticipantMenuModel);
//# sourceMappingURL=ParticipantMenuModel.js.map