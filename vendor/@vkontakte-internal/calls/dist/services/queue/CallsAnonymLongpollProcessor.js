import { __decorate, __metadata } from "tslib";
import { ECallLongpollType, isLongpollSuccessResponse, peerIdToVkId, } from '@vkontakte-internal/calls-core';
import { scope } from '@vkontakte-internal/di';
import { E_ACTION } from '../../constants';
import { StateBridge } from '../../utils/stateBridge';
import { CallsQueueProcessor } from './CallsQueueProcessor';
import { CallsLongpollAnonym } from './longpollAnonymCalls';
let CallsAnonymLongpollProcessor = class CallsAnonymLongpollProcessor {
    constructor(queueProcessor, stateBridge) {
        this.queueProcessor = queueProcessor;
        this.stateBridge = stateBridge;
        this.handleEvent = (event) => {
            switch (event.data.type) {
                case ECallLongpollType.ChatInfoUpdated: {
                    this.queueProcessor.handleChatInfoUpdated(event.data);
                    break;
                }
                case ECallLongpollType.ParticipantNameChanged: {
                    this.queueProcessor.handleChangeName(event.data);
                    break;
                }
                case ECallLongpollType.CallFinished:
                case ECallLongpollType.CallAccepted: {
                    this.queueProcessor.handleCallFinishedOrAccepted(event.data);
                    break;
                }
            }
        };
    }
    init() {
        const { stateBridge } = this;
        this.cl = new CallsLongpollAnonym({
            getAnonymSecret: () => stateBridge.anonymSecret,
            getUserId: () => peerIdToVkId(stateBridge.me),
            onResponse: (data) => {
                stateBridge.dispatch({
                    type: E_ACTION.SET_CALLS_QUEUE_RESPONSE,
                    data,
                });
                if (isLongpollSuccessResponse(data)) {
                    data.events.forEach(this.handleEvent);
                }
            },
            onUpdateSecret: (secret) => {
                stateBridge.dispatch({ type: E_ACTION.UPDATE_ANON_SECRET, secret });
            },
        });
        this.cl.wait();
    }
    destroy() {
        this.cl?.destroy();
    }
};
CallsAnonymLongpollProcessor = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [CallsQueueProcessor,
        StateBridge])
], CallsAnonymLongpollProcessor);
export { CallsAnonymLongpollProcessor };
//# sourceMappingURL=CallsAnonymLongpollProcessor.js.map