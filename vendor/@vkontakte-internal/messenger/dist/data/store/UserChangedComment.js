import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import * as Comment from '../../core/model/Comment';
import * as History from '../../core/model/History';
const userActionLockKeysMap = {
    delete: 'delete',
    restore: 'restore',
    report: 'report',
    deleteThread: 'delete',
    restoreThread: 'restore',
};
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    const { type, channelId, postCmid, commentCmid, userAction } = action;
    const lockKey = getChangeCommentActionLockKey(userAction.kind, channelId, postCmid, commentCmid);
    const channel = draft.channels.get(channelId);
    if (!channel || channel?.kind === 'ChannelRestricted') {
        return [];
    }
    const isCommunityChannel = Channel.isCommunityChannel(channel);
    const node = channel && History.findNodeByCmid(channel.history, postCmid).node;
    const post = node?.kind === 'Node' && node.item;
    const comment = post && Post.findCommentByCmid(post, commentCmid);
    if (!comment) {
        return [];
    }
    switch (type) {
        case 'UserChangedComment': {
            if (draft.locks.commentActions.has(lockKey)) {
                return [];
            }
            draft.locks.commentActions.add(lockKey);
            let fetchUserAction;
            switch (userAction.kind) {
                case 'delete': {
                    if (comment.kind !== 'Normal') {
                        break;
                    }
                    const deletedComment = Comment.markDeleted(comment, false, false);
                    Post.replaceComment(post, deletedComment);
                    fetchUserAction = (api) => isCommunityChannel
                        ? api
                            .fetch('channels.deleteComment', {
                            channel_id: channelId,
                            cmid: postCmid,
                            comment_id: deletedComment.cmid,
                        })
                            .then((res) => Boolean(res))
                        : api
                            .fetch('wall.deleteComment', {
                            owner_id: channelId,
                            comment_id: deletedComment.cmid,
                        })
                            .then((res) => Boolean(res));
                    break;
                }
                case 'restore': {
                    if (comment.kind !== 'MarkedDeleted') {
                        break;
                    }
                    const restoredComment = Comment.restoreDeleted(comment);
                    Post.replaceComment(post, restoredComment);
                    fetchUserAction = (api) => isCommunityChannel
                        ? api
                            .fetch('channels.restoreComment', {
                            channel_id: channelId,
                            cmid: postCmid,
                            comment_id: restoredComment.cmid,
                        })
                            .then((res) => Boolean(res))
                        : api
                            .fetch('wall.restoreComment', {
                            owner_id: channelId,
                            comment_id: restoredComment.cmid,
                        })
                            .then((res) => Boolean(res));
                    break;
                }
                case 'report': {
                    if (comment.kind !== 'Normal') {
                        break;
                    }
                    Post.deleteComment(post, comment.cmid);
                    const targetCmid = comment.cmid;
                    fetchUserAction = (api) => isCommunityChannel
                        ? api
                            .fetch('channels.reportComment', {
                            channel_id: channelId,
                            comment_id: targetCmid,
                            reason: userAction.reason,
                        })
                            .then((res) => Boolean(res))
                        : api
                            .fetch('wall.reportComment', {
                            owner_id: channelId,
                            comment_id: targetCmid,
                            reason: userAction.reason,
                        })
                            .then((res) => Boolean(res));
                    break;
                }
                case 'deleteThread': {
                    if (comment.kind !== 'MarkedDeleted' && comment.kind !== 'Deleted') {
                        break;
                    }
                    Comment.deleteThread(comment);
                    fetchUserAction = (api) => isCommunityChannel
                        ? api
                            .fetch('channels.deleteThread', {
                            channel_id: channelId,
                            thread_id: commentCmid,
                        })
                            .then((res) => Boolean(res))
                        : api
                            .fetch('wall.deleteThread', {
                            owner_id: channelId,
                            reply_id: commentCmid,
                        })
                            .then((res) => Boolean(res));
                    break;
                }
                case 'restoreThread': {
                    if (comment.kind !== 'MarkedDeleted' && comment.kind !== 'Deleted') {
                        break;
                    }
                    Comment.restoreThread(comment);
                    fetchUserAction = (api) => isCommunityChannel
                        ? api
                            .fetch('channels.restoreThread', {
                            channel_id: channelId,
                            thread_id: commentCmid,
                        })
                            .then((res) => Boolean(res))
                        : api
                            .fetch('wall.restoreThread', {
                            owner_id: channelId,
                            reply_id: commentCmid,
                        })
                            .then((res) => Boolean(res));
                    break;
                }
                default:
                    exhaustivenessCheck(userAction);
            }
            if (!fetchUserAction) {
                return [];
            }
            return [
                async function applyAction({ api }) {
                    try {
                        let hasFailed = false;
                        if (fetchUserAction) {
                            const res = await fetchUserAction(api);
                            hasFailed = !res;
                        }
                        return {
                            type: 'UserChangedComment_RequestCompleted',
                            channelId,
                            isCommunityChannel,
                            postCmid,
                            commentCmid,
                            hasFailed,
                            userAction,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedComment_RequestCompleted',
                            channelId,
                            isCommunityChannel,
                            postCmid,
                            commentCmid,
                            hasFailed: true,
                            userAction,
                        };
                    }
                },
            ];
        }
        case 'UserChangedComment_RequestCompleted': {
            const { hasFailed } = action;
            draft.locks.commentActions.delete(lockKey);
            if (hasFailed) {
                let undoAction;
                switch (userAction.kind) {
                    case 'delete':
                    case 'report': {
                        undoAction = {
                            kind: 'restore',
                        };
                        break;
                    }
                    case 'restore': {
                        undoAction = {
                            kind: 'delete',
                        };
                        break;
                    }
                    case 'deleteThread': {
                        undoAction = {
                            kind: 'restoreThread',
                        };
                        break;
                    }
                    case 'restoreThread': {
                        undoAction = {
                            kind: 'deleteThread',
                        };
                        break;
                    }
                    default:
                        exhaustivenessCheck(userAction);
                }
                if (undoAction) {
                    const undoLockKey = getChangeCommentActionLockKey(undoAction.kind, channelId, postCmid, commentCmid);
                    handler(draft, {
                        type: 'UserChangedComment',
                        userAction: undoAction,
                        channelId,
                        postCmid,
                        commentCmid,
                    }, featureFlags, envFeatureFlags);
                    draft.locks.commentActions.delete(undoLockKey);
                }
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
const getChangeCommentActionLockKey = (userAction, channelId, postCmid, commentCmid) => `${userActionLockKeysMap[userAction]}-${channelId}-${postCmid}-${commentCmid}`;
//# sourceMappingURL=UserChangedComment.js.map