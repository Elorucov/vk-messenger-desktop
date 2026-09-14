import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, reaction } from 'mobx';
import { createProvider, destroy, init, Props, scope } from '@vkontakte-internal/di';
import { StateBridge } from '../../../utils/stateBridge';
import { getRaisedHands } from '../../../helpers/participant';
import { bridgeEventBus } from '../../../services/eventBus';
import { CallsEventType, isGroupCallByPeerAndMe } from '@vkontakte-internal/calls-core';
import { calculateCallDuration } from '../../../helpers/helpers';
import { LangUtils } from '../../../services/Lang';
import { SpeakersTexts } from './SpeakersTexts';
import { RoomsService } from '../../rooms';
import { LocalDeviceService } from '../../../services/localDevice';
import { AsrService } from '../../../services/asr';
let CallHeaderViewModel = class CallHeaderViewModel {
    constructor(state, langs, speakersTexts, roomsService, localDeviceService, asrService, props) {
        this.state = state;
        this.langs = langs;
        this.speakersTexts = speakersTexts;
        this.roomsService = roomsService;
        this.localDeviceService = localDeviceService;
        this.asrService = asrService;
        this.props = props;
        this.timer = null;
        makeAutoObservable(this);
        this.disposeReaction = reaction(() => this.hands, (newHands, oldHands) => {
            if (newHands !== oldHands) {
                bridgeEventBus.emit(CallsEventType.HAND_COUNT_CHANGED, { count: newHands });
            }
        });
    }
    get isAsrShown() {
        return Boolean(this.asrService.asr);
    }
    get hands() {
        return getRaisedHands({
            devices: this.state.devices,
            localDevice: this.state.localDevice,
            handState: this.state.handState,
            roomId: this.roomsService.roomId,
        });
    }
    get isGroupCall() {
        return isGroupCallByPeerAndMe(this.state.peer, this.state.me);
    }
    clearTimer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }
    updateTime(time) {
        this.timer = time;
    }
    get currentTS() {
        return this.isGroupCall ? this.state.callData.ts : this.state.callData.localTimeStamp;
    }
    startTimer() {
        this.clearTimer();
        /**
         * Для группового звонка время считается с сервера.
         * Для p2p считается локально.
         */
        this.interval = setInterval(() => {
            const ts = this.currentTS;
            if (ts !== null) {
                this.updateTime(calculateCallDuration(ts));
            }
        }, 1e3);
    }
    get networkTooltipText() {
        return this.langs.getLang('calls_status_bad_internet_connection');
    }
    get isTranslationRecord() {
        const { isOn, isRecord } = this.state.translation;
        return Boolean(isOn && isRecord);
    }
    get isTranslationOn() {
        return this.state.translation.isOn;
    }
    get speakersInHeader() {
        return this.speakersTexts.speakersInHeader;
    }
    get isRoomShown() {
        return this.localDeviceService.isRoomShown;
    }
    [init]() {
        this.startTimer();
    }
    [destroy]() {
        this.disposeReaction?.();
        this.clearTimer();
    }
};
CallHeaderViewModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [StateBridge,
        LangUtils,
        SpeakersTexts,
        RoomsService,
        LocalDeviceService,
        AsrService,
        Props])
], CallHeaderViewModel);
export { CallHeaderViewModel };
export const { Provider: CallHeaderViewModelProvider, useModel: useCallHeaderViewModel } = createProvider(CallHeaderViewModel, { isolatedContext: false, onlyTransient: true });
//# sourceMappingURL=CallHeaderViewModel.js.map