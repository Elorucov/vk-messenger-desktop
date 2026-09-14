import React, { useMemo } from 'react';
import { Badge, ContentBadge, EllipsisText, Flex, Text, } from '@vkontakte-internal/vkcom-kit';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
export function ConvoListItemTagsCounter({ count, tags, }) {
    const tooltipItems = useMemo(() => tags.slice(tags.length - count), [count, tags]);
    return (React.createElement(Tooltip, { content: React.createElement(Flex, { direction: "column", gap: 6 }, tooltipItems.map((tag) => (React.createElement(Text, { key: tag.id },
            React.createElement(Flex, { align: "center", gap: 6, noWrap: true },
                React.createElement(Badge, { style: { backgroundColor: `#${tag.color}` } }),
                React.createElement(Flex.Item, null,
                    React.createElement(EllipsisText, { maxWidth: 200 }, tag.name))))))) },
        React.createElement("div", null,
            React.createElement(ContentBadge, { appearance: "neutral", mode: "secondary", size: "s" }, `+${count}`))));
}
//# sourceMappingURL=ConvoListItemTagsCounter.js.map