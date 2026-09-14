import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { StateBridge } from '../utils/stateBridge';
import { E_ACTION } from '../constants';
import { scope } from '@vkontakte-internal/di';
let ModalService = class ModalService {
    constructor(stateBridge) {
        this.stateBridge = stateBridge;
        this.toggleModal = (type, details = undefined, isChild = false) => {
            return {
                type: E_ACTION.TOGGLE_MODAL,
                modal: type
                    ? {
                        type,
                        details,
                    }
                    : undefined,
                isChild,
            };
        };
        this.toggleChildModal = (type, details) => {
            return this.toggleModal(type, details, true);
        };
        this.openModal = (type, details = undefined, isChild = false) => {
            this.stateBridge.dispatch(this.toggleModal(type, details, isChild));
        };
        this.forceCloseModal = () => {
            this.stateBridge.dispatch(this.toggleModal());
        };
        this.closeChildModal = () => {
            this.stateBridge.dispatch(this.toggleChildModal());
        };
        this.closeModal = (externalMethod) => {
            if (externalMethod && typeof externalMethod === 'function') {
                externalMethod();
            }
            else {
                this.forceCloseModal();
            }
        };
        this.conditionalCloseModal = (shouldBeClosed) => {
            if (!shouldBeClosed || (typeof shouldBeClosed === 'function' && shouldBeClosed())) {
                this.forceCloseModal();
            }
        };
        makeAutoObservable(this);
    }
};
ModalService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [StateBridge])
], ModalService);
export { ModalService };
//# sourceMappingURL=modal.js.map