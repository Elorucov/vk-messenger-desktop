import { changeUiMode } from '../actions';
import { UIMode, CallsEventType } from '@vkontakte-internal/calls-core';
import { useTypedDispatch } from './useTypedDispatch';
import { useCallback } from 'react';
import { bridgeEventBus } from '../services/eventBus';
import { useCloseModal } from './useCloseModal';
export function useRestoreCall() {
    const dispatch = useTypedDispatch();
    const closeModals = useCloseModal();
    return useCallback(() => {
        closeModals();
        dispatch(changeUiMode(UIMode.DEFAULT));
        bridgeEventBus.emit(CallsEventType.LAYOUT_NORMAL);
    }, []);
}
//# sourceMappingURL=useRestoreCall.js.map