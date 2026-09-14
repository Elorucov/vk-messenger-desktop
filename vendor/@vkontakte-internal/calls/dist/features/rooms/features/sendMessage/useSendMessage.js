import { useCallsSDK } from '../../../../providers/CallsSdkProvider';
import { E_ACTION, useTypedDispatch } from '../../../../hooks/useTypedDispatch';
import { useMemo, useState } from 'react';
import { NotificationType } from '@vkontakte-internal/calls-core';
import { handlePromiseError } from '../../../../helpers/logger';
import { ClickHouseEventType, useSendStatsService } from '../../../../stats/clickHouse';
export function useSendMessage(onCloseDialog) {
    const SDK = useCallsSDK();
    const dispatch = useTypedDispatch();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const disableSendMessageControl = useMemo(() => loading || !message.length, [message, loading]);
    const sendStats = useSendStatsService();
    const sendMessage = () => {
        if (disableSendMessageControl) {
            return;
        }
        setLoading(true);
        sendStats(ClickHouseEventType.SESSION_ROOMS_MESSAGE_SENT);
        SDK.chatMessage(message)
            .then(() => {
            dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: NotificationType.ROOMS_ADMIN_MESSAGE_SENT,
                },
            });
        })
            .catch(handlePromiseError)
            .finally(() => {
            setLoading(false);
        });
    };
    const handleSetMessage = (name) => {
        setMessage(name);
    };
    const handleSendMessage = () => {
        sendMessage();
        onCloseDialog();
        setMessage('');
    };
    return {
        handleSetMessage,
        handleSendMessage,
        message,
        loading,
        disableSendMessageControl,
    };
}
//# sourceMappingURL=useSendMessage.js.map