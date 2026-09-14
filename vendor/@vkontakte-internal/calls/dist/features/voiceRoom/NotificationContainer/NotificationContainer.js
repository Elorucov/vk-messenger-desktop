import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { CallsBanner } from '../../../components/CallsBanner';
import { useNotificationData } from './useNotificationData';
export const NotificationContainer = () => {
    const { actions, closeNotification, header, subheader } = useNotificationData();
    return (_jsx("div", { className: "VoiceRoom__NotificationContainer", children: _jsx(CallsBanner, { actions: actions, header: header, onExited: closeNotification, subheader: subheader }) }));
};
//# sourceMappingURL=NotificationContainer.js.map