import * as Peer from '../../core/model/Peer';
import * as ChatMembers from '../../core/model/ChatMembers';
export function fromApiIncognitoMember(apiIncognitoMember) {
    const incognitoMemberId = ChatMembers.resolveIncognitoMemberId(apiIncognitoMember.id);
    /**
     * После поднятия версии апи ошибок не будет
     */
    // @ts-expect-error
    const inviterPeerId = Peer.resolveId(apiIncognitoMember.invited_by);
    // @ts-expect-error
    const memberId = Peer.resolveId(apiIncognitoMember.member_id);
    return {
        id: incognitoMemberId,
        name: apiIncognitoMember.name || '',
        // @ts-expect-error
        inviteDate: apiIncognitoMember.join_date * 1000,
        inviterId: inviterPeerId,
        ...((Peer.isUserPeerId(memberId) || Peer.isContactPeerId(memberId)) && {
            memberId,
        }),
    };
}
//# sourceMappingURL=ChatIncognitoMemberConverter.js.map