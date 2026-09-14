import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { LocalDeviceService } from '../../../../services/localDevice';
import { RoomHandlersService } from '../../services';
import { ModalService } from '../../../../services/modal';
let RoomTimeoutModel = class RoomTimeoutModel {
    constructor(localDeviceService, roomHandlersService, modalService) {
        this.localDeviceService = localDeviceService;
        this.roomHandlersService = roomHandlersService;
        this.modalService = modalService;
        this.handleSubmit = () => {
            if (this.localDeviceService.canChooseRoomAsAdmin) {
                this.roomHandlersService.switchRoom();
            }
            this.modalService.closeModal();
        };
        makeAutoObservable(this);
    }
    get canChooseRoomAsAdmin() {
        return this.localDeviceService.canChooseRoomAsAdmin;
    }
};
RoomTimeoutModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [LocalDeviceService,
        RoomHandlersService,
        ModalService])
], RoomTimeoutModel);
export const { Provider: RoomTimeoutProvider, useModel: useRoomTimeoutModel } = createProvider(RoomTimeoutModel);
//# sourceMappingURL=RoomTimeoutModel.js.map