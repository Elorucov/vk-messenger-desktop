import '../../ui/ConvoStack/ConvoStack.css';
import React from 'react';
import cx from 'classnames';
import * as Peer from '../../../core/model/Peer';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Link } from '../../ui/Link/Link';
import { usePeer } from '../../hooks/misc';
export const ConvoStack = ({ peerId: peerIdProp, peer: peerProp, withBirthday = false, isOut, isCentered, selected, className, onClick, children, isWithoutBubblesTheme, isOneToOneConvo, isAvatarClickable = true, ...attributes }) => {
    /**
     * Передается что-то одно: либо peerIdProp, либо peerProp.
     * Поэтому переменная ниже будет всегда не undefined.
     * Но TS это не понимает из-за перегрузки типов в usePeer, поэтому
     * пришлось добавить ниже проверку в месте использования peer.
     */
    const peer = usePeer(peerIdProp) ?? peerProp;
    const classes = cx('ConvoStack', {
        'ConvoStack--out': isOut,
        'ConvoStack--selecting': !isOut &&
            selected &&
            selected.length &&
            !isCentered &&
            !isWithoutBubblesTheme,
        'ConvoStack--withoutBubbles': isWithoutBubblesTheme,
    }, className);
    const isAvatar = !isOut && !isCentered && !isOneToOneConvo && !isWithoutBubblesTheme;
    return (React.createElement("section", { ...attributes, onClick: onClick, className: classes, role: "listitem" },
        isAvatar && peer && (React.createElement("div", { className: "ConvoStack__author", key: "stack-author" },
            (peer.kind === 'User' || peer.kind === 'Group') && (React.createElement(Link, { to: {
                    kind: 'PeerPanel',
                    peerId: peer.id,
                    screenName: Peer.screenName(peer),
                }, disabled: !isAvatarClickable, className: "ConvoStack__authorLink", tabIndex: -1, "aria-hidden": true },
                React.createElement(Avatar, { peer: peer, size: 32, withBirthday: withBirthday }))),
            peer.kind === 'Chat' && React.createElement(Avatar, { peer: peer, size: 32 }))),
        React.createElement("div", { className: "ConvoStack__content", role: "presentation" }, children)));
};
//# sourceMappingURL=ConvoStack.js.map