import * as Channel from '../../core/model/Channel';
import * as Chain from '../../core/model/Chain';
import * as Organisers from '../../core/model/Organisers';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { fromApiPost, fromApiPostonedPost } from '../converter/PostConverter';
import * as UserChangedComposerDraft from './UserChangedComposerDraft';
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'UserHitPostponedPostPublish': {
            const { channelId, cmid } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            Chain.removeElement(channel.postponed.history, cmid);
            const { post } = fromApiPost(action.response);
            Channel.appendPost(channel, post);
            Organisers.refreshChannels(draft.organisers, channel);
            return [];
        }
        case 'UserHitPostponedPostSend': {
            const { channelId } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            if (!action.response) {
                return [];
            }
            const { post } = fromApiPostonedPost(action.response);
            Channel.insertPostponedPosts(channel, [{ id: post.cmid, content: post }]);
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
//# sourceMappingURL=UserHitPostponedPostSend.js.map