import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { findRelatedRoom, isParticipantWithVideo, isSameExternalId, isSharedMiniAppShownFromDevice, participantIsAdmin, vkIdToPeerId, } from '@vkontakte-internal/calls-core';
import { StateBridge } from '../../utils/stateBridge';
import { scope } from '@vkontakte-internal/di';
import { RoomsService } from '../../features/rooms/services/RoomsService';
import { getPreviousAvailableStreamMode, isParticipantAnonym, isParticipantGroup, } from '../../helpers/participant';
import { WatchTogetherService } from '../../features/watchTogether/services/WatchTogetherService';
import { PermissionsService } from '../permissions/PermissionsService';
import { E_ACTION } from '../../constants';
import { MediaType } from '@vkontakte/calls-sdk';
import { setLocalDevice } from '../../actions';
let LocalDeviceService = class LocalDeviceService {
    constructor(stateBridge, roomsService, watchTogetherService, permissionsService) {
        this.stateBridge = stateBridge;
        this.roomsService = roomsService;
        this.watchTogetherService = watchTogetherService;
        this.permissionsService = permissionsService;
        this.hideSharedMiniApp = () => {
            this.stateBridge.dispatch({
                type: E_ACTION.SET_LOCAL_DEVICE,
                data: {
                    sharedUrl: undefined,
                    sharedMiniAppId: undefined,
                    streamMode: getPreviousAvailableStreamMode(this.device, MediaType.SHARED_URL),
                },
            });
        };
        this.showSharedMiniApp = (sharedMiniAppId) => {
            this.stateBridge.dispatch({
                type: E_ACTION.SET_LOCAL_DEVICE,
                data: {
                    sharedMiniAppId,
                    sharedUrl: undefined,
                    streamMode: MediaType.SHARED_URL,
                },
            });
        };
        this.setLocalDevice = (data) => {
            this.stateBridge.dispatch(setLocalDevice(data));
        };
        makeAutoObservable(this);
    }
    get device() {
        return this.stateBridge.localDevice;
    }
    get externalId() {
        return this.stateBridge.externalId;
    }
    get me() {
        return this.stateBridge.me;
    }
    get isMeAdmin() {
        return participantIsAdmin(this.device);
    }
    get isMeAnonym() {
        return isParticipantAnonym(this.me);
    }
    get isMeWithVideo() {
        return isParticipantWithVideo(this.device);
    }
    get isMeWithMovieShare() {
        return Boolean(this.device.movieStream && this.device.movieStreamInfo);
    }
    get isMovieOwner() {
        return isSameExternalId(this.watchTogetherService.owner, this.stateBridge.externalId);
    }
    get isRecordCreator() {
        const translationOwnerId = this.stateBridge.translation.ownerId;
        if (isParticipantGroup(this.stateBridge.groupId)) {
            return this.stateBridge.groupId === translationOwnerId;
        }
        return !!translationOwnerId && this.me === vkIdToPeerId(translationOwnerId);
    }
    get isSharedMiniAppShownFromMe() {
        return isSharedMiniAppShownFromDevice(this.device);
    }
    get roomIdToReturn() {
        const myExternalId = this.stateBridge.externalId;
        if (myExternalId === undefined || this.canChooseRoomAsAdmin || this.roomsService.roomId) {
            return null;
        }
        // Определяем комнату, к которой мы привязаны
        const relatedRoom = findRelatedRoom(myExternalId, this.roomsService.rooms);
        return relatedRoom && relatedRoom.active ? relatedRoom.id : null;
    }
    get canChooseRoomAsAdmin() {
        return this.isMeAdmin && this.roomsService.isRoomsActivated;
    }
    get isRoomShown() {
        return Boolean(this.roomsService.myRoom || this.roomIdToReturn || this.canChooseRoomAsAdmin);
    }
    get isWatchTogetherAllowed() {
        if (this.isMeAdmin) {
            return true;
        }
        return (!this.stateBridge.onlyAdminCanShareMovie &&
            this.permissionsService.isMediaAllowed('movieSharing', this.device));
    }
};
LocalDeviceService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [StateBridge,
        RoomsService,
        WatchTogetherService,
        PermissionsService])
], LocalDeviceService);
export { LocalDeviceService };
//# sourceMappingURL=LocalDeviceService.js.map