import { __decorate, __metadata } from "tslib";
import { reaction, makeAutoObservable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { CurrentCallsService } from './CurrentCallsService';
import { QueueService } from './QueueService';
import { CallHistoryService } from './CallHistoryService';
import { ECallLongpollType } from '@vkontakte-internal/calls-core';
import { ScheduledCallsService } from './ScheduledCallsService';
let QueueUpdateService = class QueueUpdateService {
    constructor(queueService, currentCallsService, historyService, scheduledCallsService) {
        this.queueService = queueService;
        this.currentCallsService = currentCallsService;
        this.historyService = historyService;
        this.scheduledCallsService = scheduledCallsService;
        this.unsubscribe = null;
        makeAutoObservable(this);
    }
    start() {
        this.unsubscribe = reaction(() => this.queueService.lastEvent, (event) => {
            const eventType = event?.data?.type;
            switch (eventType) {
                case ECallLongpollType.CurrentCallsUpdate:
                    this.currentCallsService.loadCurrentCalls();
                    break;
                case ECallLongpollType.ScheduledCallsUpdate:
                    this.scheduledCallsService.refresh();
                    break;
                case ECallLongpollType.CallHistoryUpdated:
                case ECallLongpollType.CallGroupHistoryUpdated:
                    this.historyService.refresh();
                    break;
            }
        });
    }
    stop() {
        this.unsubscribe?.();
        this.unsubscribe = null;
    }
};
QueueUpdateService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [QueueService,
        CurrentCallsService,
        CallHistoryService,
        ScheduledCallsService])
], QueueUpdateService);
export { QueueUpdateService };
//# sourceMappingURL=QueueUpdateService.js.map