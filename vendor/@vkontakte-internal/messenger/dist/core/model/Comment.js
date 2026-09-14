import * as TextChunk from '../model/TextChunk';
import * as Peer from '../model/Peer';
export function resolveCmid(id) {
    if (Number.isNaN(id) || id === undefined) {
        id = 0;
    }
    return id;
}
export function toWallReplyAttach(comment) {
    return {
        kind: 'WallReply',
        attaches: comment.attaches,
        chunks: comment.chunks,
        id: comment.cmid,
        postId: comment.postCmid,
        authorId: comment.peerId,
        date: comment.sentAt,
        ownerId: Peer.resolveId(comment.channelId),
    };
}
export function toPlainText(comment, opts) {
    return TextChunk.toPlainText(comment.chunks, opts);
}
export function isEmpty(comment) {
    return (comment.chunks.length === 0 &&
        !Object.keys(comment.attaches).find((key) => key !== 'unknown'));
}
/**
 * Конвертация Normal в MarkedDeleted
 */
export function markDeleted(comment, isThreadDeleted, isPeerBanned) {
    return {
        ...comment,
        kind: 'MarkedDeleted',
        isThreadDeleted,
        isPeerBanned,
    };
}
/**
 * Конвертация MarkedDeleted в Normal
 */
export function restoreDeleted(comment) {
    return {
        ...comment,
        kind: 'Normal',
    };
}
export function deleteThread(comment) {
    comment.isThreadDeleted = true;
}
export function restoreThread(comment) {
    comment.isThreadDeleted = false;
}
export function changeIsPeerBanned(comment, value) {
    comment.isPeerBanned = value;
}
export function newNormal(fields, text) {
    return {
        ...fields,
        kind: 'Normal',
        replies: {
            count: 0,
            history: [],
        },
        chunks: TextChunk.fromServerText(text),
        likes: {
            count: 0,
            reactionId: undefined,
            availableReactionIds: [],
            peerIds: new Set(),
        },
    };
}
export function toRawText(comment) {
    return TextChunk.toRawText(comment.chunks);
}
export function isFromCommunityChannel(comment) {
    return comment.channelType === "community_channel" /* Channel.ChannelType.COMMUNITY_CHANNEL */;
}
export function toCommentChannelUrl(comment) {
    return `https://vk.com/im/channels/${comment.channelId}?comment=${comment.cmid}&cmid=${comment.postCmid}`;
}
//# sourceMappingURL=Comment.js.map