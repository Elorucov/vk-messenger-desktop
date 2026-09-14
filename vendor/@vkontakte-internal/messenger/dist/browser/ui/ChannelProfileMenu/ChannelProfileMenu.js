import '../../ui/ChannelProfileMenu/ChannelProfileMenu.css';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionsMenu, ActionsMenuAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { ActionCell } from '../../ui/ActionCell/ActionCell';
import { Icon20ArchiveOutline, Icon20DoorArrowRightOutline, Icon20MessageCheckOutline, Icon20More, Icon20NotificationOutline, Icon20NotificationSlashOutline, Icon20UnarchiveOutline, Icon20AddSquareOutline, Icon20MessageOutline, Icon20DeleteOutline, Icon20PinSlashOutline, Icon20PinOutline, Icon20Users3Outline, Icon20ReportOutline, Icon20MinusSquareOutline, Icon20CommentOutline, Icon20CommentDisableOutline, Icon24CheckCircleOutline, } from '@vkontakte/icons';
import { useBrowserEnv, useDispatch, useFeatureFlags, useViewer, } from '../../hooks/misc';
import { DeleteChannelModal, LeaveChannelModal, } from '../../ui/ChannelActionModal/ChannelActionModal';
import { useModal } from '../../hooks/useModal';
import * as Channel from '../../../core/model/Channel';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useRouter } from '../../ui/Router/Router';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ReportChannelModal } from '../../ui/ReportModal/ReportModal';
const MAX_ACTIONS_TO_SHOW = 4;
const ACTION_WIDTH = 108;
const ACTION_GAP = 4;
export const ChannelProfileMenu = ({ channel, className, onPinChannel, }) => {
    const { lang, vkDomain, vkcom_me } = useBrowserEnv();
    const dispatch = useDispatch();
    const deleteChannelModal = useModal();
    const leaveChannelModal = useModal();
    const reportChannelModal = useModal();
    const { navigate, screenRoute } = useRouter();
    const featureFlags = useFeatureFlags();
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const snackbar = useSnackbar();
    const isUserBannedPermanently = channel.banInfo?.endDate === 0;
    const handleChannelActionClick = (userAction) => {
        switch (userAction) {
            case 'archive':
            case 'unarchive':
                dispatch({
                    type: 'UserChangedChannel',
                    channelId: channel.id,
                    userAction,
                    onComplete: () => {
                        snackbar({
                            message: userAction === 'archive'
                                ? lang.use('me_channel_moved_in_archive')
                                : lang.use('me_channel_returned_from_archive'),
                            before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
                            action: lang.use('me_cancel'),
                            onActionClick: () => {
                                dispatch({
                                    type: 'UserChangedChannel',
                                    channelId: channel.id,
                                    userAction: userAction === 'archive' ? 'unarchive' : 'archive',
                                });
                            },
                        });
                    },
                });
                break;
            case 'join':
                const source = (screenRoute.kind === 'ChannelRoute' && screenRoute.entrypoint) ||
                    'channel';
                const trackCode = screenRoute.kind === 'ChannelRoute'
                    ? screenRoute.searchTrackCode
                    : undefined;
                dispatch({
                    type: 'UserChangedChannel',
                    channelId: channel.id,
                    userAction: Channel.isInboundRequest(channel)
                        ? 'join_inbound_request'
                        : 'join',
                    source,
                    trackCode,
                });
                break;
            case 'mark_read':
            case 'unpin':
                dispatch({
                    type: 'UserChangedChannel',
                    channelId: channel.id,
                    userAction,
                });
                break;
            case 'mute':
            case 'unmute':
                dispatch({
                    type: 'UserChangedChannel',
                    channelId: channel.id,
                    userAction,
                });
                break;
            case 'delete':
                deleteChannelModal.open();
                break;
            case 'open_convo':
                navigate({
                    kind: 'ConvoRoute',
                    peerId: isCommunityChannel
                        ? Peer.resolveId(channel.parentId)
                        : Peer.resolveId(channel.id),
                    entrypoint: 'profile_page',
                });
                break;
            case 'pin':
                onPinChannel(channel.id);
                break;
            case 'open_group':
                const screenName = Channel.getCommunityChannelParentScreenName(channel);
                if (screenName) {
                    navigate({
                        kind: 'ScreenNameProxyRoute',
                        screenName,
                    });
                }
                break;
            case 'leave':
                if (channel.memberStatus === 4) {
                    dispatch({
                        type: 'UserChangedChannel',
                        userAction: 'leave',
                        channelId: channel.id,
                    });
                }
                else {
                    leaveChannelModal.open();
                }
                break;
            case 'report':
                reportChannelModal.open();
                break;
            case 'comments_settings':
                snackbar({
                    message: lang.use('me_channel_comments_snackbar_text'),
                    action: lang.use('me_channel_comments_snackbar_action'),
                    onActionClick: () => {
                        const screenName = Channel.getCommunityChannelParentScreenName(channel);
                        if (screenName) {
                            window.open(`https://${vkDomain}/${screenName}?act=activity`, '_blank');
                        }
                    },
                });
                break;
            case 'join_inbound_request':
            case 'leave_inbound_request':
            case 'restore_inbound_request':
                break;
            default:
                exhaustivenessCheck(userAction);
        }
    };
    const [width, setWidth] = useState(0);
    const maxActionsToShow = Math.min(Math.floor(width / (ACTION_WIDTH + ACTION_GAP)), MAX_ACTIONS_TO_SHOW);
    const actions = [];
    const isCommunityChannel = Channel.isCommunityChannel(channel);
    const withReportAction = isCommunityChannel && channel.adminLevel < 1 /* Peer.GroupAdminLevel.Moderator */;
    const showChannelProfileCommentsSettings = Channel.canAdmin(channel);
    const canDeleteChannel = isCommunityChannel
        ? channel.adminLevel >= 3 /* Peer.GroupAdminLevel.Admin */
        : channel.isOwner;
    const isDeleteButtonEnable = vkcom_me?.communitySettingsChannelDeleteButton;
    const withDeleteAction = canDeleteChannel && !isDeleteButtonEnable;
    const canLeaveChannel = isCommunityChannel
        ? channel.isMember && !channel.isOwner
        : channel.isMember;
    if (isCommunityChannel) {
        actions.push({
            key: 'open_group',
            icon: React.createElement(Icon20Users3Outline, null),
            text: lang.use('me_channels_profile_open_group'),
        });
    }
    if (channel.canMessage && featureFlags.vkm_channel_can_message) {
        actions.push({
            key: 'open_convo',
            icon: React.createElement(Icon20MessageOutline, null),
            text: lang.use('me_convo_profile_open_convo_new'),
        });
    }
    if (channel.isMember && !channel.isArchived) {
        actions.push({
            key: channel.isMuted ? 'unmute' : 'mute',
            text: lang.use('me_channels_profile_notifications'),
            icon: channel.isMuted ? (React.createElement(Icon20NotificationSlashOutline, null)) : (React.createElement(Icon20NotificationOutline, null)),
        });
    }
    if (channel.isMember &&
        !channel.isArchived &&
        Channel.isPinned(channel) &&
        featureFlags.vkm_pinned_channels) {
        const isShortenedTitle = actions.length + 1 < maxActionsToShow;
        actions.push({
            key: 'unpin',
            text: isShortenedTitle
                ? lang.use('me_channel_community_action_unpin_shortened')
                : !isEdu && featureFlags.vkm_channel_name_to_community
                    ? lang.use('me_channel_community_action_unpin')
                    : lang.use('me_channel_action_unpin'),
            icon: React.createElement(Icon20PinSlashOutline, null),
        });
    }
    if (channel.isMember &&
        !channel.isArchived &&
        !Channel.isPinned(channel) &&
        featureFlags.vkm_pinned_channels) {
        const isShortenedTitle = actions.length + 1 < maxActionsToShow;
        actions.push({
            key: 'pin',
            text: isShortenedTitle
                ? lang.use('me_channel_community_action_pin_shortened')
                : !isEdu && featureFlags.vkm_channel_name_to_community
                    ? lang.use('me_channel_community_action_pin')
                    : lang.use('me_channel_action_pin'),
            icon: React.createElement(Icon20PinOutline, null),
        });
    }
    if (channel.isMember && !channel.isArchived) {
        actions.push({
            key: 'archive',
            text: lang.use('me_channel_action_archive'),
            icon: React.createElement(Icon20ArchiveOutline, null),
        });
    }
    if (channel.isMember && channel.isArchived) {
        actions.push({
            key: 'unarchive',
            text: lang.use('me_channel_action_unarchive'),
            icon: React.createElement(Icon20UnarchiveOutline, null),
        });
    }
    if (showChannelProfileCommentsSettings) {
        actions.push({
            key: 'comments_settings',
            text: lang.use('me_convo_profile_comments_settings'),
            icon: Channel.isCommentsRestricted(channel) ? (React.createElement(Icon20CommentOutline, null)) : (React.createElement(Icon20CommentDisableOutline, null)),
        });
    }
    // Подписаться можно если не подписан на канал, но являешься членом СОО или это открытое СОО
    const hasChannelJoinAction = !channel.isMember &&
        (channel.isParentGroupMember || !Channel.isClosed(channel));
    if (hasChannelJoinAction) {
        actions.push({
            key: 'join',
            text: lang.use(isCommunityChannel
                ? 'me_community_channel_action_join'
                : 'me_channel_action_join'),
            icon: React.createElement(Icon20AddSquareOutline, null),
        });
    }
    // Подать заявку можно в закрытый (не частный канал), членом которого пользователь еще не является
    const hasSendRequestAction = Channel.isClosed(channel) &&
        !Channel.isPrivate(channel) &&
        channel.memberStatus === 0 &&
        isCommunityChannel;
    if (hasSendRequestAction) {
        actions.push({
            key: 'join',
            text: lang.use('me_channel_closed_button'),
            icon: React.createElement(Icon20AddSquareOutline, null),
        });
    }
    if (Channel.isClosed(channel) &&
        channel.memberStatus === 4 &&
        isCommunityChannel) {
        actions.push({
            key: 'leave',
            text: lang.use('me_channel_return_request'),
            icon: React.createElement(Icon20MinusSquareOutline, null),
        });
    }
    if (channel.isMember && Channel.isUnread(channel)) {
        actions.push({
            key: 'mark_read',
            text: lang.use('me_convo_action_mark_read'),
            icon: React.createElement(Icon20MessageCheckOutline, null),
        });
    }
    if (withReportAction) {
        actions.push({
            key: 'report',
            text: lang.use('me_report_channel_label'),
            icon: React.createElement(Icon20ReportOutline, null),
            isDanger: true,
            withSeparator: true,
        });
    }
    if (canLeaveChannel) {
        const isShortenedTitle = actions.length + 1 < maxActionsToShow;
        actions.push({
            key: 'leave',
            text: !isEdu && featureFlags.vkm_channel_name_to_community
                ? isShortenedTitle
                    ? lang.use('me_channel_community_action_leave_shortened')
                    : lang.use('me_channel_community_action_leave')
                : isShortenedTitle
                    ? lang.use('me_channel_action_leave_shortened')
                    : lang.use('me_channel_action_leave'),
            icon: React.createElement(Icon20DoorArrowRightOutline, null),
            isDanger: true,
            // Добавляем разделитель только если нету предыдущего экшена report
            withSeparator: !withReportAction,
        });
    }
    if (withDeleteAction) {
        actions.push({
            key: 'delete',
            text: lang.use('me_channel_action_delete'),
            icon: React.createElement(Icon20DeleteOutline, null),
            isDanger: true,
            withSeparator: true,
        });
    }
    const $container = useRef(null);
    const needMoreActions = actions.length > maxActionsToShow;
    const handleModalClose = (modal) => {
        if (modal.isActive) {
            modal.close();
        }
    };
    useLayoutEffect(() => {
        if ($container.current) {
            setWidth($container.current.offsetWidth);
        }
    }, []);
    if (isUserBannedPermanently) {
        return null;
    }
    return (React.createElement("div", { className: className, ref: $container },
        React.createElement("div", { className: "ChannelProfileMenu__actions" },
            actions
                .slice(0, needMoreActions ? maxActionsToShow - 1 : maxActionsToShow)
                .map(({ key, icon, text }) => {
                return (React.createElement(ActionCell, { key: key, icon: icon, className: "ChannelProfileMenu__action", onClick: () => handleChannelActionClick(key) }, text));
            }),
            needMoreActions && (React.createElement(Dropdown, { adaptive: true, openType: "click", hideOnClick: true, content: React.createElement(ActionsMenu, null, actions
                    .slice(maxActionsToShow - 1)
                    .map(({ key, icon, text, withSeparator, isDanger }, i) => (React.createElement("div", { className: "ChannelProfileMenu__actionItemWrapper", key: key },
                    withSeparator && i > 0 && React.createElement(ActionsMenuSeparator, null),
                    React.createElement(ActionsMenuAction, { leftIcon: icon, title: text, onClick: () => handleChannelActionClick(key), type: isDanger ? 'danger' : 'secondary' }))))), align: "right", position: "bottom", classNames: {
                    contentWrapper: 'ChannelProfileMenu__menuContent',
                } },
                React.createElement(ActionCell, { icon: React.createElement(Icon20More, null), className: "ChannelProfileMenu__action" }, lang.use('me_convo_profile_actions_more'))))),
        leaveChannelModal.isActive && (React.createElement(LeaveChannelModal, { isCommunityChannel: isCommunityChannel, channel: channel, onModalClose: () => handleModalClose(leaveChannelModal) })),
        deleteChannelModal.isActive && (React.createElement(DeleteChannelModal, { isCommunityChannel: isCommunityChannel, channel: channel, onModalClose: () => handleModalClose(deleteChannelModal) })),
        reportChannelModal.isActive && (React.createElement(ReportChannelModal, { channel: channel, onClose: () => handleModalClose(reportChannelModal) }))));
};
//# sourceMappingURL=ChannelProfileMenu.js.map