import React from 'react';
import { Flex } from '@vkontakte-internal/vkcom-kit';
import cx from 'classnames';
import { ConvoListItemTagsCounter } from './ConvoListItemTagsCounter';
import './ConvoListItemTags.css';
import { TagBadge } from '../../ui/TagBadge/TagBadge';
export function ConvoListItemTags({ className, tags, }) {
    const [firstTag, ...restTags] = tags;
    if (!firstTag) {
        return null;
    }
    return (React.createElement(Flex, { className: cx('ConvoListItemTags', className), gap: 4, noWrap: true },
        React.createElement(Flex.Item, { className: "ConvoListItemTags__itemWrapper", flex: "shrink" },
            React.createElement(TagBadge, { item: firstTag })),
        !!restTags.length && (React.createElement(ConvoListItemTagsCounter, { count: restTags.length, tags: tags, key: "counter" }))));
}
//# sourceMappingURL=ConvoListItemTags.js.map