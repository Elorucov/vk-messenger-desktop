import { jsx as _jsx } from "react/jsx-runtime";
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getSausageView } from '../selectors';
import { SausageParticipantsWidget } from '../SausageParticipantsWidget/SausageParticipantsWidget';
import { PromotionRequestsWidget } from '../PromotionRequestsContainer/PromotionRequestsContainer';
import { ChatContainer } from '../ChatContainer/ChatContainer';
import { SausageViewModes } from '@vkontakte-internal/calls-core';
export const SausageContent = () => {
    const sausageView = useTypedSelector(getSausageView);
    switch (sausageView) {
        case SausageViewModes.PARTICIPANTS: {
            return _jsx(SausageParticipantsWidget, {});
        }
        case SausageViewModes.PROMOTION_REQUESTS: {
            return _jsx(PromotionRequestsWidget, {});
        }
        case SausageViewModes.CHAT: {
            return _jsx(ChatContainer, {});
        }
        default: {
            return _jsx(SausageParticipantsWidget, {});
        }
    }
};
//# sourceMappingURL=SausageContent.js.map