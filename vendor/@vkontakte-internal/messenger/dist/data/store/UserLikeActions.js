import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import * as Peer from '../../core/model/Peer';
import * as History from '../../core/model/History';
import { LIKE_PEERS_FIRST_LOAD, LIKE_PEERS_PER_PAGE } from '../../core/config/config';
import { insertPeers } from './State';
const lockKeysMap = {
    UserChangedLike: 'UserChangedLike',
    UserChangedLike_RequestCompleted: 'UserChangedLike',
    UserLoadedLikes: 'UserLoadedLikes',
    UserLoadedLikes_RequestCompleted: 'UserLoadedLikes',
};
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    let ownerId;
    let itemId;
    let targetItem;
    switch (action.kind) {
        case 'comment': {
            const { channelId, postCmid, commentCmid } = action;
            const channel = draft.channels.get(channelId);
            if (channel?.kind === 'ChannelRestricted') {
                break;
            }
            const node = channel && History.findNodeByCmid(channel.history, postCmid).node;
            const comment = node?.kind === 'Node' && Post.findCommentByCmid(node.item, commentCmid);
            if (!comment || comment.kind !== 'Normal') {
                break;
            }
            ownerId = comment.channelId;
            targetItem = comment;
            itemId = comment.cmid;
            break;
        }
        case 'post': {
            const { channelId, postCmid } = action;
            const channel = draft.channels.get(channelId);
            if (channel?.kind === 'ChannelRestricted') {
                break;
            }
            const node = channel && History.findNodeByCmid(channel.history, postCmid).node;
            const post = node?.kind === 'Node' && node.item;
            if (!post) {
                break;
            }
            ownerId = post.channelId;
            itemId = post.cmid;
            targetItem = post;
            break;
        }
        default:
            exhaustivenessCheck(action);
    }
    if (!targetItem || !ownerId || !itemId) {
        return [];
    }
    const lockKey = getLikeActionLockKey(lockKeysMap[action.type], action.kind, ownerId, itemId);
    switch (action.type) {
        case 'UserLoadedLikes': {
            if (draft.locks.likeActions.has(lockKey)) {
                return [];
            }
            draft.locks.likeActions.add(lockKey);
            const channel = draft.channels.get(action.channelId);
            if (!channel || channel?.kind === 'ChannelRestricted') {
                return [];
            }
            const isCommunityChannel = Channel.isCommunityChannel(channel);
            let offset;
            switch (action.kind) {
                case 'comment':
                case 'post': {
                    offset = targetItem.likes.peerIds.size;
                    break;
                }
                default:
                    exhaustivenessCheck(action);
            }
            const count = targetItem.likes.peerIds.size === 0
                ? LIKE_PEERS_FIRST_LOAD
                : LIKE_PEERS_PER_PAGE;
            return [
                async function loadLikes({ api }) {
                    try {
                        let response;
                        if (!isCommunityChannel) {
                            response = await api.fetch('likes.getList', {
                                type: action.kind,
                                owner_id: ownerId,
                                item_id: itemId,
                                extended: 1,
                                skip_own: 1,
                                count,
                                offset,
                            });
                        }
                        return {
                            ...action,
                            type: 'UserLoadedLikes_RequestCompleted',
                            response,
                            hasFailed: false,
                        };
                    }
                    catch (err) {
                        return {
                            ...action,
                            type: 'UserLoadedLikes_RequestCompleted',
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'UserLoadedLikes_RequestCompleted': {
            const { hasFailed, response } = action;
            draft.locks.likeActions.delete(lockKey);
            if (hasFailed || !response) {
                return [];
            }
            const profiles = [];
            const groups = [];
            const peerIds = [];
            response.items.forEach((item) => {
                if (item.type === 'group' ||
                    item.type === 'page' ||
                    item.type === 'event') {
                    groups.push(item);
                    peerIds.push(Peer.resolveRealId('Group', item.id));
                }
                if (item.type === 'profile' || item.type === 'email') {
                    profiles.push(item);
                    peerIds.push(Peer.resolveRealId('User', item.id));
                }
            });
            insertPeers(draft, {
                apiUsers: profiles,
                apiGroups: groups,
                apiContacts: [],
            });
            switch (action.kind) {
                case 'comment':
                case 'post': {
                    peerIds.forEach((peerId) => targetItem?.likes.peerIds.add(peerId));
                    break;
                }
                default:
                    exhaustivenessCheck(action);
            }
            return [];
        }
        case 'UserChangedLike': {
            const { reactionId, channelId, kind } = action;
            const channel = draft.channels.get(channelId);
            const prevReactionId = targetItem.likes.reactionId;
            // Не отсылаем повторный запрос, если выставляем одинаковую реакцию
            if (prevReactionId === reactionId) {
                return [];
            }
            const wasLiked = prevReactionId !== undefined;
            if (draft.locks.likeActions.has(lockKey)) {
                return [];
            }
            draft.locks.likeActions.add(lockKey);
            if (reactionId === undefined) {
                targetItem.likes.count -= 1;
            }
            else if (!wasLiked) {
                targetItem.likes.count += 1;
            }
            targetItem.likes.reactionId = reactionId;
            if (!channel || channel?.kind === 'ChannelRestricted') {
                return [];
            }
            const isCommunityChannel = Channel.isCommunityChannel(channel);
            const commentCmid = kind === 'comment' ? action.commentCmid : undefined;
            return [
                async function changeLike({ api }) {
                    try {
                        let response;
                        const actionType = wasLiked && reactionId === undefined
                            ? "decrement" /* UserChanedLikeActionType.DECREMENT */
                            : "increment" /* UserChanedLikeActionType.INCREMENT */;
                        if (isCommunityChannel) {
                            response = await api.fetch(actionType === "decrement" /* UserChanedLikeActionType.DECREMENT */
                                ? 'channels.deleteReaction'
                                : 'channels.sendReaction', {
                                channel_id: channelId,
                                item_type: 'comment',
                                item_id: commentCmid || 0,
                                reaction_id: reactionId,
                            });
                        }
                        else {
                            response = await api.fetch(actionType === "decrement" /* UserChanedLikeActionType.DECREMENT */
                                ? 'likes.delete'
                                : 'likes.add', {
                                type: action.kind,
                                owner_id: ownerId,
                                item_id: itemId || 0,
                                reaction_id: reactionId,
                            });
                        }
                        return {
                            ...action,
                            type: 'UserChangedLike_RequestCompleted',
                            response,
                            actionType: isCommunityChannel ? actionType : undefined,
                            hasFailed: false,
                        };
                    }
                    catch (err) {
                        return {
                            ...action,
                            type: 'UserChangedLike_RequestCompleted',
                            hasFailed: true,
                            prevReactionId,
                        };
                    }
                },
            ];
        }
        case 'UserChangedLike_RequestCompleted': {
            const { hasFailed, channelId, response, actionType, prevReactionId } = action;
            draft.locks.likeActions.delete(lockKey);
            if (hasFailed || !response) {
                handler(draft, {
                    ...action,
                    type: 'UserChangedLike',
                    reactionId: prevReactionId,
                }, featureFlags, envFeatureFlags);
                draft.locks.likeActions.delete(lockKey);
                return [];
            }
            const channel = draft.channels.get(channelId);
            const isCommunityChannel = channel &&
                channel.kind !== 'ChannelRestricted' &&
                Channel.isCommunityChannel(channel) &&
                actionType;
            if (isCommunityChannel) {
                targetItem.likes.count =
                    actionType === "decrement" /* UserChanedLikeActionType.DECREMENT */
                        ? targetItem.likes.count || 1 - 1
                        : targetItem.likes.count || 0 + 1;
            }
            if (typeof response === 'object') {
                targetItem.likes.count = response.likes;
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
const getLikeActionLockKey = (likeAction, likesSource, ownerId, itemId) => `${likeAction}-${likesSource}-${ownerId}-${itemId}`;
//# sourceMappingURL=UserLikeActions.js.map