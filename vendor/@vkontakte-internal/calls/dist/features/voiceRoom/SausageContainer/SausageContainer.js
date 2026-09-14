import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { SplitCol, Tabs } from '@vkontakte-internal/vkcom-kit';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getIsVoiceRoomTribuneMode, getVoiceRoomPromotionRequestsTotalCount, getVoiceRoomSausageContainerWidth, } from '../selectors';
import { SausageContent } from './SausageContent';
import { SausageViewModes } from '@vkontakte-internal/calls-core';
import { SausageTab } from './SausageTab';
import { getHasInCallChat, getIsMeAdmin, getIsMeAnonym } from '../../../selectors';
export function SausageContainer() {
    const isMeAdmin = useTypedSelector(getIsMeAdmin);
    const isMeAnonym = useTypedSelector(getIsMeAnonym);
    const isTribune = useTypedSelector(getIsVoiceRoomTribuneMode);
    const isHasChat = useTypedSelector(getHasInCallChat);
    const sausageContainerWidth = useTypedSelector(getVoiceRoomSausageContainerWidth);
    const promotionRequestsTotalCount = useTypedSelector(getVoiceRoomPromotionRequestsTotalCount);
    return (_jsx(SplitCol, { width: sausageContainerWidth, maxWidth: sausageContainerWidth, children: _jsxs("div", { className: "CallsVoiceRoomCall__rightBlock", children: [_jsx("div", { className: "CallsVoiceRoomCall__sausageNav", children: _jsxs(Tabs, { mode: "accent", children: [isMeAdmin && isTribune && (_jsx(SausageTab, { tab: SausageViewModes.PROMOTION_REQUESTS, counter: promotionRequestsTotalCount })), _jsx(SausageTab, { tab: SausageViewModes.PARTICIPANTS }), isHasChat && !isMeAnonym && _jsx(SausageTab, { tab: SausageViewModes.CHAT })] }) }), _jsx(SausageContent, {})] }) }));
}
//# sourceMappingURL=SausageContainer.js.map