import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import List from '../../palette/List/List';
import { useLang } from '../../hooks/useLang';
import { Div, SimpleCell, Switch } from '@vkontakte-internal/vkcom-kit';
import { useConfig } from '../../services/config';
export const CallLinkSettings = ({ requireAuthToJoin = false, onRequireAuthToJoinChanged, isWaitingHallBlockShown = false, isWaitingHallEnabled = false, onWaitingHallEnabledChanged, isShowChatHistoryBlockShown = false, isShowChatHistoryEnabled = false, onShowChatHistoryChanged, isServiceChatEnabled = false, isServiceChatBlockShown = false, onServiceChatEnabledChanged, }) => {
    const { getLang } = useLang();
    const { sferum } = useConfig();
    const [isAnonymousAllowed, setIsAnonymousAllowed] = useState(!requireAuthToJoin);
    const [waitingHallEnabled, setWaitingHallEnabled] = useState(isWaitingHallEnabled);
    const [serviceChatEnabled, setServiceChatEnabled] = useState(isServiceChatEnabled);
    let locked = false;
    const changeAnonymousAllowed = useCallback(() => {
        if (locked) {
            return;
        }
        locked = true;
        const value = !isAnonymousAllowed;
        setIsAnonymousAllowed(value);
        if (onRequireAuthToJoinChanged) {
            onRequireAuthToJoinChanged(!value);
        }
    }, [requireAuthToJoin]);
    let changeServiceChatLocked = false;
    const changeServiceChat = useCallback(() => {
        if (changeServiceChatLocked) {
            return;
        }
        changeServiceChatLocked = true;
        const value = !serviceChatEnabled;
        setServiceChatEnabled(value);
        onServiceChatEnabledChanged?.(value);
    }, [isServiceChatEnabled, onServiceChatEnabledChanged]);
    let changeWaitingHallLocked = false;
    const changeWaitingHall = useCallback(() => {
        if (changeWaitingHallLocked) {
            return;
        }
        changeWaitingHallLocked = true;
        const value = !waitingHallEnabled;
        setWaitingHallEnabled(value);
        if (onWaitingHallEnabledChanged) {
            onWaitingHallEnabledChanged(value);
        }
    }, [isWaitingHallEnabled]);
    return (_jsxs(List, { children: [isServiceChatBlockShown && (_jsx(Div, { paddingTop: 4, paddingBottom: 0, children: _jsx(SimpleCell, { after: _jsx(Switch, { "data-testid": "calls_link_settings_button_toggle_service_chat", tabIndex: -1, onChange: changeServiceChat, checked: serviceChatEnabled }), subtitle: getLang('calls_menu_service_chat_description'), children: getLang('calls_menu_service_chat_title') }) })), isWaitingHallBlockShown && (_jsx(Div, { paddingTop: 0, paddingBottom: 0, children: _jsx(SimpleCell, { after: _jsx(Switch, { "data-testid": "calls_link_settings_button_toggle_waiting_hall", tabIndex: -1, onChange: changeWaitingHall, checked: waitingHallEnabled }), subtitle: getLang('calls_menu_waiting_hall_description'), children: getLang('calls_menu_waiting_hall_title') }) })), _jsx(Div, { paddingTop: 0, paddingBottom: 0, children: _jsx(SimpleCell, { after: _jsx(Switch, { "data-testid": "calls_link_settings_button_toggle_anon", tabIndex: -1, onChange: changeAnonymousAllowed, checked: isAnonymousAllowed }), subtitle: sferum
                        ? getLang('calls_enable_join_without_profile')
                        : getLang('calls_management_link_allow_anon_description'), children: getLang('calls_management_link_allow_anonymous') }) }), isShowChatHistoryBlockShown && (_jsx(Div, { paddingTop: 0, paddingBottom: 4, children: _jsx(SimpleCell, { after: _jsx(Switch, { "data-testid": "calls_link_settings_button_toggle_chat", tabIndex: -1, onChange: onShowChatHistoryChanged, checked: isShowChatHistoryEnabled }), subtitle: getLang('calls_show_chat_history_description'), children: getLang('calls_show_chat_history') }) }))] }));
};
//# sourceMappingURL=CallLinkSettings.js.map