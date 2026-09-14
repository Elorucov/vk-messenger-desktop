import React from 'react';
import './ChannelsOnboardingListItem.css';
import { ChannelAvatar } from '../../ui/ChannelAvatar/ChannelAvatar';
import cx from 'classnames';
import { ChannelTitle } from '../../ui/ChannelTitle/ChannelTitle';
import { Icon24CheckCircleOn } from '@vkontakte/icons';
export const ChannelsOnboardingListItem = ({ channel, isActive, className, onClick, }) => {
    if (!channel) {
        return null;
    }
    return (React.createElement("div", { className: cx('ChannelsOnboardingListItem', className, {
            'ChannelsOnboardingListItem--active': isActive,
        }), onClick: () => onClick(channel.id) },
        React.createElement("div", { className: "ChannelsOnboardingListItem__avatar" },
            React.createElement(ChannelAvatar, { photo: channel.photo, name: channel.name, size: 48 })),
        React.createElement("header", { className: "ChannelsOnboardingListItem__header" },
            React.createElement(ChannelTitle, { className: "ChannelsOnboardingListItem__title", channel: channel })),
        React.createElement("div", { className: "ChannelsOnboardingListItem__activity" }, channel.activity),
        React.createElement("div", { className: "ChannelsOnboardingListItem__action" },
            React.createElement(Icon24CheckCircleOn, { className: "ChannelsOnboardingListItem__actionIcon" }))));
};
//# sourceMappingURL=ChannelsOnboardingListItem.js.map