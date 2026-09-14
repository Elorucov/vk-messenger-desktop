import React, { useMemo } from 'react';
import { Badge, ContentBadge, EllipsisText, Flex, Text, } from '@vkontakte-internal/vkcom-kit';
import { BaseAdaptiveItemsLineCounter, } from '../../ui/AdaptiveItemsLine';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
export function AdaptiveItemsLineTagCounter({ count, isTemplate, items, }) {
    const tooltipItems = useMemo(() => items.slice(items.length - count).filter((item) => item.name), [count, items]);
    const counter = (React.createElement(ContentBadge, { appearance: "neutral", mode: "secondary", size: "s" },
        React.createElement(BaseAdaptiveItemsLineCounter, { count: count })));
    if (isTemplate) {
        return counter;
    }
    return (React.createElement(Tooltip, { content: React.createElement(Flex, { direction: "column", gap: 6 }, tooltipItems.map((tag) => (React.createElement(Text, { key: tag.id },
            React.createElement(Flex, { align: "center", gap: 6, noWrap: true },
                React.createElement(Badge, { style: { backgroundColor: `#${tag.color}` } }),
                React.createElement(Flex.Item, null,
                    React.createElement(EllipsisText, { maxWidth: 200 }, tag.name))))))) },
        React.createElement("div", null, counter)));
}
//# sourceMappingURL=AdaptiveItemsLineTagCounter.js.map