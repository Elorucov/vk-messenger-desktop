import { jsx as _jsx } from "react/jsx-runtime";
import { EllipsisText, RichCell, Tooltip, Headline } from '@vkontakte-internal/vkcom-kit';
export const CallsRichCell = ({ caption, before, href, title, onClick, hasActive, hasHover }) => {
    return (_jsx(RichCell, { before: before, extraSubtitle: caption, href: href, onClick: onClick, target: "_blank", hasActive: hasActive, hasHover: hasHover, beforeAlign: "center", children: _jsx(Tooltip, { placement: "left", description: title, hidden: title.length < 38, children: _jsx(Headline, { level: "1", weight: "3", "data-testid": "calls_history_item_headline", children: _jsx(EllipsisText, { children: title }) }) }) }));
};
//# sourceMappingURL=CallsRichCell.js.map