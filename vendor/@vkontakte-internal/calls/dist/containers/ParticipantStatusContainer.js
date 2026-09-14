import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { ActivityIndicator } from '../components/ActivityIndicator/ActivityIndicator';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { Icon16Sync } from '@vkontakte/icons';
import { useLang } from '../hooks/useLang';
export const ParticipantStatusContainer = ({ status, isMiniApp = false }) => {
    const { getLang } = useLang();
    switch (status) {
        case ParticipantStatus.WAITING:
            return _jsx(ActivityIndicator, { children: getLang('calls_status_waiting') });
        case ParticipantStatus.CONNECTING:
        case ParticipantStatus.RECONNECT:
            return isMiniApp ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "CallNotification__connecting", children: _jsx(Icon16Sync, {}) }, "icon"), _jsx("span", { children: getLang('calls_notification_connecting') }, "text")] })) : (_jsx(ActivityIndicator, { children: getLang('calls_status_connecting') }));
        case ParticipantStatus.ERROR:
            return getLang('calls_error');
        case ParticipantStatus.HANGUP:
            return _jsx(ActivityIndicator, { children: getLang('calls_status_hangup') });
        case ParticipantStatus.PERMISSIONS:
            return getLang('calls_status_no_permissions');
        case ParticipantStatus.CONNECTED:
        default:
            return null;
    }
};
//# sourceMappingURL=ParticipantStatusContainer.js.map