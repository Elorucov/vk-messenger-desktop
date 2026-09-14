import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Channel from '../../core/model/Channel';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'ChannelMediaViewerCacheRemoved': {
            const channel = draft.channels.get(action.channel.id);
            if (!channel || channel.kind === 'ChannelRestricted')
                return [];
            Channel.clearMediaViewerCache(channel);
            return [];
        }
        case 'ChannelMediaViewerCacheInserted': {
            const channel = draft.channels.get(action.channelId);
            if (!channel || channel.kind === 'ChannelRestricted')
                return [];
            channel.mediaViewerCache = {
                ...channel.mediaViewerCache,
                ...action.data,
            };
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=ChannelMediaViewerCache.js.map