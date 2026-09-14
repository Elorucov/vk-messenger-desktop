import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { Icon24UsersSubtract } from '@vkontakte-internal/icons-private';
import { classNames as cn } from '@vkontakte/vkjs';
import { CallsIconButton } from '../CallsIconButton';
import { Icon24Users } from '@vkontakte/icons';
import { useLang } from '../../hooks/useLang';
export const ParticipantIconButton = ({ participantCount, onClick, ariaLabel }) => {
    const { getLang } = useLang();
    let icon = _jsx(Icon24Users, {});
    let participantCountText = '';
    let ariaLabelWithCount = ariaLabel;
    if (!!participantCount) {
        if (participantCount > 99) {
            participantCountText = '99+';
        }
        else {
            participantCountText = participantCount?.toString();
        }
        if (participantCountText) {
            icon = (_jsxs("div", { className: "ParticipantIconButton", "data-testid": "calls_call_footer_button_participants", children: [_jsx("div", { className: cn({
                            'ParticipantIconButton__count': true,
                            'ParticipantIconButton__count--lt10': participantCount < 10,
                        }), children: participantCountText }), _jsx(Icon24UsersSubtract, {})] }));
            ariaLabelWithCount = `${ariaLabelWithCount} ${participantCountText}`;
        }
    }
    return (_jsx(CallsIconButton, { tooltip: getLang('calls_participants'), onClick: onClick, ariaLabel: ariaLabelWithCount, children: icon }));
};
//# sourceMappingURL=ParticipantIconButton.js.map