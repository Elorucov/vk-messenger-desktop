import { E_ACTION } from '../constants';
import { ErrorHandleType } from '@vkontakte-internal/calls-core';
import { forceCallFinish } from '../services/backend';
import { sendVirtualBackgroundDisabled } from '../helpers/statsVirtualBackground';
import { setShowLoader } from './index';
/**
 * @deprecated use CallService.forceCallFinish
 */
export function onForceCallFinish(SDK, bridge, callId, peer, dispatch, getLang) {
    dispatch(setShowLoader(true));
    // тк именно мы "закончили звонок для всех" - оставляем пометку
    dispatch({
        type: E_ACTION.SET_LAST_CALL_DATA,
        data: { isMeEndedCallForAll: true },
    });
    forceCallFinish(callId || '')
        .catch((error) => {
        console.error(error);
        dispatch({
            type: E_ACTION.ERROR,
            text: getLang('calls_error_force_call_finish'),
            handleType: ErrorHandleType.FATAL,
        });
        dispatch({
            type: E_ACTION.CLEAN_LAST_CALL_DATA,
        });
        if (!window.navigator.onLine) {
            bridge.isInActiveCall = false;
            addEventListener('online', () => {
                SDK.hangup();
            }, { once: true });
        }
    })
        .finally(() => {
        dispatch(setShowLoader(false));
    });
    sendVirtualBackgroundDisabled(callId, peer);
}
//# sourceMappingURL=call.js.map