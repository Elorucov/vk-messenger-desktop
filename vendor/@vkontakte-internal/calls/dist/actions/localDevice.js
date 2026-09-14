import { actionCreator } from '../helpers/actionCreator';
import { E_ACTION } from '../constants';
export const setLocalDevice = actionCreator(E_ACTION.SET_LOCAL_DEVICE);
export const setLocalHandState = (prevStatusData, handState) => setLocalDevice({
    statusData: {
        ...prevStatusData,
        hand: {
            state: handState,
            ts: Date.now(),
        },
    },
});
export const setLocalDratState = (prevStatusData, dratState) => setLocalDevice({
    statusData: {
        ...prevStatusData,
        drat: {
            state: dratState,
            ts: Date.now(),
        },
    },
});
export const resetLocalStatusData = () => setLocalDevice({
    statusData: {
        hand: {
            state: false,
            ts: Date.now(),
        },
        drat: {
            state: false,
            ts: Date.now(),
        },
    },
});
//# sourceMappingURL=localDevice.js.map