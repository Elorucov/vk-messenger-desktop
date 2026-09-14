import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { CallNotificationContainer } from '../containers/CallNotificationContainer';
import { useTypedDispatch } from './useTypedDispatch';
import { useTypedSelector } from './useTypedSelector';
export function useCallNotifications(className = '') {
    const dispatch = useTypedDispatch();
    const notification = useTypedSelector((state) => state.notification);
    const participants = useTypedSelector((state) => state.participants);
    return useMemo(() => (_jsx(CallNotificationContainer, { dispatch: dispatch, notification: notification, participant: participants[notification?.data], className: className })), [notification, participants[notification?.data]]);
}
//# sourceMappingURL=useCallNotifications.js.map