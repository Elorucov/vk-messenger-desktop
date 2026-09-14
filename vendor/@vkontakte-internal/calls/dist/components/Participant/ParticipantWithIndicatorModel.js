import { __decorate, __metadata } from "tslib";
import { externalIdToString } from '@vkontakte-internal/calls-core';
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { StateBridge } from '../../utils/stateBridge';
let ParticipantWithIndicatorModel = class ParticipantWithIndicatorModel {
    constructor(_props, stateBridge) {
        this._props = _props;
        this.stateBridge = stateBridge;
        makeAutoObservable(this);
    }
    get props() {
        return this._props.current;
    }
    get deviceId() {
        return externalIdToString(this.props.externalId);
    }
    get isMe() {
        return this.props.isMe;
    }
    get isNFT() {
        return Boolean(this.participant?.is_nft);
    }
    get participant() {
        return this.stateBridge.participants[this.props.externalId.id];
    }
};
ParticipantWithIndicatorModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        StateBridge])
], ParticipantWithIndicatorModel);
export { ParticipantWithIndicatorModel };
export const { Provider, useModel } = createProvider(ParticipantWithIndicatorModel);
//# sourceMappingURL=ParticipantWithIndicatorModel.js.map