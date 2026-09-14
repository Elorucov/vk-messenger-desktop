import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"dangerouslySetInnerHTML":1}]} */
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { ErrorHandleType } from '@vkontakte-internal/calls-core';
import { E_ACTION } from '../constants';
import { debugMessage, DebugMessageType, declineCall, processPush } from '@vkontakte/calls-sdk';
import { CallError } from '../components/CallError/CallError';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../hooks/useLang';
export const ErrorContainer = ({ title, text, onCloseFatal, handleType, callId }) => {
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const handleClose = () => {
        dispatch({
            type: E_ACTION.ERROR,
            isClosed: true,
        });
        switch (handleType) {
            case ErrorHandleType.FATAL: {
                onCloseFatal();
                break;
            }
            case ErrorHandleType.DECLINE: {
                declineCall().catch(() => { });
                break;
            }
            case ErrorHandleType.PROCESS: {
                processPush(callId || '')
                    .then(() => {
                    declineCall().catch(() => { });
                })
                    .catch((err) => {
                    debugMessage(DebugMessageType.ERROR, 'Delayed by error push process error', err);
                });
                break;
            }
            case ErrorHandleType.EMPTY: {
                // do nothing
                break;
            }
        }
    };
    const errorText = text || getLang('calls_error');
    const parsedErrorText = errorText.match(/<\s?[a-zA-Z0-9]+\s?\/?>/) ? (_jsx("span", { dangerouslySetInnerHTML: { __html: errorText } })) : (errorText);
    return (_jsx(CallError, { title: title || getLang('calls_oops'), onClose: handleClose, actionButtons: _jsx(Button, { size: "m", "data-focus-first": true, onClick: handleClose, children: getLang('calls_close') }), text: parsedErrorText }));
};
//# sourceMappingURL=ErrorContainer.js.map