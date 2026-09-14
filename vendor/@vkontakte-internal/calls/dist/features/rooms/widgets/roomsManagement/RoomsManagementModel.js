import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { RoomsService } from '../../services';
import { ModalService } from '../../../../services/modal';
let RoomsManagementModel = class RoomsManagementModel {
    constructor(roomsService, modalService) {
        this.roomsService = roomsService;
        this.modalService = modalService;
        this._renamedRoomId = undefined;
        this._renamedRoomName = '';
        this._autoDivideDialog = false;
        this._closeRoomsDialog = false;
        this._retryDialog = false;
        this._createRoomDialog = false;
        this._renameRoomDialog = false;
        this._sendMessageDialog = false;
        this.openAutoDivideDialog = () => {
            this._autoDivideDialog = true;
        };
        this.openCloseRoomsDialog = () => {
            this._closeRoomsDialog = true;
        };
        this.openRetryDialog = () => {
            this._retryDialog = true;
        };
        this.openCreateRoomDialog = () => {
            this._createRoomDialog = true;
        };
        this.openRenameRoomDialog = () => {
            this._renameRoomDialog = true;
        };
        this.openSendMessageDialog = () => {
            this._sendMessageDialog = true;
        };
        this.closeAutoDivideDialog = () => {
            this._autoDivideDialog = false;
        };
        this.closeCloseRoomsDialog = () => {
            this._closeRoomsDialog = false;
        };
        this.closeRetryDialog = () => {
            this._retryDialog = false;
        };
        this.closeCreateRoomDialog = () => {
            this._createRoomDialog = false;
        };
        this.closeRenameRoomDialog = () => {
            this._renameRoomDialog = false;
        };
        this.closeSendMessageDialog = () => {
            this._sendMessageDialog = false;
        };
        this.closeModal = () => this.modalService.conditionalCloseModal(() => [
            this.autoDivideDialog,
            this.closeRoomsDialog,
            this.retryDialog,
            this.createRoomDialog,
            this.renameRoomDialog,
            this.sendMessageDialog,
        ].every((isOpen) => !isOpen));
        this.setRoomsCountdown = (countdownSec) => {
            this.roomsService?.setCountdown({ countdownSec });
        };
        this.resetRoomsTimer = () => {
            return this.roomsService?.resetTimer();
        };
        this.handleRenameRoom = (renamedRoomId, renamedRoomName) => {
            this._renamedRoomId = renamedRoomId;
            this._renamedRoomName = renamedRoomName;
            this.openRenameRoomDialog();
        };
        makeAutoObservable(this);
    }
    get autoDivideDialog() {
        return this._autoDivideDialog;
    }
    get closeRoomsDialog() {
        return this._closeRoomsDialog;
    }
    get retryDialog() {
        return this._retryDialog;
    }
    get createRoomDialog() {
        return this._createRoomDialog;
    }
    get renameRoomDialog() {
        return this._renameRoomDialog;
    }
    get sendMessageDialog() {
        return this._sendMessageDialog;
    }
    get rooms() {
        return this.roomsService.rooms;
    }
    get countdownSec() {
        return this.roomsService.countdownSec;
    }
    get renamedRoomId() {
        return this._renamedRoomId;
    }
    get renamedRoomName() {
        return this._renamedRoomName;
    }
};
RoomsManagementModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [RoomsService,
        ModalService])
], RoomsManagementModel);
export const { Provider: RoomsManagementProvider, useModel: useRoomsManagementModel } = createProvider(RoomsManagementModel);
//# sourceMappingURL=RoomsManagementModel.js.map