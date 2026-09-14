import React from 'react';
import { RichCell, ButtonGroup, Button } from '@vkontakte-internal/vkcom-kit';
import * as Channel from '../../../core/model/Channel';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { ChannelAvatar } from '../../ui/ChannelAvatar/ChannelAvatar';
import { ChannelTitle } from '../../ui/ChannelTitle/ChannelTitle';
import { Icon16New, Icon24CheckCircleOutline, Icon28HideOutline, } from '@vkontakte/icons';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useRouter } from '../../ui/Router/Router';
import { ChannelListItemText } from '../../ui/ChannelsListItem/ChannelsListItem';
const PromotedChannelCell = ({ channel, onClick, isActive, actions, after, withTime, }) => {
    const lastPost = Channel.lastPost({
        channel,
        withPending: false,
    });
    return (React.createElement(RichCell, { activated: isActive, Component: "article", role: "article", onClick: onClick, before: React.createElement(ChannelAvatar, { photo: channel.photo, name: channel.name, size: 48 }), subtitle: React.createElement(ChannelListItemText, { withTime: withTime, lastPost: lastPost }), actions: actions, after: after },
        React.createElement(ChannelTitle, { channel: channel, hideMutedIcon: true })));
};
export const ChannelsListInboundRequest = ({ channel, onClick, isActive }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const { navigate } = useRouter();
    const createActionClickHandler = (userAction) => (event) => {
        event.stopPropagation();
        switch (userAction) {
            case 'leave_inbound_request': {
                dispatch({
                    type: 'UserChangedChannel',
                    channelId: channel.id,
                    userAction,
                    onComplete: () => {
                        snackbar({
                            mode: 'dark',
                            message: lang.use('me_you_skipped_channel', {
                                values: { name: channel.name },
                            }),
                            before: (React.createElement(Icon28HideOutline, { fill: "var(--vkui--color_text_contrast)" })),
                            action: lang.use('me_cancel'),
                            onActionClick: () => {
                                dispatch({
                                    type: 'UserChangedChannel',
                                    channelId: channel.id,
                                    userAction: 'restore_inbound_request',
                                });
                            },
                        });
                    },
                });
                return;
            }
            case 'join_inbound_request': {
                dispatch({
                    type: 'UserChangedChannel',
                    channelId: channel.id,
                    userAction,
                    source: 'suggest',
                    onComplete: () => {
                        snackbar({
                            mode: 'dark',
                            message: lang.use('me_you_subscribed', {
                                values: { name: channel.name },
                            }),
                            before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
                            action: lang.use('me_go_to_channel'),
                            onActionClick: () => {
                                navigate({
                                    kind: 'ChannelRoute',
                                    channelId: channel.id,
                                });
                            },
                        });
                    },
                });
                return;
            }
            default:
                exhaustivenessCheck(userAction);
        }
    };
    return (React.createElement(PromotedChannelCell, { channel: channel, isActive: isActive, onClick: onClick, withTime: false, after: !!channel.unreadCount && (React.createElement(Icon16New, { fill: "var(--vkui--color_icon_accent)" })), actions: React.createElement(ButtonGroup, { mode: "horizontal", gap: "s", stretched: true },
            React.createElement(Button, { appearance: "accent", mode: "primary", size: "s", onClick: createActionClickHandler('join_inbound_request') }, lang.use('me_channels_inbound_request_action_join')),
            React.createElement(Button, { appearance: "accent", mode: "secondary", size: "s", onClick: createActionClickHandler('leave_inbound_request') }, lang.use('me_channels_inbound_request_action_leave'))) }));
};
export const ChannelsListRecommendedChannel = ({ channel, onClick, isActive, joinSource }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const { navigate } = useRouter();
    const handleJoinRecommendedChannel = (event) => {
        event.stopPropagation();
        dispatch({
            type: 'UserChangedChannel',
            channelId: channel.id,
            userAction: 'join',
            source: joinSource,
            onComplete: () => {
                snackbar({
                    mode: 'dark',
                    message: lang.use('me_you_subscribed', {
                        values: { name: channel.name },
                    }),
                    before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
                    action: lang.use('me_go_to_channel'),
                    onActionClick: () => {
                        navigate({
                            kind: 'ChannelRoute',
                            channelId: channel.id,
                        });
                    },
                });
            },
        });
    };
    return (React.createElement(PromotedChannelCell, { channel: channel, isActive: isActive, onClick: onClick, withTime: false, actions: React.createElement(ButtonGroup, { mode: "horizontal", gap: "s", stretched: true },
            React.createElement(Button, { appearance: "accent", mode: "primary", size: "s", onClick: handleJoinRecommendedChannel }, lang.use('me_channels_inbound_request_action_join'))) }));
};
//# sourceMappingURL=ChannelsListInboundRequest.js.map