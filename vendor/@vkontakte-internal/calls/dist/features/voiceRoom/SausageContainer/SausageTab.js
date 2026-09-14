import { jsx as _jsx } from "react/jsx-runtime";
import { TabsItem, Counter } from '@vkontakte-internal/vkcom-kit';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getSausageView, setSausageViewMode } from '../../../features/voiceRoom';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { SausageViewModes } from '@vkontakte-internal/calls-core';
import { useLang } from '../../../hooks/useLang';
export const SausageTab = ({ tab, counter }) => {
    const sausageView = useTypedSelector(getSausageView);
    const tabTitle = useTabTitle(tab);
    const dispatch = useTypedDispatch();
    const openParticipants = () => dispatch(setSausageViewMode(tab));
    return (_jsx(TabsItem, { selected: sausageView === tab, onClick: openParticipants, status: counter ? (_jsx(Counter, { mode: "prominent", size: "s", children: counter })) : undefined, children: tabTitle }));
};
function useTabTitle(tab) {
    const { getLang } = useLang();
    switch (tab) {
        case SausageViewModes.PARTICIPANTS: {
            return getLang('voicerooms_sausage_tab_participants');
        }
        case SausageViewModes.PROMOTION_REQUESTS: {
            return getLang('voicerooms_sausage_tab_promotion_requests');
        }
        case SausageViewModes.CHAT: {
            return getLang('voicerooms_sausage_tab_chat');
        }
    }
}
//# sourceMappingURL=SausageTab.js.map