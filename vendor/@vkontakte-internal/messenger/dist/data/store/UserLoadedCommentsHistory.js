import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import * as History from '../../core/model/History';
import { insertPeers } from './State';
import { COMMENTS_PER_PAGE, THREAD_COMMENTS_COUNT } from '../../core/config/config';
import { fromApiComment } from '../converter/CommentConverter';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'UserLoadedCommentsHistory': {
            const { channelId, postCmid, direction, order, rootCommentCmid } = action;
            const lockKey = getCommentsHistoryLockKey(channelId, postCmid, order, rootCommentCmid);
            if (draft.locks.getPostCommentsHistory.has(lockKey)) {
                return [];
            }
            draft.locks.getPostCommentsHistory.add(lockKey);
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            const node = History.findNodeByCmid(channel.history, postCmid).node;
            const post = node?.kind === 'Node' && node.item;
            if (!post) {
                return [];
            }
            if (order !== post.comments.order) {
                Post.changeCommentsOrder(post, order);
            }
            let sort = mapOrderToSort(order);
            let nextFrom;
            let prevFrom;
            if (rootCommentCmid) {
                const comment = Post.findCommentByCmid(post, rootCommentCmid);
                if (!comment) {
                    return [];
                }
                sort = 'asc';
                nextFrom = comment.replies.nextFrom;
                prevFrom = comment.replies.prevFrom;
            }
            else {
                nextFrom = post.comments.nextFrom;
                prevFrom = post.comments.prevFrom;
            }
            const isCommunityChannel = Channel.isCommunityChannel(channel);
            return [
                async function loadPostCommetnsHistory({ api }) {
                    try {
                        let response;
                        if (isCommunityChannel) {
                            response = await api.fetch('channels.getComments', {
                                channel_id: channelId,
                                cmid: postCmid,
                                count: COMMENTS_PER_PAGE,
                                thread_items_count: THREAD_COMMENTS_COUNT,
                                need_likes: 1,
                                extended: 1,
                                // пока в смарт не умеем
                                sort: sort === 'smart' ? undefined : sort,
                                comment_id: rootCommentCmid,
                                next_from: direction === 'forward' ? nextFrom : undefined,
                                prev_from: direction === 'backward' ? prevFrom : undefined,
                                ...(featureFlags.vkm_channels_negative_comments && {
                                    hide_negative_replies: 1,
                                }),
                            });
                        }
                        else {
                            response = await api.fetch('wall.getComments', {
                                owner_id: channelId,
                                post_id: postCmid,
                                count: COMMENTS_PER_PAGE,
                                thread_items_count: THREAD_COMMENTS_COUNT,
                                need_likes: 1,
                                extended: 1,
                                sort,
                                comment_id: rootCommentCmid,
                                next_from: direction === 'forward' ? nextFrom : undefined,
                                prev_from: direction === 'backward' ? prevFrom : undefined,
                            });
                        }
                        return {
                            ...action,
                            type: 'UserLoadedCommentsHistory_RequestSucceed',
                            response,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserLoadedCommentsHistory_RequestFailed',
                            channelId,
                            postCmid,
                            order,
                            direction,
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'UserLoadedCommentsHistory_RequestSucceed': {
            const { response, channelId, postCmid, direction, order, rootCommentCmid, } = action;
            draft.locks.getPostCommentsHistory.delete(getCommentsHistoryLockKey(channelId, postCmid, order, rootCommentCmid));
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            const node = History.findNodeByCmid(channel.history, postCmid).node;
            const post = node?.kind === 'Node' && node.item;
            if (!post || post.comments.order !== order) {
                return [];
            }
            const responseComments = response.items.map((apiComment) => fromApiComment(apiComment, channelId, postCmid));
            const updateHistory = (target, newComments) => {
                switch (direction) {
                    case 'forward': {
                        return {
                            ...target,
                            history: [...target.history, ...newComments],
                            nextFrom: target.nextFrom === response.next_from
                                ? undefined
                                : response.next_from,
                        };
                    }
                    case 'backward': {
                        return {
                            ...target,
                            history: [...newComments, ...target.history],
                            prevFrom: target.prevFrom === response.prev_from
                                ? undefined
                                : response.prev_from,
                        };
                    }
                    default:
                        exhaustivenessCheck(direction);
                }
            };
            if (rootCommentCmid) {
                const comment = Post.findCommentByCmid(post, rootCommentCmid);
                if (!comment) {
                    return [];
                }
                comment.replies = updateHistory(comment.replies, responseComments);
                comment.replies.count =
                    response.current_level_count || comment.replies.count;
                comment.replies.negativeRepliesPlaceholder =
                    featureFlags.vkm_channels_negative_comments
                        ? response.negative_replies_placeholder
                        : undefined;
            }
            else {
                post.comments = updateHistory(post.comments, responseComments);
                post.comments.count = response.count;
                post.comments.oneLevelCount =
                    response.current_level_count || post.comments.oneLevelCount;
                post.comments.negativeRepliesPlaceholder =
                    featureFlags.vkm_channels_negative_comments
                        ? response.negative_replies_placeholder
                        : undefined;
            }
            insertPeers(draft, {
                apiUsers: response.profiles || [],
                apiGroups: response.groups || [],
                apiContacts: [],
            });
            return [];
        }
        case 'UserLoadedCommentsHistory_RequestFailed': {
            const { channelId, postCmid, order, rootCommentCmid } = action;
            draft.locks.getPostCommentsHistory.delete(getCommentsHistoryLockKey(channelId, postCmid, order, rootCommentCmid));
            return [];
        }
        case 'UserInvalidatedCommentsHistory': {
            const { channelId, postCmid } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            const node = History.findNodeByCmid(channel.history, postCmid).node;
            const post = node?.kind === 'Node' && node.item;
            if (!post) {
                return [];
            }
            const order = post.comments.order;
            const lockKey = getCommentsHistoryLockKey(channelId, postCmid, order);
            if (draft.locks.getPostCommentsHistory.has(lockKey)) {
                return [];
            }
            draft.locks.getPostCommentsHistory.add(lockKey);
            const sort = mapOrderToSort(order);
            const isCommunityChannel = Channel.isCommunityChannel(channel);
            return [
                async function invalidateCommetnsHistory({ api }) {
                    try {
                        let response;
                        if (isCommunityChannel) {
                            response = await api.fetch('channels.getComments', {
                                channel_id: channelId,
                                cmid: postCmid,
                                count: COMMENTS_PER_PAGE,
                                thread_items_count: THREAD_COMMENTS_COUNT,
                                need_likes: 1,
                                extended: 1,
                                // пока в смарт не умеем
                                sort: sort === 'smart' ? undefined : sort,
                                ...(featureFlags.vkm_channels_negative_comments && {
                                    hide_negative_replies: 1,
                                }),
                            });
                        }
                        else {
                            response = await api.fetch('wall.getComments', {
                                owner_id: channelId,
                                post_id: postCmid,
                                count: COMMENTS_PER_PAGE,
                                thread_items_count: THREAD_COMMENTS_COUNT,
                                need_likes: 1,
                                extended: 1,
                                sort,
                            });
                        }
                        return {
                            ...action,
                            type: 'UserInvalidatedCommentsHistory_RequestCompleted',
                            response,
                            order,
                        };
                    }
                    catch (err) {
                        return {
                            ...action,
                            type: 'UserInvalidatedCommentsHistory_RequestCompleted',
                            order,
                        };
                    }
                },
            ];
        }
        case 'UserInvalidatedCommentsHistory_RequestCompleted': {
            const { channelId, postCmid, order, response } = action;
            const lockKey = getCommentsHistoryLockKey(channelId, postCmid, order);
            draft.locks.getPostCommentsHistory.delete(lockKey);
            if (!response) {
                return [];
            }
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            const node = History.findNodeByCmid(channel.history, postCmid).node;
            const post = node?.kind === 'Node' && node.item;
            if (!post) {
                return [];
            }
            Post.changeCommentsOrder(post, order);
            const responseComments = response.items.map((apiComment) => fromApiComment(apiComment, channelId, postCmid));
            post.comments = {
                ...post.comments,
                history: responseComments,
                prevFrom: response.prev_from,
                nextFrom: response.next_from,
                count: response.count,
                oneLevelCount: response.current_level_count || post.comments.oneLevelCount,
                negativeRepliesPlaceholder: featureFlags.vkm_channels_negative_comments
                    ? response.negative_replies_placeholder
                    : undefined,
            };
            insertPeers(draft, {
                apiUsers: response.profiles || [],
                apiGroups: response.groups || [],
                apiContacts: [],
            });
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
export const getCommentsHistoryLockKey = (channelId, cmid, order, commentCmid) => `${channelId}-${cmid}-${order}-${commentCmid || ''}`;
export const mapOrderToSort = (order) => {
    switch (order) {
        case 'interesting': {
            return 'smart';
        }
        case 'new': {
            return 'desc';
        }
        case 'old': {
            return 'asc';
        }
        default:
            exhaustivenessCheck(order);
    }
};
//# sourceMappingURL=UserLoadedCommentsHistory.js.map