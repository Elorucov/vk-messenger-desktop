import React from 'react';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import { FolderListRow } from '../../ui/FolderListRow/FolderListRow';
import { useBrowserEnv, useOwner, usePeers } from '../../hooks/misc';
import { ConvoTitle } from '../../ui/ConvoTitle/ConvoTitle';
import { OnlineStatus } from '../../ui/OnlineStatus/OnlineStatus';
import { AvatarFavorites } from '../../ui/AvatarFavorites/AvatarFavorites';
import { Avatar } from '../../ui/Avatar/Avatar';
export const FolderConvoListRow = ({ convo, showCheckbox, checkbox, before, after, onClick, }) => {
    const peers = usePeers();
    const owner = useOwner();
    const { lang } = useBrowserEnv();
    const peer = Peer.safeGet(peers, convo.peerId);
    const isFavorites = Peer.isFavorites(peer.id, owner.id);
    const activeCall = convo.kind === 'ChatConvo' && convo.activeCall
        ? convo.activeCall.participants.count > 0
            ? 'filled'
            : 'empty'
        : undefined;
    return (React.createElement(FolderListRow, { showCheckbox: showCheckbox, checkbox: checkbox, before: before, after: after, onClick: onClick, title: React.createElement(ConvoTitle, { peer: peer, isMuted: Convo.isMuted(convo), isCasper: Convo.isCasper(convo) }), subtitle: React.createElement(React.Fragment, null,
            (peer.kind === 'User' || peer.kind === 'Contact') &&
                !isFavorites && (React.createElement(OnlineStatus, { className: "ConvoHeader__online", user: peer })),
            convo.kind === 'ChatConvo' &&
                convo.state === 'in' &&
                lang.use(convo.isGroupChannel
                    ? 'me_channel_subscribers_count'
                    : 'me_group_members_count', {
                    num: convo.members.count,
                    formatted: 'short',
                })), avatar: isFavorites ? (React.createElement(AvatarFavorites, { size: 40 })) : (React.createElement(Avatar, { peer: peer, size: 40, withOnline: true, activeCall: activeCall, withBirthday: true })) }));
};
//# sourceMappingURL=FolderConvoListRow.js.map