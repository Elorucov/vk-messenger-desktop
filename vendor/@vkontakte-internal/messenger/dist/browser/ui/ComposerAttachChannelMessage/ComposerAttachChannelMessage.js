import { Icon20ChannelsOutline, Icon24ChannelsOutline, } from '@vkontakte-internal/icons-private';
import { useBrowserEnv, useChannel } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import React from 'react';
export const ComposerAttachChannelMessage = ({ channelId, isCompactView }) => {
    const { lang } = useBrowserEnv();
    const channel = useChannel(channelId, false);
    const channelName = channel && channel.kind !== 'ChannelRestricted' ? channel.name : undefined;
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20ChannelsOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24ChannelsOutline, null) })), main: lang.use('me_attaches_wall'), secondary: channelName }));
};
//# sourceMappingURL=ComposerAttachChannelMessage.js.map