import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { RoomsService } from '../../services';
import { objectMap } from '../../../../helpers/helpers';
import { ModalType } from '@vkontakte-internal/calls-core';
import { CallsSdkService } from '../../../../services/sdk';
import { ModalService } from '../../../../services/modal';
let RetryRoomsModel = class RetryRoomsModel {
    constructor(props, roomsService, sdkService, modalService) {
        this.props = props;
        this.roomsService = roomsService;
        this.sdkService = sdkService;
        this.modalService = modalService;
        this.handleTryAgain = () => {
            const roomIds = objectMap(this.roomsService.rooms, (room) => room.id);
            this.sdkService.getSdk().removeRooms(roomIds);
            this.props.current.onResetTimer(true);
            this.props.current.onCloseDialog();
            // Переходим к окну отображения создания залов
            this.modalService.openModal(ModalType.ROOM_CONTROL_CREATE);
        };
        makeAutoObservable(this);
    }
    get onCloseDialog() {
        return this.props.current.onCloseDialog;
    }
};
RetryRoomsModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        RoomsService,
        CallsSdkService,
        ModalService])
], RetryRoomsModel);
export const { Provider: RetryRoomsProvider, useModel: useRetryRoomsModel } = createProvider(RetryRoomsModel);
//# sourceMappingURL=RetryRoomsModel.js.map