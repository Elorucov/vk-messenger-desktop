import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Convo from '../../core/model/Convo';
import { getOwnerGroupId } from './State';
export const VISIBLE_MESSAGES_COUNT = 250;
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserRequestChatInvitationLink': {
            const { peerId, isLinkWithHistory } = action;
            const ownerId = draft.ownerId;
            return [
                async function getInviteLink({ api }) {
                    try {
                        const response = await api.fetch('messages.getInviteLink', {
                            peer_id: peerId,
                            reset: 0,
                            visible_messages_count: isLinkWithHistory
                                ? VISIBLE_MESSAGES_COUNT
                                : 0,
                            group_id: getOwnerGroupId(ownerId),
                        }, { retries: 1 });
                        return {
                            type: 'UserRequestChatInvitationLink_RequestCompleted',
                            hasFailed: !response.link,
                            link: response.link,
                            isLinkWithHistory,
                            peerId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserRequestChatInvitationLink_RequestCompleted',
                            hasFailed: true,
                            isLinkWithHistory,
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'UserRequestChatInvitationLink_RequestCompleted': {
            const { peerId, link, isLinkWithHistory, hasFailed } = action;
            const convo = draft.convos.get(peerId);
            if (hasFailed || !convo || convo.kind !== 'ChatConvo' || !link) {
                return [];
            }
            Convo.replaceInviteLinks(convo, {
                ...convo.inviteLinks,
                ...(isLinkWithHistory ? { withHistory: link } : { noHistory: link }),
            });
            return [];
        }
        case 'UserResetChatInvitationLink': {
            const { peerId } = action;
            const ownerId = draft.ownerId;
            return [
                async function getInviteLink({ api }) {
                    try {
                        const responseWithHistory = await api.fetch('messages.getInviteLink', {
                            peer_id: peerId,
                            reset: 1,
                            visible_messages_count: VISIBLE_MESSAGES_COUNT,
                            group_id: getOwnerGroupId(ownerId),
                        }, { retries: 1 });
                        const responseNoHistory = await api.fetch('messages.getInviteLink', {
                            peer_id: peerId,
                            reset: 0,
                            visible_messages_count: 0,
                            group_id: getOwnerGroupId(ownerId),
                        }, { retries: 1 });
                        return {
                            type: 'UserResetChatInvitationLink_RequestCompleted',
                            hasFailed: !responseWithHistory.link || !responseNoHistory.link,
                            links: {
                                withHistory: responseWithHistory.link,
                                noHistory: responseNoHistory.link,
                            },
                            peerId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserResetChatInvitationLink_RequestCompleted',
                            hasFailed: true,
                            peerId,
                            links: {},
                        };
                    }
                },
            ];
        }
        case 'UserResetChatInvitationLink_RequestCompleted': {
            const { peerId, links, hasFailed } = action;
            const convo = draft.convos.get(peerId);
            if (hasFailed || convo?.kind !== 'ChatConvo') {
                return [];
            }
            if (!links.noHistory || !links.withHistory) {
                return [];
            }
            Convo.replaceInviteLinks(convo, links);
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserRequestChatInvitationLink.js.map