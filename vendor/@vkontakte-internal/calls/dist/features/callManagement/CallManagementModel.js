import { __decorate, __metadata } from "tslib";
import { ManagementModalView, ModalType } from '@vkontakte-internal/calls-core';
import { Props, createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { toggleModal, setShowLoader } from '../../actions';
import { setWaitingHall } from '../../actions/waitingHall';
import { WaitingHallService } from '../../services/waitingHall';
import { createLogger } from '../../services/logger';
import { CallsSdkService } from '../../services/sdk';
import { StateBridge } from '../../utils/stateBridge';
import { setShowChatHistory } from '../../actions/actions';
import { updateCallSettings } from '../../services/backend';
import { CallService } from '../../services/call';
import { getCallDataShowChatHistory } from '../../selectors';
import { DevicesService } from '../../services/devices/DevicesService';
import { CallsConfigService } from '../../services/config';
let CallManagementModel = class CallManagementModel {
    constructor(props, callService, configService, sdkService, stateBridge, waitingHallService, devicesService) {
        this.props = props;
        this.callService = callService;
        this.configService = configService;
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        this.waitingHallService = waitingHallService;
        this.devicesService = devicesService;
        this.logger = createLogger('CallManagementModel', this.sdkService.getSdk());
        this.setModalView = (view) => {
            this.stateBridge.dispatch(toggleModal(ModalType.MANAGEMENT, { view }));
        };
        this.showMoreWaitingHall = async () => {
            const { waitingHall } = this.stateBridge;
            this.setShowLoader(true);
            try {
                const nextWaitingHall = await this.waitingHallService.loadAdditionalWaitingHall({
                    waitingHall,
                });
                if (nextWaitingHall) {
                    this.stateBridge.dispatch(setWaitingHall(nextWaitingHall));
                }
                this.setModalView(ManagementModalView.WAITING_HALL);
            }
            catch (err) {
                this.logger.error(err);
            }
            finally {
                this.setShowLoader(false);
            }
        };
        this.toggleShowChatHistory = () => {
            const nextValue = !this.shouldShowChatHistory;
            this.stateBridge.dispatch(setShowChatHistory(nextValue));
            updateCallSettings(nextValue, this.stateBridge.callData?.callId ?? '');
            return nextValue;
        };
        this.leaveCall = () => this.callService.leaveCall();
        this.forceCallFinish = () => this.callService.forceCallFinish();
        this.logger = createLogger('CallManagementModel', sdkService.getSdk());
        makeAutoObservable(this);
    }
    get canFinishCall() {
        return this.callService.canFinishCall;
    }
    get modalView() {
        return this.props.current.view ?? ManagementModalView.MAIN;
    }
    get shouldShowChatHistory() {
        return getCallDataShowChatHistory({
            callData: this.stateBridge.callData,
            config: {
                sferum: this.configService.getConfig().sferum,
            },
        });
    }
    setShowLoader(value) {
        this.stateBridge.dispatch(setShowLoader(value));
    }
    get activeDevicesCount() {
        return this.devicesService.activeDevicesCount;
    }
};
CallManagementModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        CallService,
        CallsConfigService,
        CallsSdkService,
        StateBridge,
        WaitingHallService,
        DevicesService])
], CallManagementModel);
export { CallManagementModel };
export const { Provider: CallManagementModelProvider, useModel: useCallManagementModel } = createProvider(CallManagementModel, { isolatedContext: false, onlyTransient: true });
//# sourceMappingURL=CallManagementModel.js.map