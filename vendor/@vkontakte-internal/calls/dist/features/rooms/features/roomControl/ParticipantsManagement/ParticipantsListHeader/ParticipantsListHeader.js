import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { Header, Link } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../../../../hooks/useLang';
import styles from './ParticipantsListHeader.module.css';
export const ParticipantsListHeader = ({ title, count, onAutoDivide, }) => {
    const { getLang } = useLang();
    return (_jsx("div", { className: styles.header, children: _jsx(Header, { indicator: count, after: onAutoDivide && (_jsx(Link, { onClick: onAutoDivide, "data-testid": "calls_rooms_control_auto_divide", children: getLang('calls_room_control_button_auto_divide') })), children: title }) }));
};
//# sourceMappingURL=ParticipantsListHeader.js.map