import * as Channel from '../../core/model/Channel';
import * as Attach from '../../core/model/Attach';
import * as Post from '../../core/model/Post';
import * as UserChangedComposerDraft from './UserChangedComposerDraft';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { fromApiPost } from '../converter/PostConverter';
const DAY_IN_SEC = 60 * 60 * 24;
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'UserHitPostEdit': {
            const { cmid, text, attaches, channelId, isCommunityChannel, options, visibility, donutDelay, onComplete, publishAt, onFail, } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            const attachments = Attach.ids(attaches).join(',');
            if (!text && !attachments) {
                return [];
            }
            const node = Channel.findPostByCmid(channel, cmid);
            if (!node || node.kind === 'DeletedNode') {
                return [];
            }
            draft.locks.editPost.add(channelId);
            return [
                async function ({ api }) {
                    try {
                        onComplete();
                        const response = await api.fetch('channels.editMessage', {
                            channel_id: channelId,
                            cmid,
                            message: text,
                            attachments,
                            publish_date: isCommunityChannel
                                ? undefined
                                : publishAt && Math.floor(publishAt / 1000),
                            close_comments: convertBoolOption(!options.has('enable_comments')),
                            signed: convertBoolOption(options.has('signed')),
                            donut_paid_duration: visibility === 'all'
                                ? undefined
                                : donutDelay === -1
                                    ? donutDelay
                                    : donutDelay * DAY_IN_SEC,
                        });
                        return {
                            type: 'UserHitPostEdit_RequestCompleted',
                            hasFailed: false,
                            channelId,
                            response,
                        };
                    }
                    catch (err) {
                        onFail(err);
                        return {
                            type: 'UserHitPostEdit_RequestCompleted',
                            hasFailed: true,
                            channelId,
                        };
                    }
                },
            ];
        }
        case 'UserHitPostEdit_RequestCompleted': {
            const { hasFailed, channelId } = action;
            draft.locks.editPost.delete(channelId);
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted' || hasFailed) {
                return [];
            }
            const { post: newPost, reactions } = fromApiPost(action.response);
            const prevPostNode = Channel.findPostByCmid(channel, newPost.cmid);
            const post = Post.merge(newPost, prevPostNode?.kind === 'Node' ? prevPostNode.item : undefined);
            for (const reaction of reactions) {
                draft.reactionsOld.set(reaction.id, reaction);
            }
            Channel.replacePost(channel, post);
            UserChangedComposerDraft.handler(draft, {
                type: 'ComposerDraftsUpdateNeeded',
                foreignKind: "post" /* ComposerDraft.ForwardKind.Post */,
                itemsToReplace: [post],
            }, featureFlags, envFeatureFlags);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
const convertBoolOption = (value) => value !== undefined ? Number(value) && 1 : value;
//# sourceMappingURL=UserHitPostEdit.js.map