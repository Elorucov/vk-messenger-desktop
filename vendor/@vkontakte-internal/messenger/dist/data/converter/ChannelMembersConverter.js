import { fromApiUser } from '../converter/PeerConverter';
export function fromApiChannelMember(item) {
    const isOwner = item.role === 'creator';
    const isAdmin = isOwner || item.role === 'administrator';
    return {
        ...fromApiUser(item).user,
        role: item.role,
        isAdmin,
        isOwner,
    };
}
//# sourceMappingURL=ChannelMembersConverter.js.map