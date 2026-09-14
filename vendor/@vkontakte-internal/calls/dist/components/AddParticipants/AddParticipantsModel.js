import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { getTokens as getTokensHelper } from './services';
import { StateBridge } from '../../utils/stateBridge';
import { makeAutoObservable } from 'mobx';
import { DevicesService } from '../../services/devices/DevicesService';
let AddParticipantsModel = class AddParticipantsModel {
    constructor(props, stateBridge, devicesService) {
        this.props = props;
        this.stateBridge = stateBridge;
        this.devicesService = devicesService;
        this.getTokens = (personCache) => {
            return getTokensHelper({
                personCache,
                selected: this.props.current.selected,
                participants: this.stateBridge.participants,
                activeDevices: this.devicesService.activeDevices,
            });
        };
        makeAutoObservable(this);
    }
    get onChange() {
        return this.props.current.onChange;
    }
    get onChangeTab() {
        return this.props.current.onChangeTab;
    }
    get tab() {
        return this.props.current.tab;
    }
    get tabs() {
        return this.props.current.tabs;
    }
    get selected() {
        return this.props.current.selected;
    }
};
AddParticipantsModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        StateBridge,
        DevicesService])
], AddParticipantsModel);
export const { Provider: AddParticipantsProvider, useModel: useAddParticipantsModel } = createProvider(AddParticipantsModel);
//# sourceMappingURL=AddParticipantsModel.js.map