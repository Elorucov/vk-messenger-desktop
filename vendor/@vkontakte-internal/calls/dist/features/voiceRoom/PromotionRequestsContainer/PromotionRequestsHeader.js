import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1,"style":1}]} */
import { Header } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../hooks/useLang';
export const PromotionRequestsHeader = ({ height }) => {
    const { getLang } = useLang();
    return (_jsx("div", { className: "CallsVoiceRoom_PromotionRequestsRowHeader", style: { height }, children: _jsx(Header, { mode: "tertiary", children: getLang('voicerooms_promotion_requests_title') }) }));
};
//# sourceMappingURL=PromotionRequestsHeader.js.map