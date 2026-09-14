import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useCallback, useMemo } from 'react';
import { CallsBanner } from '../../../components/CallsBanner';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { setFeatureNotification } from './featureNotificationSlice';
const defaultAsideMode = 'dismiss';
export const FeatureNotification = (props) => {
    const { asideMode = defaultAsideMode, className, header, ...rest } = props;
    const dispatch = useTypedDispatch();
    const handleExited = useCallback(() => {
        dispatch(setFeatureNotification(undefined));
    }, []);
    const headerWithTestId = useMemo(() => _jsx("div", { "data-testid": "calls_feature_notification_title", children: header }), [header]);
    return (_jsx("div", { className: "CallsFeatureNotification", children: _jsx(CallsBanner, { ...rest, asideMode: asideMode, onExited: handleExited, header: headerWithTestId }) }));
};
//# sourceMappingURL=FeatureNotification.js.map