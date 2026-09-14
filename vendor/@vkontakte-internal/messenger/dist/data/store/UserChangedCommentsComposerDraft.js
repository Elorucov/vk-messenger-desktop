import { addCommaAndSpace } from '../utils/formatData/common';
import * as CommentsComposerDraft from '../../core/model/CommentsComposerDraft';
import * as Peer from '../../core/model/Peer';
import * as TextChunk from '../../core/model/TextChunk';
import * as Comment from '../../core/model/Comment';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { current } from 'immer';
import { applyAttachmentActions, } from '../store/UserChangedComposerDraft';
export const handler = (draft, action, featureFlags) => {
    const { channelId, postCmid } = action;
    const draftKey = `${channelId}-${postCmid}`;
    const oldDraft = draft.commentsComposerDrafts[draftKey] ??
        CommentsComposerDraft.empty();
    let newDraft = CommentsComposerDraft.empty();
    const { vkm_channel_comments_reply } = featureFlags;
    switch (action.type) {
        case 'UserChangedCommentsComposerDraft': {
            switch (action.kind) {
                case 'text': {
                    const { text } = action;
                    newDraft = {
                        ...oldDraft,
                        text: text ?? oldDraft.text,
                    };
                    break;
                }
                case 'editing': {
                    const { editing } = action;
                    newDraft = {
                        editing,
                        text: Comment.toRawText(editing),
                        attaches: editing.attaches,
                        uploadsTrackIds: oldDraft.uploadsTrackIds,
                        reply: undefined,
                    };
                    break;
                }
                case 'reply': {
                    const { reply } = action;
                    if (vkm_channel_comments_reply) {
                        const peer = reply?.peerId
                            ? Peer.safeGet(draft.peers, reply.peerId)
                            : undefined;
                        const chunks = TextChunk.fromClientText(oldDraft.text);
                        if (peer) {
                            const newMentionChunk = {
                                kind: 'Mention',
                                type: Peer.isGroupPeerId(peer.id) ? 'club' : 'id',
                                peerId: peer.id,
                                displayName: Peer.firstName(peer),
                            };
                            if (chunks.at(0)?.kind === 'Mention') {
                                chunks[0] = newMentionChunk;
                            }
                            else {
                                chunks.unshift(newMentionChunk);
                            }
                            if (chunks[1]?.kind === 'Text') {
                                chunks[1] = {
                                    ...chunks[1],
                                    text: addCommaAndSpace(chunks[1].text, true),
                                };
                            }
                            if (chunks.length === 1) {
                                chunks.push({
                                    kind: 'Text',
                                    text: ', ',
                                });
                            }
                        }
                        const text = TextChunk.toRawText(chunks);
                        newDraft = {
                            ...(reply && oldDraft.editing
                                ? CommentsComposerDraft.empty()
                                : oldDraft),
                            text,
                            reply,
                        };
                    }
                    else {
                        newDraft = {
                            ...(reply && oldDraft.editing
                                ? CommentsComposerDraft.empty()
                                : oldDraft),
                            reply,
                        };
                    }
                    break;
                }
                case 'addAttaches':
                case 'removeAttach':
                case 'removeVoice':
                case 'startUploading':
                case 'removeUploads':
                case 'rearrangeAttaches':
                    const change = applyAttachmentActions(oldDraft, action);
                    newDraft = {
                        ...oldDraft,
                        ...change,
                    };
                    break;
                default:
                    exhaustivenessCheck(action);
            }
            break;
        }
        /**
         * Ничего не делаем, так как выше newDraft задается как CommentsComposerDraft.empty,
         * следовательно будет удален
         */
        case 'UserClearedCommentsComposerDraft': {
            break;
        }
        default:
            exhaustivenessCheck(action);
    }
    const isNewDraftEmpty = !newDraft.text &&
        !newDraft.reply &&
        !newDraft.editing &&
        newDraft.uploadsTrackIds.size === 0 &&
        Object.keys(newDraft.attaches).length === 0;
    if (isNewDraftEmpty) {
        delete draft.commentsComposerDrafts[draftKey];
    }
    else {
        draft.commentsComposerDrafts[draftKey] = newDraft;
    }
    const undraftedComposerDrafts = current(draft.commentsComposerDrafts);
    return [
        async ({ storage }) => {
            storage.set('comments-drafts', undraftedComposerDrafts);
            return {
                type: 'Noop',
            };
        },
    ];
};
//# sourceMappingURL=UserChangedCommentsComposerDraft.js.map