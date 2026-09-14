import React, { useMemo } from 'react';
import * as Peer from '../../../core/model/Peer';
import { classNames as cx } from '@vkontakte/vkjs';
import './PeerListItem.css';
import { getRandomInt } from '../../../core/utils/misc';
import { Link } from '../../ui/Link/Link';
import { Avatar } from '../../ui/Avatar/Avatar';
const DEFAULT_STUB_NAME_WIDTH = 90;
const MAX_STUB_NAME_WIDTH_INCREASE = 30;
export const PeerListItem = ({ peer, before, after, subtitle, hasHover, onClick, }) => {
    return (React.createElement("div", { className: cx('PeerListItem', {
            'PeerListItem--clickable': Boolean(onClick || hasHover),
        }), role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : -1, onClick: onClick },
        before && React.createElement("div", { className: "PeerListItem__before" }, before),
        React.createElement("div", { className: "PeerListItem__main" },
            React.createElement("div", { className: "PeerListItem__avatar" },
                React.createElement(Avatar, { peer: peer, size: 40 })),
            React.createElement("div", { className: "PeerListItem__content" },
                React.createElement("h3", { className: "PeerListItem__name" }, Peer.name(peer)),
                subtitle && React.createElement("div", { className: "PeerListItem__subtitle" }, subtitle))),
        after && React.createElement("div", { className: "PeerListItem__after" }, after)));
};
export const PeerListItemLink = ({ peer, onNavigate, ...rest }) => {
    return (React.createElement(Link, { to: {
            kind: 'PeerPanel',
            peerId: peer.id,
            screenName: Peer.screenName(peer),
        }, onNavigate: onNavigate, stopPropagation: false, title: Peer.name(peer), className: "PeerListItemLink", role: "menuitem" },
        React.createElement(PeerListItem, { peer: peer, hasHover: true, ...rest })));
};
export const PeerListItemStub = () => {
    const nameWidth = useMemo(() => DEFAULT_STUB_NAME_WIDTH + getRandomInt(0, MAX_STUB_NAME_WIDTH_INCREASE), []);
    return (React.createElement("div", { className: "PeerListItemStub", role: "menuitem" },
        React.createElement("div", { className: "PeerListItemStub__avatar" }),
        React.createElement("div", { className: "PeerListItemStub__name", style: { width: nameWidth } })));
};
export const PeerList = ({ children, }) => {
    return (React.createElement("div", { className: "PeerList", role: "menu" }, children));
};
//# sourceMappingURL=PeerListItem.js.map