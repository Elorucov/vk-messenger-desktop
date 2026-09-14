import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Attach from '../../core/model/Attach';
import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import * as History from '../../core/model/History';
import * as TextChunk from '../../core/model/TextChunk';
export const handler = (draft, action) => {
    const { channelId, postCmid, commentCmid } = action;
    const lockKey = getLockKey(channelId, postCmid);
    switch (action.type) {
        case 'UserHitEditComment': {
            const { text, attaches, onComplete, onFail } = action;
            if (draft.locks.sendComment.has(lockKey)) {
                return [];
            }
            draft.locks.sendComment.add(lockKey);
            const attachments = Attach.ids(attaches).join(',');
            if (!text && !attachments) {
                return [];
            }
            const channel = draft.channels.get(channelId);
            if (!channel || channel?.kind === 'ChannelRestricted') {
                return [];
            }
            const isCommunityChannel = Channel.isCommunityChannel(channel);
            return [
                async function editComment({ api }) {
                    let hasFailed = false;
                    try {
                        let response;
                        if (isCommunityChannel) {
                            response = await api.fetch('channels.editComment', {
                                attachments,
                                channel_id: channelId,
                                cmid: postCmid,
                                text,
                                comment_id: commentCmid,
                            });
                        }
                        else {
                            response = await api.fetch('wall.editComment', {
                                attachments,
                                owner_id: channelId,
                                message: text,
                                comment_id: commentCmid,
                            });
                        }
                        hasFailed = !Boolean(response);
                        onComplete?.();
                    }
                    catch (err) {
                        onFail?.(err);
                        hasFailed = true;
                    }
                    return {
                        type: 'UserHitEditComment_RequestCompleted',
                        hasFailed,
                        text,
                        attaches,
                        channelId,
                        postCmid,
                        commentCmid,
                    };
                },
            ];
        }
        case 'UserHitEditComment_RequestCompleted': {
            draft.locks.sendComment.delete(lockKey);
            const { hasFailed, text, attaches } = action;
            if (hasFailed) {
                return [];
            }
            const channel = draft.channels.get(channelId);
            if (channel?.kind === 'ChannelRestricted') {
                return [];
            }
            const node = channel && History.findNodeByCmid(channel.history, postCmid).node;
            const post = node?.kind === 'Node' && node.item;
            const comment = post && Post.findCommentByCmid(post, commentCmid);
            if (!comment || comment.kind !== 'Normal') {
                return [];
            }
            Post.replaceComment(post, {
                ...comment,
                chunks: TextChunk.fromServerText(text),
                attaches,
                updatedAt: Date.now(),
            });
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
const getLockKey = (channelId, postCmid) => `${channelId}-${postCmid}`;
//# sourceMappingURL=UserHitEditComment.js.map