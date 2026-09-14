import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, reaction } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { StateBridge } from '../../../../utils/stateBridge';
import { RoomsService } from '../RoomsService';
import { toggleModal } from '../../../../actions/modal';
import { ModalType } from '@vkontakte-internal/calls-core';
import { calculateTimeLeft } from './helpers';
import { CallsConfigService } from '../../../../services/config';
import { LocalDeviceService } from '../../../../services/localDevice';
let TimerService = class TimerService {
    constructor(stateBridge, roomsService, localDeviceService, configService) {
        this.stateBridge = stateBridge;
        this.roomsService = roomsService;
        this.localDeviceService = localDeviceService;
        this.configService = configService;
        this._timeLeft = '';
        this._timerWarning = false;
        this._intervalId = undefined;
        this._unsubscribeTimer = undefined;
        this._timerFinishedDialog = false;
        this.openTimerFinishedDialog = () => {
            this._timerFinishedDialog = true;
        };
        this.closeTimerFinishedDialog = () => {
            this._timerFinishedDialog = false;
        };
        this.startTimer = (timeoutMs) => {
            if (!timeoutMs) {
                this.closeTimerFinishedDialog();
            }
            if (timeoutMs && timeoutMs - Date.now() > 0) {
                this.handleTimer(timeoutMs);
                this._intervalId = setInterval(() => {
                    this.handleTimer(timeoutMs);
                }, 1000);
            }
            else if (this._timeLeft) {
                this.handleTimer();
            }
        };
        this.clear = () => {
            this._unsubscribeTimer?.();
            clearInterval(this._intervalId);
            this._timeLeft = '';
            this._timerWarning = false;
        };
        this.handleTimer = (timeoutMs) => {
            if (typeof timeoutMs === 'number') {
                const { timeString, shouldSetWarning, timeFinished } = calculateTimeLeft(timeoutMs);
                this._timeLeft = timeString;
                this._timerWarning = shouldSetWarning;
                if (timeFinished) {
                    if (this.localDeviceService.canChooseRoomAsAdmin) {
                        this.openTimerFinishedDialog();
                    }
                    else {
                        if (this.config.enableRoomTimerFinishedWarning) {
                            this.stateBridge.dispatch(toggleModal(ModalType.ROOM_TIMEOUT));
                        }
                    }
                    clearInterval(this._intervalId);
                }
            }
            else {
                this._timeLeft = '';
                this._timerWarning = false;
                clearInterval(this._intervalId);
            }
        };
        makeAutoObservable(this);
        this._unsubscribeTimer = reaction(() => this.roomsService.timeoutMs, this.startTimer, {
            fireImmediately: true,
        });
    }
    get timerFinishedDialog() {
        return this._timerFinishedDialog;
    }
    get config() {
        return this.configService.getConfig();
    }
    get timeLeft() {
        return this._timeLeft;
    }
    get timerWarning() {
        return this._timerWarning;
    }
};
TimerService = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [StateBridge,
        RoomsService,
        LocalDeviceService,
        CallsConfigService])
], TimerService);
export { TimerService };
//# sourceMappingURL=TimerService.js.map