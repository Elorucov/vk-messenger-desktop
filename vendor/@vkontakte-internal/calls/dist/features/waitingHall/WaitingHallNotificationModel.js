import { __decorate, __metadata } from "tslib";
import { KickParticipantType, ManagementModalView, ModalType, } from '@vkontakte-internal/calls-core';
import { Props, createProvider, scope } from '@vkontakte-internal/di';
import { Langs } from '@vkontakte-internal/plugins';
import { makeAutoObservable } from 'mobx';
import { toggleModal } from '../../actions';
import { removeUserFromWaitingHall, resetWaitingHallNew, setWaitingHall } from '../../actions/waitingHall';
import { getParticipantsListLabel } from '../../helpers/helpers';
import { getUserName } from '../../helpers/user';
import { createLogger } from '../../services/logger';
import { CallsSdkService } from '../../services/sdk';
import { WaitingHallService } from '../../services/waitingHall';
import { StateBridge } from '../../utils/stateBridge';
let WaitingHallNotificationModel = class WaitingHallNotificationModel {
    constructor(props, langs, sdkService, stateBridge, waitingHallService) {
        this.props = props;
        this.langs = langs;
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        this.waitingHallService = waitingHallService;
        this.logger = createLogger('WaitingHallNotificationModel', this.sdkService.getSdk());
        this.promoteSingle = async () => {
            if (this.membersInWaitingHall.length === 1) {
                const peerId = this.membersInWaitingHall[0].peerId;
                try {
                    await this.waitingHallService.promoteParticipant(peerId);
                    this.stateBridge.dispatch(removeUserFromWaitingHall(peerId, this.waitingHall));
                }
                catch (err) {
                    this.logger.error(err);
                }
            }
        };
        this.forbidSingle = () => {
            if (this.membersInWaitingHall.length === 1) {
                this.stateBridge.dispatch(toggleModal(ModalType.KICK_PARTICIPANT, {
                    peerId: this.membersInWaitingHall[0].peerId,
                    kickType: KickParticipantType.WAITING_HALL,
                }));
            }
        };
        this.showParticipants = async () => {
            try {
                const nextWaitingHall = await this.waitingHallService.loadAdditionalWaitingHall({
                    waitingHall: this.waitingHall,
                });
                if (nextWaitingHall) {
                    this.stateBridge.dispatch(setWaitingHall(nextWaitingHall));
                }
                this.stateBridge.dispatch(toggleModal(ModalType.MANAGEMENT, { view: ManagementModalView.WAITING_HALL }));
            }
            catch (err) {
                this.logger.error(err);
            }
        };
        this.resetWaitingHallHasNew = () => {
            this.stateBridge.dispatch(resetWaitingHallNew(this.waitingHall));
        };
        makeAutoObservable(this);
    }
    get waitingHall() {
        return this.props.current.waitingHall;
    }
    get membersInWaitingHall() {
        return Array.from(this.waitingHall.members.values());
    }
    get totalCount() {
        return this.waitingHall.members.size;
    }
    get namesList() {
        return getParticipantsListLabel(this.membersInWaitingHall, this.membersInWaitingHall.slice(0, 3), getUserName, (key, raw) => (raw === 'raw' ? this.langs.getLang(key, true) : this.langs.getLang(key)), (count, key, langVariants) => this.langs.numeric(count, langVariants), this.totalCount);
    }
};
WaitingHallNotificationModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        Langs,
        CallsSdkService,
        StateBridge,
        WaitingHallService])
], WaitingHallNotificationModel);
export const { useModel: useWaitingHallNotificationModel, Provider: WaitingHallNotificationProvider } = createProvider(WaitingHallNotificationModel, { isolatedContext: false, onlyTransient: true });
//# sourceMappingURL=WaitingHallNotificationModel.js.map