import React from 'react';
import { useFeatureFlags } from '../../hooks/misc';
import { Link } from '../../ui/Link/Link';
import { AvatarStack } from '@vkontakte-internal/vkcom-kit';
import { Avatar } from '../../ui/Avatar/Avatar';
export const AttachAvatar = ({ coownerPeers, author, getRoute, singleAvatarSize = 32, }) => {
    const { vkm_coauthors_posts_and_clips } = useFeatureFlags();
    const AvatarContent = coownerPeers[0] && vkm_coauthors_posts_and_clips && coownerPeers.length ? (React.createElement(AvatarStack, { size: 30, direction: 'bottom', stroke: true },
        React.createElement(AvatarStack.Item, { src: author?.photo?.photo50 }),
        React.createElement(AvatarStack.Item, { src: coownerPeers[0]?.photo?.photo50 }))) : (React.createElement(Avatar, { peer: author, size: singleAvatarSize }));
    if (getRoute) {
        return (React.createElement(Link, { to: getRoute(author), "aria-hidden": true, tabIndex: -1 }, AvatarContent));
    }
    return AvatarContent;
};
//# sourceMappingURL=AttachAvatar.js.map