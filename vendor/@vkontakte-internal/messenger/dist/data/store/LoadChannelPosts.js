import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import { fromApiPost } from '../converter/PostConverter';
export const handler = (draft, action) => {
    const { channelId, postCmids, onComplete } = action;
    const lockedPostCmids = draft.locks.loadChannelPosts.get(channelId) ??
        draft.locks.loadChannelPosts.set(channelId, new Set()).get(channelId);
    // Невозможный сценарий
    if (!lockedPostCmids) {
        return [];
    }
    switch (action.type) {
        case 'LoadChannelPosts': {
            const postCmidsToLoad = postCmids.filter((cmid) => !lockedPostCmids.has(cmid));
            if (!postCmidsToLoad.length) {
                return [];
            }
            postCmidsToLoad.forEach((cmid) => lockedPostCmids.add(cmid));
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('channels.getMessagesById', {
                            channel_id: channelId,
                            cmids: Array.from(postCmidsToLoad).join(','),
                            extended: 1,
                        }, {
                            retries: Infinity,
                        });
                        return {
                            type: 'LoadChannelPosts_RequestCompleted',
                            response,
                            channelId,
                            postCmids: postCmidsToLoad,
                            onComplete,
                        };
                    }
                    catch {
                        return {
                            type: 'LoadChannelPosts_RequestCompleted',
                            response: null,
                            channelId,
                            postCmids: postCmidsToLoad,
                            onComplete,
                        };
                    }
                },
            ];
        }
        case 'LoadChannelPosts_RequestCompleted': {
            postCmids.forEach((cmid) => lockedPostCmids.delete(cmid));
            if (!action.response?.items) {
                return [];
            }
            const channel = draft.channels.get(channelId);
            if (!channel) {
                return [];
            }
            if (channel.kind === 'ChannelRestricted') {
                return [];
            }
            onComplete?.();
            for (const apiPost of action.response.items) {
                const { post: newPost, reactions } = fromApiPost(apiPost);
                const prevPostNode = Channel.findPostByCmid(channel, newPost.cmid);
                const post = Post.merge(newPost, prevPostNode?.kind === 'Node' ? prevPostNode.item : undefined);
                for (const reaction of reactions) {
                    draft.reactionsOld.set(reaction.id, reaction);
                }
                Channel.replacePost(channel, post);
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=LoadChannelPosts.js.map