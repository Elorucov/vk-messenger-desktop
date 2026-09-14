import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"CustomScrollView":["@vkontakte-internal/vkcom-kit",{"className":1}],"div":["global",{"style":2,"className":1}]} */
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { Icon16MoreHorizontal } from '@vkontakte/icons';
import { useVirtualizer, defaultRangeExtractor } from '@tanstack/react-virtual';
import { Button, RichAvatar, DropdownActionSheet, CustomScrollView, RichCell, ButtonGroup, } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../hooks/useLang';
import { useManagePromotions, usePromotionRequestItemActions } from '../hooks';
import { PromotionRequestsHeader } from './PromotionRequestsHeader';
import { formatTimeDiff } from './helpers';
import { Provider, useModel } from './PromotionRequestsModel';
const HEADER_INDEX = 0;
const HEADER_COUNT = 1;
const HEADER_HEIGHT = 44;
const ROW_HEIGHT = 89;
const PromotionRequestsContainer = observer(function PromotionRequestsContainer() {
    const { promotionRequests, totalCount } = useModel();
    const parentRef = useRef(null);
    const langContext = useLang();
    const { getLang } = langContext;
    const getActions = usePromotionRequestItemActions();
    const { handlePromote, handleDemote } = useManagePromotions();
    const virtualizer = useVirtualizer({
        count: totalCount ? totalCount + HEADER_COUNT : 0,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            if (index === HEADER_INDEX) {
                return HEADER_HEIGHT;
            }
            return ROW_HEIGHT;
        },
        rangeExtractor: (range) => {
            if (!totalCount || !promotionRequests.length) {
                return defaultRangeExtractor(range);
            }
            return [HEADER_INDEX, ...defaultRangeExtractor(range).filter((item) => item !== HEADER_INDEX)];
        },
    });
    const virtualRows = virtualizer.getVirtualItems();
    const height = virtualizer.getTotalSize();
    return (_jsx(CustomScrollView, { className: "CallsVoiceRoomCall__sausageBox", boxRef: parentRef, autoHideScrollbar: true, children: _jsx("div", { style: { height }, children: virtualRows.map((row) => {
                if (row.index === HEADER_INDEX) {
                    return _jsx(PromotionRequestsHeader, { height: row.size }, row.key);
                }
                const index = row.index - HEADER_COUNT;
                const request = promotionRequests[index];
                if (!request) {
                    return null;
                }
                const { profile, externalId, timestamp } = request;
                const actions = getActions(profile);
                return (_jsx("div", { "data-index": externalId.id, className: "CallsVoiceRoom_PromotionRequestsRowItem", style: { height: row.size, transform: `translateY(${row.start}px)` }, children: _jsx(RichCell
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                    , { 
                        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                        before: _jsx(RichAvatar, { size: 40, src: profile.photo }), caption: formatTimeDiff(timestamp, langContext), actions: _jsxs(ButtonGroup, { children: [_jsx(Button, { mode: "primary", size: "s", onClick: () => handlePromote(externalId), children: getLang('voicerooms_promotion_requests_approve') }), _jsx(Button, { mode: "secondary", size: "s", onClick: () => handleDemote(externalId), children: getLang('voicerooms_promotion_requests_reject') })] }), after: actions && (_jsx(DropdownActionSheet, { content: actions, trigger: "click", children: _jsx(Icon16MoreHorizontal, {}) })), children: profile.name }) }, externalId.id));
            }) }) }));
});
export const PromotionRequestsWidget = createWidget(Provider, PromotionRequestsContainer);
//# sourceMappingURL=PromotionRequestsContainer.js.map