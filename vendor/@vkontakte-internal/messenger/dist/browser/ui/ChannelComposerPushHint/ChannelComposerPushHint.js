import { Avatar, Separator } from '@vkontakte-internal/vkcom-kit';
import { Icon20NotificationWaves } from '@vkontakte/icons';
import * as Channel from '../../../core/model/Channel';
import '../../ui/ChannelComposerPushHint/ChannelComposerPushHint.css';
import React from 'react';
import { useBrowserEnv, useChannel } from '../../hooks/misc';
export const ChannelComposerPushHint = ({ channelId, }) => {
    const channel = useChannel(channelId);
    const { lang } = useBrowserEnv();
    if (!channel || channel.kind === 'ChannelRestricted') {
        return null;
    }
    /**
     * Первый пост в каналы пишется значит покажем плашку про пуш всем подписчикам соо
     */
    const isNewChannel = !channel.isActive && Channel.isEmpty(channel);
    if (!isNewChannel) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "ChannelComposerPushHint" },
            React.createElement(Avatar, { size: 28 },
                React.createElement(Icon20NotificationWaves, { color: "var(--vkui--color_icon_accent)" })),
            React.createElement("div", { className: "ChannelComposerPushHint__text" }, lang.use('me_channel_first_post_push_hint'))),
        React.createElement(Separator, { wide: true })));
};
//# sourceMappingURL=ChannelComposerPushHint.js.map