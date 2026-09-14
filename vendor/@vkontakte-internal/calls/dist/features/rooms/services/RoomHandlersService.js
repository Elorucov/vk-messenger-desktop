import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { StateBridge } from '../../../utils/stateBridge';
import { CallsSdkService } from '../../../services/sdk';
import { isSharedMiniAppShownFromDevice, MEDIA_TRANSLATION_TYPE, ModalType, } from '@vkontakte-internal/calls-core';
import { hideSharedMiniApp } from '../../miniApps/actions';
import { LocalDeviceService } from '../../../services/localDevice/LocalDeviceService';
import { ModalService } from '../../../services/modal';
let RoomHandlersService = class RoomHandlersService {
    constructor(stateBridge, sdkService, localDeviceService, modalService) {
        this.stateBridge = stateBridge;
        this.sdkService = sdkService;
        this.localDeviceService = localDeviceService;
        this.modalService = modalService;
        this.sdkSwitchRoom = (roomId) => {
            if (isSharedMiniAppShownFromDevice(this.stateBridge.localDevice)) {
                this.stateBridge.dispatch(hideSharedMiniApp(this.stateBridge.localDevice));
                void this.sdk.stopUrlSharing();
            }
            return this.sdk.switchRoom(roomId);
        };
        this.openRoomLeaveRemoveMediaTranslationModal = (roomId) => {
            const mediaTranslationType = this.localDeviceService.isMovieOwner
                ? MEDIA_TRANSLATION_TYPE.WATCH_TOGETHER
                : this.stateBridge.translation.isRecord
                    ? MEDIA_TRANSLATION_TYPE.RECORD
                    : MEDIA_TRANSLATION_TYPE.STREAM;
            this.modalService.openModal(ModalType.ROOM_LEAVE_REMOVE_MEDIA_TRANSLATION, {
                mediaTranslationType,
                roomId,
            }, true);
        };
        this.switchRoom = (roomId = null, isSwitchConfirmed = false, cb = () => { }) => {
            cb();
            if (this.localDeviceService.isMovieOwner ||
                (this.localDeviceService.isRecordCreator && this.stateBridge.translation.isOn)) {
                this.openRoomLeaveRemoveMediaTranslationModal(roomId);
                if (isSwitchConfirmed) {
                    this.sdkSwitchRoom(roomId);
                }
            }
            else {
                this.sdkSwitchRoom(roomId);
            }
        };
        makeAutoObservable(this);
    }
    get sdk() {
        return this.sdkService.getSdk();
    }
};
RoomHandlersService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [StateBridge,
        CallsSdkService,
        LocalDeviceService,
        ModalService])
], RoomHandlersService);
export { RoomHandlersService };
//# sourceMappingURL=RoomHandlersService.js.map