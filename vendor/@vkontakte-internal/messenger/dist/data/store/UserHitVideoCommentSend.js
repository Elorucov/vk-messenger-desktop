import * as Channel from '../../core/model/Channel';
import * as VideoConvo from '../../core/model/VideoConvo';
import * as Post from '../../core/model/Post';
import * as Comment from '../../core/model/Comment';
import * as Attach from '../../core/model/Attach';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    const { videoId } = action;
    const lockKey = getLockKey(videoId);
    const videoConvo = draft.videoConvos.get(videoId);
    if (!videoConvo) {
        return [];
    }
    const ownerId = videoConvo.ownerId;
    const isLive = videoConvo.type === 'live';
    const accessKey = videoConvo.accessKey;
    switch (action.type) {
        case 'UserHitVideoCommentSend': {
            const { text, attaches, extra, onComplete, onFail } = action;
            const attachments = Attach.ids(attaches).join(',');
            if (!text && !attachments && !extra?.sticker) {
                return [];
            }
            if (draft.locks.sendVideoComment.has(lockKey)) {
                return [];
            }
            draft.locks.sendVideoComment.add(lockKey);
            return [
                async function sendVideoComment({ api }) {
                    try {
                        onComplete?.();
                        const sendComment = async () => {
                            if (isLive && extra?.sticker?.id) {
                                return api.fetch('video.liveSendSticker', {
                                    owner_id: ownerId,
                                    video_id: videoId,
                                    sticker_id: extra?.sticker.id,
                                    access_key: accessKey,
                                });
                            }
                            else {
                                return api.fetch('video.createComment', {
                                    owner_id: ownerId,
                                    video_id: videoId,
                                    access_key: accessKey,
                                    message: text,
                                    attachments,
                                    sticker_id: extra?.sticker?.id,
                                    sticker_referrer: extra?.sticker?.referrer,
                                });
                            }
                        };
                        const response = await sendComment();
                        return {
                            type: 'UserHitVideoCommentSend_RequestCompleted',
                            hasFailed: false,
                            response,
                            videoId,
                            text,
                            attaches,
                        };
                    }
                    catch (err) {
                        onFail?.(err);
                        return {
                            type: 'UserHitVideoCommentSend_RequestCompleted',
                            hasFailed: true,
                            videoId,
                            text,
                            attaches,
                        };
                    }
                },
            ];
        }
        case 'UserHitVideoCommentSend_RequestCompleted': {
            const { text, attaches, hasFailed, response } = action;
            if (hasFailed) {
                draft.locks.sendVideoComment.delete(lockKey);
                return [];
            }
            const hasStickerAttach = !!attaches.sticker;
            const shouldAbortCommentPosting = isLive && hasStickerAttach;
            if (!shouldAbortCommentPosting) {
                const newCommentCmid = Comment.resolveCmid(response);
                const newComment = Comment.newNormal({
                    channelType: "channel" /* Channel.ChannelType.CHANNEL */,
                    canEdit: !hasStickerAttach,
                    canDelete: true,
                    channelId: Channel.resolveId(ownerId),
                    postCmid: Post.resolveCmid(0),
                    sentAt: Date.now(),
                    cmid: newCommentCmid,
                    peerId: draft.ownerId,
                    attaches,
                }, text);
                VideoConvo.addComment(videoConvo, newComment);
            }
            draft.locks.sendVideoComment.delete(lockKey);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
const getLockKey = (videoId) => videoId;
//# sourceMappingURL=UserHitVideoCommentSend.js.map