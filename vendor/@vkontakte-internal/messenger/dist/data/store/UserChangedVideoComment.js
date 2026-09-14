import { exhaustivenessCheck } from '../../core/utils/misc';
import * as VideoConvo from '../../core/model/VideoConvo';
const userActionLockKeysMap = {
    delete: 'delete',
    report: 'report',
    restore: 'restore',
};
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    const { type, videoId, commentCmid, userAction } = action;
    const lockKey = getChangeCommentActionLockKey(userAction.kind, videoId, commentCmid);
    const videoConvo = draft.videoConvos.get(videoId);
    const comment = videoConvo?.comments.find((comment) => comment.cmid === commentCmid);
    if (!videoConvo || !comment) {
        return [];
    }
    const ownerId = videoConvo.ownerId;
    switch (type) {
        case 'UserChangedVideoComment': {
            if (draft.locks.videoCommentActions.has(lockKey)) {
                return [];
            }
            draft.locks.videoCommentActions.add(lockKey);
            let fetchUserAction;
            let onSuccess;
            switch (userAction.kind) {
                case 'delete': {
                    if (comment.kind !== 'Normal') {
                        break;
                    }
                    VideoConvo.deleteComment(videoConvo, commentCmid);
                    fetchUserAction = (api) => api
                        .fetch('video.deleteComment', {
                        owner_id: ownerId,
                        comment_id: commentCmid,
                    })
                        .then((res) => Boolean(res));
                    break;
                }
                case 'restore': {
                    VideoConvo.restoreComment(videoConvo, commentCmid);
                    fetchUserAction = (api) => api
                        .fetch('video.restoreComment', {
                        owner_id: ownerId,
                        comment_id: commentCmid,
                    })
                        .then((res) => Boolean(res));
                    break;
                }
                case 'report': {
                    if (comment.kind !== 'Normal') {
                        break;
                    }
                    VideoConvo.deleteComment(videoConvo, commentCmid);
                    fetchUserAction = (api) => api
                        .fetch('video.reportComment', {
                        owner_id: ownerId,
                        comment_id: commentCmid,
                        reason: userAction.reason, // некорректная типизация параметров
                    })
                        .then((res) => Boolean(res));
                    onSuccess = userAction.onSuccess;
                    break;
                }
                default:
                    exhaustivenessCheck(userAction);
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
                            type: 'UserChangedVideoComment_RequestCompleted',
                            videoId,
                            commentCmid,
                            hasFailed,
                            userAction,
                            onSuccess,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedVideoComment_RequestCompleted',
                            videoId,
                            commentCmid,
                            hasFailed: true,
                            userAction,
                        };
                    }
                },
            ];
        }
        case 'UserChangedVideoComment_RequestCompleted': {
            const { hasFailed, onSuccess } = action;
            draft.locks.videoCommentActions.delete(lockKey);
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
                    default:
                        exhaustivenessCheck(userAction);
                }
                if (undoAction) {
                    handler(draft, {
                        type: 'UserChangedVideoComment',
                        userAction: undoAction,
                        videoId,
                        commentCmid,
                    }, featureFlags, envFeatureFlags);
                }
                draft.locks.videoCommentActions.delete(lockKey);
            }
            onSuccess?.();
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
const getChangeCommentActionLockKey = (userAction, videoId, commentCmid) => `${userActionLockKeysMap[userAction]}-${videoId}-${commentCmid}`;
//# sourceMappingURL=UserChangedVideoComment.js.map