import React from 'react';
import * as Peer from '../../../core/model/Peer';
import { usePeers } from '../../hooks/misc';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { Chip } from '../../ui/Chip/Chip';
export const PeerChip = ({ peerId, onRemove, className, }) => {
    const peers = usePeers();
    const peer = Peer.safeGet(peers, peerId);
    return (React.createElement(Chip, { className: className, name: Peer.firstName(peer), fullName: Peer.name(peer), avatar: React.createElement(PeerAvatar, { peer: peer, size: 20 }), onRemove: onRemove }));
};
//# sourceMappingURL=PeerChip.js.map