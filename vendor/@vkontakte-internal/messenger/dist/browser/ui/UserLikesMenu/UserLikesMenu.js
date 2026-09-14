import '../../ui/UserLikesMenu/UserLikesMenu.css';
import React, { useMemo } from 'react';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useOwner, usePeers } from '../../hooks/misc';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { Link } from '../../ui/Link/Link';
import cx from 'classnames';
export const UserLikesMenuDropdown = React.memo(({ children, peerIds, isLiked, totalCount, onMenuClick }) => {
    if ((!isLiked && peerIds.length === 0) ||
        (isLiked && peerIds.length === 0 && totalCount > 1)) {
        return React.createElement(React.Fragment, null, children);
    }
    return (React.createElement(Dropdown, { classNames: {
            contentWrapper: 'UserLikesMenu__dropdownSpacer',
        }, delay: 300, position: "top", align: "right", hideOnClick: true, adaptive: true, forceUpdateContent: true, content: React.createElement(UserLikesMenu, { onMenuClick: onMenuClick, isLiked: isLiked, peerIds: peerIds, totalCount: totalCount }) }, children));
});
export const UserLikesMenu = React.memo(({ peerIds, totalCount, isLiked, onMenuClick }) => {
    const peers = usePeers();
    const { id: ownerId } = useOwner();
    const { lang } = useBrowserEnv();
    const { profiles, owner, moreLiked } = useMemo(() => {
        const owner = Peer.safeGet(peers, ownerId);
        const profiles = peerIds
            .slice(0, 5)
            .reduce((acc, peerId) => {
            const peer = Peer.safeGet(peers, peerId);
            acc.push(peer);
            return acc;
        }, []);
        const moreLiked = totalCount - 5;
        return { profiles, owner, moreLiked: moreLiked > 0 ? moreLiked : 0 };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [peerIds, totalCount, ownerId]);
    return (React.createElement("div", { onClick: onMenuClick, className: cx('UserLikesMenu', {
            'UserLikesMenu--liked': isLiked,
        }) },
        React.createElement("span", { className: "UserLikesMenu__title" }, totalCount === 1
            ? lang.use('me_user_liked')
            : lang.use('me_liked_people', {
                values: { formatted: lang.formatNumber(totalCount, 'short') },
            })),
        React.createElement("div", { className: "UserLikesMenu__peersListWrapper" },
            React.createElement("div", { className: "UserLikesMenu__peersList" },
                React.createElement(Link, { key: owner.id, to: {
                        kind: 'PeerPanel',
                        peerId: owner.id,
                        screenName: Peer.screenName(owner),
                    }, stopPropagation: false, "aria-label": Peer.name(owner) },
                    React.createElement(Avatar, { size: 32, peer: owner })),
                profiles.map((profile) => (React.createElement(Link, { to: {
                        kind: 'PeerPanel',
                        peerId: profile.id,
                        screenName: Peer.screenName(profile),
                    }, key: profile.id, stopPropagation: false, "aria-label": Peer.name(profile) },
                    React.createElement(Avatar, { size: 32, peer: profile }))))),
            moreLiked !== 0 && (React.createElement("span", { className: "UserLikesMenu__moreLiked" },
                React.createElement("span", { className: "UserLikesMenu__moreLikedCount" },
                    "+",
                    lang.formatNumber(moreLiked, 'short')))))));
});
//# sourceMappingURL=UserLikesMenu.js.map