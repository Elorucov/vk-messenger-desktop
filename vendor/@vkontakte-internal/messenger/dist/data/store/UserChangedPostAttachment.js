import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import { fromApiPost } from '../converter/PostConverter';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserChangedPostAttachment': {
            const { channelId, cmid } = action;
            return [
                async function requestPost({ api }) {
                    try {
                        const response = await api.fetch('channels.getMessagesById', {
                            channel_id: channelId,
                            cmids: cmid.toString(),
                            extended: 1,
                        }, { retries: 3 });
                        const apiPost = response.items?.[0];
                        if (!apiPost) {
                            return {
                                type: 'UserChangedPostAttachment_RequestCompleted',
                                hasFailed: true,
                            };
                        }
                        return {
                            type: 'UserChangedPostAttachment_RequestCompleted',
                            hasFailed: false,
                            channelId,
                            apiPost,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedPostAttachment_RequestCompleted',
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'UserChangedPostAttachment_RequestCompleted': {
            if (action.hasFailed) {
                return [];
            }
            const { apiPost, channelId } = action;
            const channel = draft.channels.get(channelId);
            if (!channel) {
                return [];
            }
            if (channel.kind === 'ChannelRestricted') {
                return [];
            }
            const { post: newPost, reactions } = fromApiPost(apiPost);
            const prevPostNode = Channel.findPostByCmid(channel, newPost.cmid);
            const post = Post.merge(newPost, prevPostNode?.kind === 'Node' ? prevPostNode.item : undefined);
            for (const reaction of reactions) {
                draft.reactionsOld.set(reaction.id, reaction);
            }
            Channel.replacePost(channel, post);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserChangedPostAttachment.js.map