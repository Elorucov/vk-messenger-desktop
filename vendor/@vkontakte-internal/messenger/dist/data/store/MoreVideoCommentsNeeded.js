import { insertPeers } from '../store/State';
import { VIDEO_COMMENTS_PER_PAGE } from '../../core/config/config';
import { exhaustivenessCheck } from '../../core/utils/misc';
import * as VideoConvo from '../../core/model/VideoConvo';
import { fromApiComment } from '../converter/CommentConverter';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'MoreVideoCommentsNeeded': {
            const { startCommentId, videoId } = action;
            const videoConvo = draft.videoConvos.get(videoId);
            if (!videoConvo ||
                draft.locks.getVideoCommentsHistory.has(getLockId(videoId, startCommentId))) {
                return [];
            }
            draft.locks.getVideoCommentsHistory.add(getLockId(videoId, startCommentId));
            const ownerId = videoConvo.ownerId;
            const accessKey = videoConvo.accessKey;
            return [
                async function loadMoreVideoComments({ api }) {
                    try {
                        const count = VIDEO_COMMENTS_PER_PAGE;
                        const response = await api.fetch('video.getComments', {
                            owner_id: ownerId,
                            video_id: videoId,
                            access_key: accessKey,
                            start_comment_id: Math.max(startCommentId, 1),
                            count,
                            offset: 1,
                            extended: 1,
                            sort: 'desc',
                        }, { retries: 5 });
                        return {
                            type: 'MoreVideoCommentsNeeded_RequestCompleted',
                            hasFailed: false,
                            requestedCount: count,
                            hasMore: response.items.length >= count,
                            response,
                            startCommentId,
                            videoId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'MoreVideoCommentsNeeded_RequestCompleted',
                            hasMore: false,
                            hasFailed: true,
                            startCommentId,
                            videoId,
                        };
                    }
                },
            ];
        }
        case 'MoreVideoCommentsNeeded_RequestCompleted': {
            const { hasFailed, hasMore, response, videoId, startCommentId } = action;
            draft.locks.getVideoCommentsHistory.delete(getLockId(videoId, startCommentId));
            const videoConvo = draft.videoConvos.get(videoId);
            if (hasFailed || !videoConvo) {
                return [];
            }
            if (response) {
                insertPeers(draft, {
                    apiUsers: response.profiles || [],
                    apiGroups: response.groups || [],
                    apiContacts: [],
                });
                VideoConvo.insertComments(videoConvo, response.items.map((comment) => fromApiComment(comment)).reverse(), hasMore);
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
function getLockId(videoId, startCommentId) {
    return `${videoId}-${startCommentId}`;
}
//# sourceMappingURL=MoreVideoCommentsNeeded.js.map