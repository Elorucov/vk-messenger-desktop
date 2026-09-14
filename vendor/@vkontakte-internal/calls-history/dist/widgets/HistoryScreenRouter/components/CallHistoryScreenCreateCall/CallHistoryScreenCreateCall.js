import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon16CalendarOutline, Icon16PhoneOutline, Icon16ChainOutline } from '@vkontakte/icons';
import { Button, Group, ButtonGroup, HeaderLayout, Header, Spacing, Flex, } from '@vkontakte-internal/vkcom-kit';
import { useLangs } from '@vkontakte-internal/plugins';
import { useHistoryConfig } from '../../../../services/HistoryConfig';
export const CallHistoryScreenCreateCall = ({ onCreateCallClick, onPlanCalendarEvent, onJoinCallClick, }) => {
    const langs = useLangs();
    const { enableShortCredentials, enableShortCredentialsSferum, sferum } = useHistoryConfig();
    const isShortCredentialsEnabled = (enableShortCredentials && !sferum) || (enableShortCredentialsSferum && sferum);
    const actionButtons = (_jsxs(ButtonGroup, { gap: "s", children: [_jsx(Button, { onClick: onCreateCallClick, size: "m", mode: "primary", "data-testid": "calls_main_page_button_create_call", before: _jsx(Icon16PhoneOutline, {}), children: isShortCredentialsEnabled
                    ? langs.getLang('calls_page_call_by_link_create_call')
                    : langs.getLang('calls_page_call_by_link_create') }), _jsx(Button, { onClick: onPlanCalendarEvent, size: "m", mode: "secondary", "data-testid": "calls_main_page_button_schedule_call", before: _jsx(Icon16CalendarOutline, {}), children: langs.getLang('calls_landing_standalone_schedule_call') })] }));
    if (isShortCredentialsEnabled) {
        return (_jsx(Group, { children: _jsx(HeaderLayout, { aside: _jsx(Button, { onClick: onJoinCallClick, size: "m", mode: "secondary", "data-testid": "calls_main_page_button_join_call", before: _jsx(Icon16ChainOutline, {}), children: langs.getLang('calls_join') }), children: _jsxs(Flex, { direction: "row", noWrap: true, children: [_jsx(Spacing, { mode: "vertical", size: 12 }), actionButtons] }) }) }));
    }
    return (_jsx(Group, { children: _jsx(HeaderLayout, { aside: actionButtons, children: _jsx(Header, { "data-testid": "calls_main_page_header_title", children: langs.getLang('calls_page_call_by_link_header_v2') }) }) }));
};
//# sourceMappingURL=CallHistoryScreenCreateCall.js.map