import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Post from '../../core/model/Post';
import * as Comment from '../../core/model/Comment';
import * as Peer from '../../core/model/Peer';
import * as History from '../../core/model/History';
export const handler = (draft, action) => {
    const { type, channelId, peerId, banTarget } = action;
    const channel = draft.channels.get(channelId);
    if (channel?.kind === 'ChannelRestricted') {
        return [];
    }
    const lockKey = getLockKey(channelId, peerId);
    const getTarget = () => {
        if (!banTarget) {
            return;
        }
        const { commentCmid, postCmid } = banTarget;
        const node = channel && History.findNodeByCmid(channel.history, postCmid).node;
        const post = node?.kind === 'Node' && node.item;
        const comment = post && Post.findCommentByCmid(post, commentCmid);
        if (!comment || comment.kind !== 'MarkedDeleted') {
            return;
        }
        return {
            post,
            comment,
        };
    };
    const target = getTarget();
    switch (type) {
        case 'UserBannedChannelPeer': {
            const { comment, endDate, isCommentVisible, reason } = action;
            if (draft.locks.bannChannelPeer.has(lockKey)) {
                return [];
            }
            draft.locks.bannChannelPeer.add(lockKey);
            if (target) {
                Comment.changeIsPeerBanned(target.comment, true);
            }
            return [
                async function banPeer({ api }) {
                    try {
                        await api.fetch('groups.ban', {
                            group_id: Math.abs(channelId),
                            user_id: Peer.isUserPeerId(peerId) ? peerId : undefined,
                            owner_id: Peer.isGroupPeerId(peerId) ? peerId : undefined,
                            reason,
                            comment,
                            // бекенд принимает время только в секундах
                            end_date: endDate && Math.round(endDate / 1000),
                            comment_visible: isCommentVisible ? 1 : 0,
                        });
                        return {
                            type: 'UserBannedChannelPeer__RequestCompleted',
                            hasFailed: false,
                            channelId,
                            peerId,
                            banTarget,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserBannedChannelPeer__RequestCompleted',
                            hasFailed: true,
                            channelId,
                            peerId,
                            banTarget,
                        };
                    }
                },
            ];
        }
        case 'UserBannedChannelPeer__RequestCompleted': {
            const { hasFailed } = action;
            draft.locks.bannChannelPeer.delete(lockKey);
            if (hasFailed && target) {
                Comment.changeIsPeerBanned(target.comment, false);
            }
            return [];
        }
        case 'UserUnbannedChannelPeer': {
            if (draft.locks.bannChannelPeer.has(lockKey)) {
                return [];
            }
            draft.locks.bannChannelPeer.add(lockKey);
            if (target) {
                Comment.changeIsPeerBanned(target.comment, false);
            }
            return [
                async function banPeer({ api }) {
                    try {
                        await api.fetch('groups.unban', {
                            group_id: Math.abs(channelId),
                            user_id: Peer.isUserPeerId(peerId) ? peerId : undefined,
                            owner_id: Peer.isGroupPeerId(peerId) ? peerId : undefined,
                        });
                        return {
                            type: 'UserUnbannedChannelPeer__RequestCompleted',
                            hasFailed: false,
                            channelId,
                            peerId,
                            banTarget,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserUnbannedChannelPeer__RequestCompleted',
                            hasFailed: true,
                            channelId,
                            peerId,
                            banTarget,
                        };
                    }
                },
            ];
        }
        case 'UserUnbannedChannelPeer__RequestCompleted': {
            const { hasFailed } = action;
            draft.locks.bannChannelPeer.delete(lockKey);
            if (hasFailed && target) {
                Comment.changeIsPeerBanned(target.comment, true);
            }
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
const getLockKey = (channelId, peerId) => `${channelId}-${peerId}`;
//# sourceMappingURL=UserChangedChannelPeerBan.js.map