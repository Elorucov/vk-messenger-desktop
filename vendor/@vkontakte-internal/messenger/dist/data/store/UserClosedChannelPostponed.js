import * as Channel from '../../core/model/Channel';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserClosedChannelPostponed': {
            const { channelId } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            Channel.resetPostponed(channel);
            return [];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=UserClosedChannelPostponed.js.map