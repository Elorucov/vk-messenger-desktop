import { __decorate, __metadata } from "tslib";
import { createProvider, destroy, Props, scope } from '@vkontakte-internal/di';
import { makeAutoObservable, reaction } from 'mobx';
import { updateRooms } from '@vkontakte/calls-sdk';
import { RoomsService } from '../../services';
let AddRoomModel = class AddRoomModel {
    constructor(props, roomsService) {
        this.props = props;
        this.roomsService = roomsService;
        this._roomName = '';
        this.setRoomName = (value) => {
            this._roomName = value;
        };
        this.handleCloseDialog = () => {
            this.props.current.onCloseDialog();
            this._roomName = '';
        };
        this.handleRoomCreate = () => {
            updateRooms([{ name: this._roomName, countdownSec: this.roomsService.countdownSec }]);
            this.handleCloseDialog();
        };
        makeAutoObservable(this);
        // todo сделать отписку
        this.unsubscribeForceCloseDialog = reaction(() => this.isRoomsActivated, (isActivated) => {
            if (isActivated) {
                this.handleCloseDialog();
            }
        });
    }
    get isRoomsActivated() {
        return this.roomsService.isRoomsActivated;
    }
    get isRoomNameAlreadyExist() {
        return this.roomsService.roomNames.has(this._roomName);
    }
    get roomName() {
        return this._roomName;
    }
    get inputStatus() {
        return this.isRoomNameAlreadyExist ? 'error' : undefined;
    }
    get disableSubmit() {
        return !this._roomName.trim() || this.isRoomNameAlreadyExist;
    }
    [destroy]() {
        this.unsubscribeForceCloseDialog();
    }
};
AddRoomModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        RoomsService])
], AddRoomModel);
const { Provider: AddRoomProvider, useModel: useAddRoomModel } = createProvider(AddRoomModel);
export { AddRoomProvider, useAddRoomModel };
//# sourceMappingURL=AddRoomModel.js.map