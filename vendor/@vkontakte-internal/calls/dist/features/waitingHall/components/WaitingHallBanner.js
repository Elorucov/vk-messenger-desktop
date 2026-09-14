import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { CallsBanner, useControlledState } from '../../../components/CallsBanner';
import { useLang } from '../../../hooks/useLang';
import { Button, ButtonGroup } from '@vkontakte-internal/vkcom-kit';
import { useCallback } from 'react';
export const WaitingHallBanner = ({ onClickForbid, onClickPromote, onClickShowParticipants, onClose, names, totalCount, }) => {
    const { getLang } = useLang();
    const [isOpen, closeBanner] = useControlledState();
    const text = getLang('calls_notification_users_in_waiting_hall_notification', totalCount).replace('{names}', names);
    const handleClickPromote = useCallback(() => {
        onClickPromote();
        closeBanner();
    }, [onClickPromote, closeBanner]);
    let buttons;
    if (totalCount === 1) {
        buttons = (_jsxs(ButtonGroup, { mode: "horizontal", gap: "m", children: [_jsx(Button, { appearance: "accent", autoFocus: true, mode: "primary", onClick: handleClickPromote, "data-testid": "calls_waiting_hall_promote", children: getLang('calls_waiting_hall_join') }), _jsx(Button, { onClick: onClickForbid, mode: "secondary", "data-testid": "calls_waiting_hall_forbid", children: getLang('calls_waiting_hall_forbid') })] }));
    }
    else {
        buttons = (_jsx(Button, { appearance: "accent", autoFocus: true, mode: "primary", onClick: onClickShowParticipants, "data-testid": "calls_waiting_hall_show_participants", children: getLang('calls_waiting_show_participants') }));
    }
    return (_jsx("div", { className: "CallsWaitingHallBanner", children: _jsx(CallsBanner, { asideMode: "dismiss", actions: buttons, autoDismissDelay: false, header: text, isOpen: isOpen, onDismiss: closeBanner, onExited: onClose }) }));
};
//# sourceMappingURL=WaitingHallBanner.js.map