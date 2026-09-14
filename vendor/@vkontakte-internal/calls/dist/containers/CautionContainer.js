import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"dangerouslySetInnerHTML":1}]} */
import { useCallback } from 'react';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { E_ACTION } from '../constants';
import { declineCall, hangup } from '@vkontakte/calls-sdk';
import { getActiveParticipantsCount, useActiveParticipantsCountLegacyStateDeps, } from '../helpers/participant';
import { CallError } from '../components/CallError/CallError';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../hooks/useLang';
import { useSendStatsService, ClickHouseEventType } from '../stats/clickHouse';
export const CautionContainer = ({ isIncoming = false }) => {
    const deps = useActiveParticipantsCountLegacyStateDeps();
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const sendStats = useSendStatsService();
    const title = isIncoming ? getLang('calls_reject_title') : getLang('calls_hangup_title');
    const text = isIncoming ? getLang('calls_reject_description') : getLang('calls_hangup_description');
    const onClose = useCallback(() => {
        dispatch({
            type: E_ACTION.SHOW_CAUTION_BOX,
            isOpen: false,
        });
    }, []);
    const handleConfirm = () => {
        onClose();
        if (isIncoming) {
            declineCall().catch(() => { });
        }
        else {
            hangup().catch(() => { });
            sendStats(ClickHouseEventType.CALL_DECLINED_OR_HANGED_LOCALLY, {
                reason: 'none',
                group_call_users_count: getActiveParticipantsCount(deps),
            });
        }
    };
    const incomingCallButtons = (_jsxs(_Fragment, { children: [_jsx(Button, { size: "m", mode: "secondary", onClick: onClose, children: getLang('calls_cancel_reject') }), _jsx(Button, { size: "m", "data-focus-first": true, onClick: handleConfirm, children: getLang('calls_reject') })] }));
    const defaultButtons = (_jsxs(_Fragment, { children: [_jsx(Button, { size: "m", onClick: onClose, mode: "secondary", children: getLang('calls_cancel') }), _jsx(Button, { size: "m", "data-focus-first": true, onClick: handleConfirm, children: getLang('calls_exit') })] }));
    return (_jsx(CallError, { title: title, onClose: onClose, actionButtons: isIncoming ? incomingCallButtons : defaultButtons, text: _jsx("span", { dangerouslySetInnerHTML: { __html: text } }) }));
};
//# sourceMappingURL=CautionContainer.js.map