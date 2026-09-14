import { __decorate, __metadata } from "tslib";
import { Props, createProvider, scope } from '@vkontakte-internal/di';
import { Langs } from '@vkontakte-internal/plugins';
import { makeAutoObservable } from 'mobx';
import { RoomsService } from '../../features/rooms';
import { PermissionsService } from '../../services/permissions';
import { StateBridge } from '../../utils/stateBridge';
import { setShowLoader } from '../../actions';
let MuteParticipantModel = class MuteParticipantModel {
    constructor(_props, langs, permissionsService, roomsService, stateBridge) {
        this._props = _props;
        this.langs = langs;
        this.permissionsService = permissionsService;
        this.roomsService = roomsService;
        this.stateBridge = stateBridge;
        this.getLang = (key) => this.langs.getLang(key);
        this.getMuteState = () => this.permissionsService.getMuteController(this.mode, this.externalId);
        this.toggleLoader = (shown) => {
            this.stateBridge.dispatch(setShowLoader(shown));
        };
        makeAutoObservable(this);
    }
    get props() {
        return this._props.current;
    }
    get externalId() {
        return this.props.externalId;
    }
    get mode() {
        return this.props.mode;
    }
    get onClose() {
        return this.props.onClose;
    }
    get isVoiceRoom() {
        return this.stateBridge.isVoiceRoom;
    }
    get participants() {
        return this.stateBridge.participants;
    }
    get roomId() {
        return this.roomsService.roomId;
    }
};
MuteParticipantModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        Langs,
        PermissionsService,
        RoomsService,
        StateBridge])
], MuteParticipantModel);
export { MuteParticipantModel };
export const { Provider, useModel } = createProvider(MuteParticipantModel);
//# sourceMappingURL=MuteParticipantModel.js.map