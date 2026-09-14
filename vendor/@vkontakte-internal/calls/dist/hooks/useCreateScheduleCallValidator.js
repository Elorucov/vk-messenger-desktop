import { usePromiseError, EErrorMessages } from './usePromiseError';
export const useCreateScheduleCallValidator = () => {
    const { handleError } = usePromiseError();
    return (params, broadcastParams) => {
        switch (true) {
            case validationBroadcastTime(params, broadcastParams): {
                handleError(createError(EErrorMessages.INVALID_BROADCAST_START_TIME_MUST_BE_MORE_CALL_TIME));
                return false;
            }
            default: {
                return true;
            }
        }
    };
};
function validationBroadcastTime(params, broadcastParams) {
    if (!broadcastParams) {
        return false;
    }
    return broadcastParams?.broadcastTime && broadcastParams?.broadcastTime < params.start;
}
function createError(msg) {
    return {
        error: {
            error_msg: msg,
        },
    };
}
//# sourceMappingURL=useCreateScheduleCallValidator.js.map