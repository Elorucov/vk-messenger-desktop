import React from 'react';
import * as Peer from '../../../core/model/Peer';
import { BasicAvatar, } from '../../ui/BasicAvatar/BasicAvatar';
import { useOwner } from '../../hooks/misc';
import { AvatarFavorites, } from '../../ui/AvatarFavorites/AvatarFavorites';
export const PeerAvatar = React.memo(function AvatarSimple({ peer, size, className, withFavorite, emptyAlt }) {
    const owner = useOwner();
    const isFavorites = Peer.isFavorites(peer.id, owner.id);
    if (withFavorite && isFavorites) {
        return React.createElement(AvatarFavorites, { size: size });
    }
    return (React.createElement(BasicAvatar, { size: size, picture: peer.photo, alt: emptyAlt ? undefined : Peer.name(peer), content: Peer.initials(peer), color: Peer.isContactPeerId(peer.id) ? 'contact' : peer.id, className: className }));
});
//# sourceMappingURL=PeerAvatar.js.map