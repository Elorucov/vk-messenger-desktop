import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'ChannelsMarkPostAsFake': {
            const { channelId, cmid, isFakeNews } = action;
            const channel = draft.channels.get(channelId);
            if (!channel) {
                return [];
            }
            /**
             * Невозможный кейс (кто-то кликнул на пост в канале, у которого нет истории постов)
             */
            if (channel.kind === 'ChannelRestricted') {
                return [];
            }
            const post = Channel.findPostByCmid(channel, cmid);
            if (!post || post.kind === 'DeletedNode') {
                return [];
            }
            Post.updateFakeNewsProperty(post.item, isFakeNews);
            return [];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=ChannelsMarkPostAsFake.js.map