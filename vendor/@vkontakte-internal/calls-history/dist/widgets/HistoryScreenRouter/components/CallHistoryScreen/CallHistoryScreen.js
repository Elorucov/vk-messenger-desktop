import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CallStatSource, useVkmeContext } from '@vkontakte-internal/calls-core';
import { Button, RightMenu, TwoColumnLayout, Spacing, Flex, } from '@vkontakte-internal/vkcom-kit';
import { CallHistoryScreenCreateCall } from '../CallHistoryScreenCreateCall';
export const CallHistoryScreen = ({ showCreateCall, onCreateCallClick, activeMenuItem, menuItems, onMenuItemClick, loading, banner, children, onPlanCalendarEvent, onJoinCallClick, }) => {
    const { isVkme } = useVkmeContext();
    const callHist = (_jsxs(_Fragment, { children: [showCreateCall && (_jsx(CallHistoryScreenCreateCall, { onCreateCallClick: () => onCreateCallClick(CallStatSource.HISTORY_CREATE), onPlanCalendarEvent: onPlanCalendarEvent, onJoinCallClick: onJoinCallClick })), children] }));
    if (isVkme) {
        return (_jsxs(_Fragment, { children: [_jsx(Flex, { gap: "m", children: menuItems.map((item) => item.type === 'item' && (_jsx(Button, { size: "m", mode: activeMenuItem === item.id ? 'primary' : 'secondary', onClick: () => onMenuItemClick(item.id), children: item.label }, item.id))) }), _jsx(Spacing, { size: 16, mode: "horizontal" }), callHist] }));
    }
    const topPadding = 16;
    const menuHeight = 48;
    return (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: topPadding }), _jsxs(TwoColumnLayout, { children: [_jsx(TwoColumnLayout.Main, { children: callHist }), _jsxs(TwoColumnLayout.Narrow, { offsetTop: topPadding + menuHeight, children: [_jsx(RightMenu, { items: menuItems, selectedId: activeMenuItem, onSelect: onMenuItemClick, loading: loading, separator: "hide", "data-testid": "calls_aside_menu" }), banner] })] })] }));
};
//# sourceMappingURL=CallHistoryScreen.js.map