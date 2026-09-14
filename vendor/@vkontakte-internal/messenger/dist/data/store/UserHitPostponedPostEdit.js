import * as Channel from '../../core/model/Channel';
import * as Chain from '../../core/model/Chain';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { fromApiPostonedPost } from '../converter/PostConverter';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserHitPostponedPostEditTime': {
            const { channelId, cmid } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            if (!action.response) {
                return [];
            }
            const { post } = fromApiPostonedPost(action.response);
            Chain.removeElement(channel.postponed.history, cmid);
            Channel.insertPostponedPosts(channel, [{ id: post.cmid, content: post }]);
            return [];
        }
        case 'UserHitPostponedPostEdit': {
            const { channelId } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            if (!action.response) {
                return [];
            }
            const { post: newPost } = fromApiPostonedPost(action.response);
            const element = Chain.getElementById(channel.postponed.history, newPost.cmid);
            if (!element) {
                return [];
            }
            element.content = newPost;
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserHitPostponedPostEdit.js.map