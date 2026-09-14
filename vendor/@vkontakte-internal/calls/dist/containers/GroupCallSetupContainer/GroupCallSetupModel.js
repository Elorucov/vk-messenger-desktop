import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { UserRole } from '@vkontakte/calls-sdk';
import { makeAutoObservable } from 'mobx';
import { RoomsService } from '../../features/rooms';
import { isParticipantActive, isParticipantAnonym, isParticipantGroup } from '../../helpers/participant';
import { StateBridge } from '../../utils/stateBridge';
import { prepareCallAllData } from './helpers';
import { DevicesService } from '../../services/devices/DevicesService';
let GroupCallSetupModel = class GroupCallSetupModel {
    constructor(props, stateBridge, roomsService, devicesService) {
        this.props = props;
        this.stateBridge = stateBridge;
        this.roomsService = roomsService;
        this.devicesService = devicesService;
        this.updateRoomParticipants = (params) => {
            this.roomsService.updateRoomParticipants(params);
        };
        makeAutoObservable(this);
    }
    get isWithBackButton() {
        return this.props.current.isWithBackButton;
    }
    get onBackClick() {
        return this.props.current.onBackClick;
    }
    get callMembers() {
        return prepareCallAllData({
            callMembers: this.stateBridge.callMembers,
            devices: this.stateBridge.devices,
            groupId: this.stateBridge.groupId,
            participants: this.stateBridge.participants,
            me: this.stateBridge.me,
            activeDevices: this.devicesService.activeDevices,
            peerIdToDevices: this.stateBridge.maps.peerIdToDevices,
        });
    }
    /**
     * если входящий звонок от сообщества
     */
    get isCommunityCallingMe() {
        const { participants } = this.stateBridge;
        const creator = Object.values(participants).find((p) => p.roles?.includes(UserRole.CREATOR));
        return Boolean(creator?.peerId && isParticipantGroup(creator.peerId));
    }
    /**
     * количество активных участников чата (без анонимов)
     */
    get membersCount() {
        const { participants, maps, me, devices } = this.stateBridge;
        return Object.keys(participants).filter((peerId) => {
            return !isParticipantAnonym(peerId) && isParticipantActive({ devices, maps, me }, participants[peerId]);
        }).length;
    }
};
GroupCallSetupModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        StateBridge,
        RoomsService,
        DevicesService])
], GroupCallSetupModel);
export const { Provider: GroupCallSetupProvider, useModel: useGroupCallSetupModel } = createProvider(GroupCallSetupModel);
//# sourceMappingURL=GroupCallSetupModel.js.map