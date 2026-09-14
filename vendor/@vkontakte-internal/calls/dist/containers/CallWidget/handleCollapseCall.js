import { CallsEventType, UIMode } from '@vkontakte-internal/calls-core';
import { pause } from '@vkontakte-internal/vkjs/lib/PromiseUtils';
import { changeUiMode } from '../../actions';
/**
 * сворачивает окно звонков в минифицированный вид
 * @deprecated use LayoutService
 */
export function handleCollapseCall({ uiMode, bridge }) {
    const dispatch = bridge.store.dispatch;
    if (uiMode === UIMode.FULLSCREEN) {
        pause(0.3, null).then(() => {
            dispatch(changeUiMode(UIMode.COLLAPSED));
        });
        dispatch(changeUiMode(UIMode.DEFAULT));
    }
    else {
        dispatch(changeUiMode(UIMode.COLLAPSED));
    }
    bridge.eventBus.emit(CallsEventType.LAYOUT_COLLAPSED);
}
//# sourceMappingURL=handleCollapseCall.js.map