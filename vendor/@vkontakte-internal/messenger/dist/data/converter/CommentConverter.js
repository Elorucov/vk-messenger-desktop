import * as Comment from '../../core/model/Comment';
import * as Peer from '../../core/model/Peer';
import * as Post from '../../core/model/Post';
import * as Channel from '../../core/model/Channel';
import * as Reaction from '../../core/model/ReactionOld';
import * as TextChunk from '../../core/model/TextChunk';
import { fromApiWallReplyAttach } from './AttachConverter';
/**
 * Подкладываем нужные channelId и postCmid,
 * так как АПИ не всегда возвращает эти данные.
 * Например для удаленных комментов эти данные не приходят
 */
export function fromApiComment(apiComment, channelId, postCmid) {
    // для WallWallComment update_time на бэке почему-то решили не делать
    const update_time = apiComment.update_time;
    const channelIdFromApi = apiComment.owner_id ||
        apiComment.channel_id;
    const baseComment = {
        cmid: Comment.resolveCmid(apiComment.id),
        postCmid: Post.resolveCmid(apiComment.post_id || postCmid || 0),
        channelId: Channel.resolveId(channelIdFromApi || channelId || 0),
        //TODO: comments: ждем доработку на беке, чтобы он возвращал тип
        // https://jira.mvk.com/browse/ME-70639
        //@ts-expect-error
        channelType: apiComment.channel_type || "channel" /* Channel.ChannelType.CHANNEL */,
        canEdit: Boolean(apiComment.can_edit),
        canDelete: Boolean(apiComment.can_delete),
        rootCmid: apiComment.parents_stack?.[0]
            ? Comment.resolveCmid(apiComment.parents_stack[0])
            : undefined,
        replies: {
            count: apiComment?.thread?.count || 0,
            history: (apiComment.thread?.items || []).map((item) => fromApiComment(item, channelId, postCmid)),
            nextFrom: apiComment.thread?.next_from,
            // Делаем каст, так как в апи типах prev_from не указан, но на самом деле может приходить
            prevFrom: apiComment.thread &&
                apiComment.thread.prev_from,
            negativeRepliesPlaceholder: apiComment?.thread?.negative_replies_placeholder,
        },
        sentAt: apiComment.date * 1000,
        updatedAt: update_time ? update_time * 1000 : undefined,
    };
    if (apiComment.deleted) {
        return {
            kind: 'Deleted',
            isThreadDeleted: false,
            ...baseComment,
        };
    }
    return {
        kind: 'Normal',
        ...baseComment,
        chunks: apiComment.text ? TextChunk.fromServerText(apiComment.text) : [],
        attaches: fromApiWallReplyAttach(apiComment.attachments || []),
        likes: {
            count: apiComment.reactions?.count || apiComment.likes?.count || 0,
            reactionId: Boolean(apiComment.reactions?.user_reaction)
                ? Reaction.resolveId(apiComment.reactions?.user_reaction)
                : Boolean(apiComment.likes?.user_likes)
                    ? Reaction.resolveId(apiComment.likes?.user_likes)
                    : undefined,
            availableReactionIds: [],
            peerIds: new Set(),
        },
        peerId: Peer.resolveId(apiComment.from_id),
        replyToComment: apiComment.reply_to_comment
            ? Comment.resolveCmid(apiComment.reply_to_comment)
            : undefined,
        replyToUser: apiComment.reply_to_user
            ? Peer.resolveId(apiComment.reply_to_user)
            : undefined,
    };
}
//# sourceMappingURL=CommentConverter.js.map