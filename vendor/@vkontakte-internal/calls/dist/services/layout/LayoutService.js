import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { CallsEventType, UIMode } from '@vkontakte-internal/calls-core';
import { pause } from '@vkontakte-internal/vkjs/lib/PromiseUtils';
import { changeUiMode } from '../../actions';
import { StateBridge } from '../../utils/stateBridge';
import { EventBusProvider } from '../eventBus';
let LayoutService = class LayoutService {
    constructor(eventBusProvider, stateBridge) {
        this.eventBusProvider = eventBusProvider;
        this.stateBridge = stateBridge;
    }
    get eventBus() {
        return this.eventBusProvider.getEventBus();
    }
    /**
     * сворачивает окно звонков в минифицированный вид
     */
    collapseCall() {
        const { uiMode: prevUiMode } = this.stateBridge;
        const dispatch = (action) => this.stateBridge.dispatch(action);
        if (prevUiMode === UIMode.FULLSCREEN) {
            pause(0.3, null).then(() => {
                dispatch(changeUiMode(UIMode.COLLAPSED));
            });
            dispatch(changeUiMode(UIMode.DEFAULT));
        }
        else {
            dispatch(changeUiMode(UIMode.COLLAPSED));
        }
        this.eventBus.emit(CallsEventType.LAYOUT_COLLAPSED);
    }
};
LayoutService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [EventBusProvider,
        StateBridge])
], LayoutService);
export { LayoutService };
//# sourceMappingURL=LayoutService.js.map