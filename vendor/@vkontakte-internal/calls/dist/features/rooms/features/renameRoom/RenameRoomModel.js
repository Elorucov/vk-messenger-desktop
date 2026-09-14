import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope, destroy } from '@vkontakte-internal/di';
import { makeAutoObservable, reaction } from 'mobx';
import { updateRooms } from '@vkontakte/calls-sdk';
import { RoomsService } from '../../services';
let RenameRoomModel = class RenameRoomModel {
    constructor(props, roomsService) {
        this.props = props;
        this.roomsService = roomsService;
        this._roomName = '';
        this.setRoomName = (value) => {
            this._roomName = value;
        };
        this.handleRoomRename = () => {
            if (!this.renamedRoomId) {
                return;
            }
            updateRooms([
                {
                    id: this.renamedRoomId,
                    name: this._roomName,
                },
            ]).finally(() => {
                this.onCloseDialog();
            });
        };
        makeAutoObservable(this);
        this._roomName = props.current.renamedRoomName || '';
        this.unsubscribeForceCloseDialog = reaction(() => this.forceCloseDialog, (forceCloseDialog) => {
            if (forceCloseDialog) {
                this.onCloseDialog();
            }
        });
    }
    get isRoomNameAlreadyExist() {
        return !!this._roomName && this.roomsService.roomNames.has(this._roomName);
    }
    get forceCloseDialog() {
        return this.renamedRoomId && !this.roomsService.rooms[this.renamedRoomId];
    }
    get renamedRoomId() {
        return this.props.current.renamedRoomId;
    }
    get roomName() {
        return this._roomName;
    }
    get inputStatus() {
        return this.isRoomNameAlreadyExist ? 'error' : undefined;
    }
    get disableSubmit() {
        return ((!this._roomName || !this._roomName.trim() || this.isRoomNameAlreadyExist) &&
            this._roomName !== this.props.current.renamedRoomName);
    }
    get onCloseDialog() {
        return this.props.current.onCloseDialog;
    }
    [destroy]() {
        this.unsubscribeForceCloseDialog();
    }
};
RenameRoomModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        RoomsService])
], RenameRoomModel);
const { Provider: RenameRoomProvider, useModel: useRenameRoomModel } = createProvider(RenameRoomModel);
export { RenameRoomProvider, useRenameRoomModel };
//# sourceMappingURL=RenameRoomModel.js.map