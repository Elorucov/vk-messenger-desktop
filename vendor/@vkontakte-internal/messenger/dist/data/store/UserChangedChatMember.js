import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Peer from '../../core/model/Peer';
import * as ChatMembers from '../../core/model/ChatMembers';
import * as Convo from '../../core/model/Convo';
import { getOwnerGroupId } from '../store/State';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserChangedChatMember': {
            const { peerId, memberId, userAction } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const fetchUserMemberAction = applyConvoMemberAction(draft.ownerId, action);
            return [
                async function applyAction(env) {
                    try {
                        const response = await fetchUserMemberAction(env);
                        return {
                            type: 'UserChangedChatMember_RequestCompleted',
                            hasFailed: response !== 1,
                            peerId,
                            memberId,
                            userAction,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedChatMember_RequestCompleted',
                            hasFailed: true,
                            peerId,
                            memberId,
                            userAction,
                        };
                    }
                },
            ];
        }
        case 'UserRemoveIncognitoMember': {
            const { peerId, userAction, incognitoId } = action;
            const convo = draft.convos.get(peerId);
            const ownerId = draft.ownerId;
            if (!convo) {
                return [];
            }
            return [
                async function applyAction({ api }) {
                    try {
                        const response = await api.fetch('messages.removeChatUser', {
                            chat_id: Peer.toRealId(peerId),
                            incognito_id: incognitoId,
                            group_id: getOwnerGroupId(ownerId),
                        });
                        return {
                            type: 'UserRemoveIncognitoMember_RequestCompleted',
                            hasFailed: response !== 1,
                            peerId,
                            incognitoId,
                            userAction,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserRemoveIncognitoMember_RequestCompleted',
                            hasFailed: true,
                            peerId,
                            incognitoId,
                            userAction,
                        };
                    }
                },
            ];
        }
        case 'UserChangedChatMember_RequestCompleted': {
            const { memberId, peerId, userAction, hasFailed } = action;
            const convo = draft.convos.get(peerId);
            if (hasFailed || convo?.kind !== 'ChatConvo') {
                return [];
            }
            if (userAction === 'cancel_invitation') {
                ChatMembers.removeMember(convo.members, memberId);
            }
            if (Peer.isContactPeerId(memberId)) {
                return [];
            }
            if (userAction === 'set_admin') {
                ChatMembers.setAdmin(convo.members, memberId);
            }
            if (userAction === 'set_owner') {
                Convo.updateOwner(convo, memberId);
            }
            if (userAction === 'set_member') {
                ChatMembers.unsetAdmin(convo.members, memberId);
            }
            if (userAction === 'remove') {
                ChatMembers.removeMember(convo.members, memberId);
            }
            return [];
        }
        case 'UserRemoveIncognitoMember_RequestCompleted': {
            const { incognitoId, peerId, hasFailed } = action;
            const convo = draft.convos.get(peerId);
            if (hasFailed || convo?.kind !== 'ChatConvo') {
                return [];
            }
            const incognitoMember = ChatMembers.getIncognitoMember(convo.members, incognitoId);
            ChatMembers.removeIncognitoMember(convo.members, incognitoId);
            const memberId = Peer.resolveId(incognitoMember?.memberId);
            if (memberId) {
                ChatMembers.removeMember(convo.members, memberId);
            }
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
function applyConvoMemberAction(ownerId, action) {
    const { userAction, peerId, memberId } = action;
    switch (userAction) {
        case 'set_admin':
            return ({ api }) => api.fetch('messages.setMemberRole', {
                member_id: memberId,
                peer_id: peerId,
                role: 'admin',
                group_id: getOwnerGroupId(ownerId),
            });
        case 'set_owner':
            return ({ api }) => api.fetch('messages.setMemberRole', {
                member_id: memberId,
                peer_id: peerId,
                role: 'owner',
                group_id: getOwnerGroupId(ownerId),
            });
        case 'set_member':
            return ({ api }) => api.fetch('messages.setMemberRole', {
                member_id: memberId,
                peer_id: peerId,
                role: 'member',
                group_id: getOwnerGroupId(ownerId),
            });
        case 'cancel_invitation':
        case 'remove':
            return ({ api }) => api.fetch('messages.removeChatUser', {
                chat_id: Peer.toRealId(peerId),
                member_id: memberId,
                group_id: getOwnerGroupId(ownerId),
            });
        default:
            return exhaustivenessCheck(userAction);
    }
}
//# sourceMappingURL=UserChangedChatMember.js.map