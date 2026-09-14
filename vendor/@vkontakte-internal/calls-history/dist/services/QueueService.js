import { __decorate, __metadata } from "tslib";
import { scope, destroy } from '@vkontakte-internal/di';
import { makeAutoObservable, observable } from 'mobx';
let QueueService = class QueueService {
};
QueueService = __decorate([
    scope.container()
], QueueService);
export { QueueService };
export const createQueueServiceImplementation = (subscribe) => {
    let QueueServiceImpl = class QueueServiceImpl {
        constructor() {
            this.event = null;
            makeAutoObservable(this, {
                event: observable.ref,
                unsubscribe: false,
            });
            this.unsubscribe = subscribe((event) => {
                this.setEvent(event);
            });
        }
        setEvent(event) {
            this.event = event;
        }
        get lastEvent() {
            return this.event;
        }
        [destroy]() {
            this.unsubscribe?.();
        }
    };
    QueueServiceImpl = __decorate([
        scope.container(),
        __metadata("design:paramtypes", [])
    ], QueueServiceImpl);
    return QueueServiceImpl;
};
//# sourceMappingURL=QueueService.js.map