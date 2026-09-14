import React, { useCallback } from 'react';
import * as Channel from '../../../core/model/Channel';
import './ChannelTitle.css';
import cx from 'classnames';
import { Icon16Muted, Icon16Verified } from '@vkontakte/icons';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import { AdultBadge } from '../../ui/AdultBadge/AdultBadge';
export const ChannelTitle = ({ channel, className, hideMutedIcon, hideAdultBadge, onAdultBadgeClick, }) => {
    const { lang } = useBrowserEnv();
    const { vkm_channel_moderation_content } = useFeatureFlags();
    const channelName = Channel.isCommunityChannel(channel) &&
        Channel.isPrivate(channel) &&
        !channel.isParentGroupMember
        ? lang.use('me_community_channel_private_title')
        : channel.name;
    const handleAdultBadgeClick = useCallback((e) => {
        e?.stopPropagation();
        onAdultBadgeClick?.(channel.ageLimits);
    }, [onAdultBadgeClick, channel.ageLimits]);
    const showAdultBadge = vkm_channel_moderation_content &&
        !hideAdultBadge &&
        channel.ageLimits &&
        channel.ageLimits !== 1;
    return (React.createElement("div", { className: cx('ChannelTitle', className) },
        React.createElement("h3", { className: "ChannelTitle__title", title: channelName }, channelName),
        channel.isVerified && (React.createElement("div", { className: "ChannelTitle__icon ChannelTitle__icon--verified" },
            React.createElement(Icon16Verified, null))),
        showAdultBadge && (React.createElement(AdultBadge, { ageLimits: channel.ageLimits, onClick: handleAdultBadgeClick })),
        !hideMutedIcon && channel.isMuted && !channel.isArchived && (React.createElement("span", { className: "ChannelTitle__icon ChannelTitle__icon--muted" },
            React.createElement(Icon16Muted, null)))));
};
//# sourceMappingURL=ChannelTitle.js.map