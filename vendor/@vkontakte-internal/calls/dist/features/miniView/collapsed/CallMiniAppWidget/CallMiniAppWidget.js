import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}],"Footnote":["@vkontakte-internal/vkcom-kit",{"style":1}]} */
import { useCallback, useEffect, useMemo } from 'react';
import { Footnote, getColorClass } from '@vkontakte-internal/vkcom-kit';
import { Icon16Users, Icon24PhoneDown } from '@vkontakte/icons';
import { E_ACTION } from '../../../../constants';
import { NotificationType } from '@vkontakte-internal/calls-core';
import { useCallNotifications } from '../../../../hooks/useCallNotifications';
import { useTypedDispatch } from '../../../../hooks/useTypedDispatch';
import { useLang } from '../../../../hooks/useLang';
import { CallVideoWidget } from '../CallVideoWidget/CallVideoWidget';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { CallMiniAppProvider, useCallMiniAppModel } from './CallMiniAppModel';
const CallMiniApp = observer(function CallMiniApp() {
    const { props, activeDevicesCount, localDeviceStatus = 1, showLeaveBox } = useCallMiniAppModel();
    const { getLang } = useLang();
    const dispatch = useTypedDispatch();
    const notification = useCallNotifications('CallOrator__notification');
    const clearNotifications = useCallback(() => {
        dispatch({
            type: E_ACTION.CALL_NOTIFICATION,
            notification: null,
        });
    }, [dispatch]);
    useEffect(() => {
        if (localDeviceStatus > 0.6) {
            clearNotifications();
        }
        else {
            dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: NotificationType.NETWORK_PROBLEMS,
                    data: {
                        status: localDeviceStatus < 0.3 ? 'bad' : 'weak',
                    },
                },
            });
        }
    }, [localDeviceStatus]);
    const controlsBottomRight = useMemo(() => [
        {
            dataTestId: 'calls_call_widget_button_leave',
            tooltop: getLang('calls_exit'),
            children: _jsx(Icon24PhoneDown, { className: getColorClass('color_icon_negative') }),
            onClick: showLeaveBox,
        },
    ], [showLeaveBox]);
    return (_jsxs(CallVideoWidget, { controlsTopRight: [], controlsBottomLeft: ['mic-toggle'], controlsBottomRight: controlsBottomRight, widgetClass: "CallMiniAppWidget", isMiniApp: true, ...props.current, children: [notification, _jsxs("div", { className: "CallMiniAppWidget__bottomInfo", children: [_jsx(Icon16Users, {}), _jsx(Footnote, { weight: "3", style: { lineHeight: '48px' }, children: activeDevicesCount })] })] }));
});
export const CallMiniAppWidget = createWidget(CallMiniAppProvider, CallMiniApp);
//# sourceMappingURL=CallMiniAppWidget.js.map