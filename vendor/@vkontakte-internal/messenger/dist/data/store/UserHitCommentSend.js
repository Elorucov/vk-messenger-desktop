import * as Channel from '../../core/model/Channel';
import * as History from '../../core/model/History';
import * as Post from '../../core/model/Post';
import * as Comment from '../../core/model/Comment';
import * as Attach from '../../core/model/Attach';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { COMMENTS_PER_PAGE, THREAD_COMMENTS_COUNT } from '../../core/config/config';
import { getCommentsHistoryLockKey, mapOrderToSort, } from '../store/UserLoadedCommentsHistory';
import { fromApiComment } from '../converter/CommentConverter';
import { insertPeers } from '../store/State';
export const handler = (draft, action, featureFlags) => {
    const { channelId, postCmid, replyCmid } = action;
    const lockKey = getLockKey(channelId, postCmid);
    const channel = draft.channels.get(channelId);
    if (!channel || channel.kind === 'ChannelRestricted') {
        return [];
    }
    const node = History.findNodeByCmid(channel.history, postCmid).node;
    const post = node?.kind === 'Node' && node.item;
    if (!post) {
        return [];
    }
    const rootCommentCmid = replyCmid &&
        (Post.findCommentByCmid(post, replyCmid)?.rootCmid || replyCmid);
    const historyLockKey = getCommentsHistoryLockKey(channelId, postCmid, post.comments.order, rootCommentCmid);
    switch (action.type) {
        case 'UserHitCommentSend': {
            const { text, attaches, extra, fromGroupId, replyPeerId, onComplete, onFail, } = action;
            const attachments = Attach.ids(attaches).join(',');
            if (!text && !attachments && !extra?.sticker) {
                return [];
            }
            if (draft.locks.sendComment.has(lockKey)) {
                return [];
            }
            draft.locks.sendComment.add(lockKey);
            const isCommunityChannel = Channel.isCommunityChannel(channel);
            return [
                async function sendComment({ api }) {
                    try {
                        let response;
                        if (isCommunityChannel) {
                            response = await api.fetch('channels.createComment', {
                                channel_id: channelId,
                                cmid: postCmid,
                                text: text,
                                reply_to_comment: replyCmid,
                                from_group: fromGroupId ? Math.abs(fromGroupId) : undefined,
                            });
                        }
                        else {
                            response = await api.fetch('wall.createComment', {
                                owner_id: channelId,
                                post_id: postCmid,
                                message: text,
                                attachments,
                                reply_to_comment: replyCmid,
                                sticker_id: extra?.sticker?.id,
                                sticker_referrer: extra?.sticker?.referrer,
                                from_group: fromGroupId ? Math.abs(fromGroupId) : undefined,
                            });
                        }
                        onComplete?.(response);
                        return {
                            type: 'UserHitCommentSend_RequestCompleted',
                            hasFailed: false,
                            response,
                            channelId,
                            postCmid,
                            replyCmid,
                            text,
                            attaches,
                            fromGroupId,
                            replyPeerId,
                        };
                    }
                    catch (err) {
                        onFail?.(err);
                        return {
                            type: 'UserHitCommentSend_RequestCompleted',
                            hasFailed: true,
                            channelId,
                            postCmid,
                            replyCmid,
                            text,
                            attaches,
                            fromGroupId,
                            replyPeerId,
                        };
                    }
                },
            ];
        }
        case 'UserHitCommentSend_RequestCompleted': {
            const { text, attaches, hasFailed, response, replyPeerId, fromGroupId } = action;
            if (hasFailed) {
                draft.locks.sendComment.delete(lockKey);
                return [];
            }
            const target = rootCommentCmid
                ? Post.findCommentByCmid(post, rootCommentCmid)?.replies
                : post.comments;
            if (!target) {
                return [];
            }
            const newCommentCmid = Comment.resolveCmid(response.comment_id);
            const isCommunityChannel = Channel.isCommunityChannel(channel);
            // Если у нас не загружены комментарии до самого низа, очистим историю и загрузимся вокруг
            if (!!target.nextFrom) {
                draft.locks.getPostCommentsHistory.add(historyLockKey);
                const sort = mapOrderToSort(post.comments.order);
                return [
                    async function loadNewHistory({ api }) {
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
                                    sort: sort === 'smart' ? undefined : sort,
                                    start_comment_id: newCommentCmid,
                                    comment_id: rootCommentCmid,
                                    offset: -COMMENTS_PER_PAGE + 1,
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
                                    start_comment_id: newCommentCmid,
                                    comment_id: rootCommentCmid,
                                    offset: -COMMENTS_PER_PAGE + 1,
                                });
                            }
                            return {
                                type: 'UserHitCommentSend_HistoryRequestCompleted',
                                hasFailed: false,
                                response,
                                channelId,
                                postCmid,
                                rootCommentCmid,
                                newCommentCmid,
                                replyCmid,
                            };
                        }
                        catch (err) {
                            return {
                                type: 'UserHitCommentSend_HistoryRequestCompleted',
                                hasFailed: true,
                                channelId,
                                postCmid,
                                rootCommentCmid,
                                newCommentCmid,
                                replyCmid,
                            };
                        }
                    },
                ];
            }
            draft.locks.sendComment.delete(lockKey);
            const hasStickerAttach = !!attaches.sticker || !!attaches.ugcSticker;
            let newComment = undefined;
            // Для ответа с комментарием генерируем модель из ответа
            if ('comment' in response && response.comment) {
                const apiComment = fromApiComment(response.comment, channelId, postCmid);
                // Проверка на Comment.Normal для приведения типов, другого здесь быть не может
                if (apiComment.kind === 'Normal') {
                    newComment = Comment.newNormal(apiComment, response.comment.text);
                }
            }
            else {
                newComment = Comment.newNormal({
                    canEdit: !hasStickerAttach,
                    channelType: isCommunityChannel
                        ? "community_channel" /* Channel.ChannelType.COMMUNITY_CHANNEL */
                        : "channel" /* Channel.ChannelType.CHANNEL */,
                    channelId,
                    postCmid,
                    sentAt: Date.now(),
                    rootCmid: rootCommentCmid,
                    cmid: newCommentCmid,
                    peerId: fromGroupId || draft.ownerId,
                    attaches,
                    canDelete: true,
                    replyToComment: replyCmid,
                    replyToUser: replyPeerId,
                }, text);
            }
            if (rootCommentCmid) {
                const comment = Post.findCommentByCmid(post, rootCommentCmid);
                if (!comment || !newComment) {
                    return [];
                }
                comment.replies.history = [...comment.replies.history, newComment];
                comment.replies.count += 1;
            }
            else {
                if (!newComment) {
                    return [];
                }
                post.comments.history = [...post.comments.history, newComment];
                post.comments.count += 1;
                post.comments.oneLevelCount += 1;
            }
            post.comments.lastSendCmid = newCommentCmid;
            return [];
        }
        case 'UserHitCommentSend_HistoryRequestCompleted': {
            const { hasFailed, response, newCommentCmid } = action;
            draft.locks.sendComment.delete(lockKey);
            draft.locks.getPostCommentsHistory.delete(historyLockKey);
            if (hasFailed) {
                return [];
            }
            const responseComments = response.items.map((apiComment) => fromApiComment(apiComment, channelId, postCmid));
            if (rootCommentCmid) {
                const comment = Post.findCommentByCmid(post, rootCommentCmid);
                if (!comment) {
                    return [];
                }
                comment.replies = {
                    ...comment.replies,
                    count: response.current_level_count || 0,
                    history: responseComments,
                    nextFrom: response.next_from,
                    prevFrom: response.prev_from,
                };
            }
            else {
                post.comments = {
                    ...post.comments,
                    history: responseComments,
                    count: response.count,
                    oneLevelCount: response.current_level_count || 0,
                    nextFrom: response.next_from,
                    prevFrom: response.prev_from,
                };
            }
            post.comments.lastSendCmid = newCommentCmid;
            insertPeers(draft, {
                apiUsers: response.profiles || [],
                apiGroups: response.groups || [],
                apiContacts: [],
            });
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
const getLockKey = (channelId, postCmid) => `${channelId}-${postCmid}`;
//# sourceMappingURL=UserHitCommentSend.js.map