import { __decorate, __metadata } from "tslib";
import { ModalType } from '@vkontakte-internal/calls-core';
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { toggleModal } from '../../../../actions';
import { DevicesService } from '../../../../services/devices/DevicesService';
import { StateBridge } from '../../../../utils/stateBridge';
let CallMiniAppModel = class CallMiniAppModel {
    constructor(props, devicesService, stateBridge) {
        this.props = props;
        this.devicesService = devicesService;
        this.stateBridge = stateBridge;
        this.showLeaveBox = () => {
            this.stateBridge.dispatch(toggleModal(ModalType.EXIT));
        };
        makeAutoObservable(this);
    }
    get activeDevicesCount() {
        return this.devicesService.activeDevicesCount;
    }
    get localDeviceStatus() {
        return this.props.current.localDeviceStatus;
    }
};
CallMiniAppModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        DevicesService,
        StateBridge])
], CallMiniAppModel);
export const { Provider: CallMiniAppProvider, useModel: useCallMiniAppModel } = createProvider(CallMiniAppModel);
//# sourceMappingURL=CallMiniAppModel.js.map