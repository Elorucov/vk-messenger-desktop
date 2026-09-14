import '../../ui/SpaceHeader/SpaceHeader.css';
import React from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon24MoreHorizontal } from '@vkontakte/icons';
import { SkeletonLoader } from '../../ui/SkeletonLoader/SkeletonLoader';
import { SpaceAvatar } from '../../ui/SpaceAvatar/SpaceAvatar';
import { Link } from '../../ui/Link/Link';
export const SpaceHeader = ({ space, isReconnecting, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: "SpaceHeader" },
        React.createElement(Link, { to: {
                kind: 'SpacePanel',
                spaceId: space.id,
            }, className: "SpaceHeader__info" },
            React.createElement("div", { className: "SpaceHeader__avatar" },
                React.createElement(SpaceAvatar, { image: space.avatar, size: 32 })),
            React.createElement("div", { className: "SpaceHeader__title" }, space.name),
            isReconnecting ? (React.createElement("div", { className: "SpaceHeader__reconnect" }, lang.use('me_app_connecting'))) : (React.createElement("div", { className: "SpaceHeader__members" }, lang.use('me_spaces_info_members_count', {
                num: space.membersCount,
                formatted: 'short',
            }))),
            React.createElement("div", { className: "SpaceHeader__icon" },
                React.createElement(Icon24MoreHorizontal, null)))));
};
export const SpaceHeaderSkeleton = () => {
    return (React.createElement("div", { className: "SpaceHeader" },
        React.createElement("div", { className: "SpaceHeader__info" },
            React.createElement("div", { className: "SpaceHeader__avatar" },
                React.createElement(SkeletonLoader, { width: 32, height: 32, rounded: true })),
            React.createElement("div", { className: "SpaceHeader__title" },
                React.createElement(SkeletonLoader, { width: 160, height: 12, rounded: true, roundedRadius: 4 })),
            React.createElement("div", { className: "SpaceHeader__members" },
                React.createElement(SkeletonLoader, { width: 88, height: 8, rounded: true, roundedRadius: 2 })),
            React.createElement("div", { className: "SpaceHeader__icon" },
                React.createElement(SkeletonLoader, { width: 24, height: 24, rounded: true, roundedRadius: 12 })))));
};
//# sourceMappingURL=SpaceHeader.js.map