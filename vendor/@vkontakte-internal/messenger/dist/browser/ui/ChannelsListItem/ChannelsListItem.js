import React, { useRef } from 'react';
import './ChannelsListItem.css';
import * as Channel from '../../../core/model/Channel';
import * as Viewer from '../../../core/model/Viewer';
import { useBrowserEnv, useDispatch, useViewer, useCombinedRefs, useFeatureFlags, } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { ChannelAvatar } from '../../ui/ChannelAvatar/ChannelAvatar';
import cx from 'classnames';
import { ChannelTitle } from '../../ui/ChannelTitle/ChannelTitle';
import { ChannelPostPreview } from '../../ui/ChannelPostPreview/ChannelPostPreview';
import { UnreadCounter } from '../../ui/UnreadCounter/UnreadCounter';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Icon16MoreHorizontal, Icon16MoreVertical, Icon16Pin, Icon20ArchiveOutline, Icon20DeleteOutline, Icon20DoorArrowRightOutline, Icon20DoorEnterArrowRightOutline, Icon20MessageCheckOutline, Icon20NotificationOutline, Icon20NotificationSlashOutline, Icon20UnarchiveOutline, Icon20PinOutline, Icon20PinSlashOutline, Icon20ReportOutline, Icon24CheckCircleOutline, } from '@vkontakte/icons';
import { useRouter } from '../../ui/Router/Router';
import { ActionsMenu, ActionsMenuAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { useModal } from '../../hooks/useModal';
import { DeleteChannelModal, LeaveChannelModal, } from '../../ui/ChannelActionModal/ChannelActionModal';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { ReportChannelModal } from '../../ui/ReportModal/ReportModal';
import { useHover } from '../../hooks/useHover';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { Time } from '../../ui/Time/Time';
import { useFormattedDate } from '../../hooks/useFormattedDate';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
export const ChannelsListItem = React.memo(function ChannelsListItem({ channel, isActive, isCollapsed, withCounter, onClick, handlePinChannel, }) {
    const { lang } = useBrowserEnv();
    const [channelsListItemRefCallback, isChannelsListItemHover] = useHover();
    const { isMobileLayout } = useLayoutData();
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const $ref = useRef(null);
    const combinedRefsCallback = useCombinedRefs($ref, channelsListItemRefCallback);
    const lastPost = Channel.lastPost({
        channel,
        withPending: true,
    });
    const deleteChannelModal = useModal();
    const leaveChannelModal = useModal();
    const reportChannelModal = useModal();
    const handleModalClose = (modal) => {
        if (modal.isActive) {
            modal.close();
        }
    };
    const isCommunityChannel = Channel.isCommunityChannel(channel);
    const onAction = (action) => {
        switch (action) {
            case 'delete':
                deleteChannelModal.open();
                break;
            case 'leave':
                leaveChannelModal.open();
                break;
            case 'report':
                reportChannelModal.open();
                break;
            default:
                break;
        }
    };
    const dropdownContent = (React.createElement(ChannelsListItemActionsMenu, { onPinChannel: handlePinChannel, isActive: isActive, channel: channel, className: fastActionsTrigger.button
            ? cx({
                ChannelsListItem__actionsMenuBottom: isMobileLayout,
                ChannelsListItem__actionsMenuRight: !isMobileLayout,
            })
            : undefined, onAction: onAction }));
    const actionHoverButton = fastActionsTrigger.button === 'hover' && (React.createElement(Dropdown, { content: dropdownContent, open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, adaptation: "vertical", align: "center", position: "right", hideOnClick: true, adaptive: true, classNames: {
            wrapper: isCollapsed ? 'ChannelsListItem__dropdownWrapper' : '',
        } },
        React.createElement("button", { className: "ChannelsListItem__action", type: "button", "aria-label": lang.use('me_actions_more'), onClickCapture: (e) => {
                e.stopPropagation();
                e.preventDefault();
            } },
            React.createElement(Icon16MoreHorizontal, null))));
    const actionTapButton = fastActionsTrigger.button === 'tap' && (React.createElement("span", { onClick: (e) => {
            e.stopPropagation();
        } },
        React.createElement(Dropdown, { content: dropdownContent, open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, adaptation: "horizontal", align: "right", position: "bottom", openType: "click", hideOnClick: true, adaptive: true },
            React.createElement("button", { className: cx('ChannelsListItem__action', 'ChannelsListItem__actionTap'), type: "button", "aria-label": lang.use('me_actions_more') },
                React.createElement(Icon16MoreVertical, null),
                React.createElement("div", { className: "ChannelsListItem__actionTapArea" })))));
    const getChannelsListItemIcon = () => {
        if (Channel.isUnread(channel) && withCounter) {
            return (React.createElement("div", { className: cx('ChannelsListItem__icon ChannelsListItem__icon--unreadCounter', {
                    'ChannelsListItem__icon--muted': channel.isMuted,
                    'ChannelsListItem__icon--hidden': isCollapsed && isChannelsListItemHover,
                }) },
                React.createElement(UnreadCounter, { size: 18, count: channel.unreadCount, isMuted: channel.isMuted })));
        }
        if (Channel.isPinned(channel)) {
            return (React.createElement(Icon16Pin, { fill: "var(--vkui--color_icon_tertiary)", "aria-hidden": false, "aria-label": lang.use('me_convo_item_pinned') }));
        }
        return null;
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("article", { ref: combinedRefsCallback, className: cx('ChannelsListItem', fastActionsTrigger.button === 'tap'
                ? 'ChannelsListItem--tap'
                : 'ChannelsListItem--click', {
                'ChannelsListItem--active': isActive,
                'ChannelsListItem--collapsed': isCollapsed,
            }), role: "button", tabIndex: 0, onClick: onClick },
            React.createElement("div", { className: "ChannelsListItem__avatar" },
                React.createElement(Tooltip, { align: "right", content: channel.name, position: "right", delay: 500, disabled: !isCollapsed },
                    React.createElement("div", null,
                        React.createElement(ChannelAvatar, { photo: channel.photo, name: channel.name, size: isCollapsed ? 40 : 48 })))),
            React.createElement("header", { className: "ChannelsListItem__header" },
                React.createElement(ChannelTitle, { channel: channel, hideAdultBadge: true }),
                actionHoverButton),
            React.createElement(ChannelListItemText, { lastPost: lastPost, withTime: true }),
            React.createElement("div", { className: "ChannelsListItem__icons" },
                getChannelsListItemIcon(),
                actionTapButton)),
        fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { ref: $ref, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, content: dropdownContent, allowNativeContextMenu: true })),
        leaveChannelModal.isActive && (React.createElement(LeaveChannelModal, { channel: channel, isCommunityChannel: isCommunityChannel, onModalClose: () => handleModalClose(leaveChannelModal) })),
        deleteChannelModal.isActive && (React.createElement(DeleteChannelModal, { channel: channel, isCommunityChannel: isCommunityChannel, onModalClose: () => handleModalClose(deleteChannelModal) })),
        reportChannelModal.isActive && (React.createElement(ReportChannelModal, { channel: channel, onClose: () => handleModalClose(reportChannelModal) }))));
});
export const ChannelsListRecommendedItem = React.memo(function ChannelsListRecommendedItem({ channel, isActive, isCollapsed, onClick, }) {
    const fastActionsTrigger = useFastActionsTrigger();
    const { lang } = useBrowserEnv();
    return (React.createElement("article", { className: cx('ChannelsListItem', fastActionsTrigger.button === 'tap'
            ? 'ChannelsListItem--tap'
            : 'ChannelsListItem--click', {
            'ChannelsListItem--active': isActive,
            'ChannelsListItem--collapsed': isCollapsed,
        }), role: "button", tabIndex: 0, onClick: onClick },
        React.createElement("div", { className: "ChannelsListItem__avatar" },
            React.createElement(Tooltip, { align: "right", content: channel.name, position: "right", delay: 500, disabled: !isCollapsed },
                React.createElement("div", null,
                    React.createElement(ChannelAvatar, { photo: channel.photo, name: channel.name, size: isCollapsed ? 40 : 48 })))),
        React.createElement("header", { className: "ChannelsListItem__header" },
            React.createElement(ChannelTitle, { channel: channel, hideMutedIcon: true })),
        React.createElement("span", { className: "ChannelsListItem__membersCount" }, lang.use('me_channel_subscribers_count', {
            num: channel.membersCount,
            formatted: 'short',
        }))));
});
export const ChannelListItemText = ({ lastPost, withTime }) => {
    const [formattedDate, ariaVersionFormattedDate] = useFormattedDate(lastPost?.sentAt);
    return (React.createElement("div", { className: "ChannelsListItem__post" },
        React.createElement(ChannelPostPreview, { className: "ChannelsListItem__text", post: lastPost, isDeleted: false }),
        withTime && lastPost && formattedDate && ariaVersionFormattedDate && (React.createElement(Time, { ariaVersionFormattedDate: ariaVersionFormattedDate, formattedDate: formattedDate, withDot: true, className: "ChannelsListItem__date" }))));
};
export const ChannelsListItemActionsMenu = ({ channel, isActive, className, onAction, onPinChannel }) => {
    const { navigate, screenRoute } = useRouter();
    const { lang, vkcom_me } = useBrowserEnv();
    const dispatch = useDispatch();
    const featureFlags = useFeatureFlags();
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const snackbar = useSnackbar();
    const onDefaultActionClick = (userAction) => {
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
                    source,
                    trackCode,
                    userAction: Channel.isInboundRequest(channel)
                        ? 'join_inbound_request'
                        : 'join',
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
            case 'pin': {
                onPinChannel(channel.id);
                break;
            }
            case 'mute':
            case 'unmute':
                dispatch({
                    type: 'UserChangedChannel',
                    channelId: channel.id,
                    userAction,
                    onComplete: () => {
                        const isMuted = userAction === 'mute';
                        snackbar({
                            message: isMuted
                                ? lang.use('me_channel_notifications_disabled')
                                : lang.use('me_channel_notifications_enabled'),
                            before: isMuted ? (React.createElement(Icon20NotificationSlashOutline, { color: "var(--vkui--color_icon_accent)" })) : (React.createElement(Icon20NotificationOutline, { color: "var(--vkui--color_icon_accent)" })),
                        });
                    },
                });
                break;
            case 'delete':
            default:
                break;
        }
        if (isActive) {
            switch (userAction) {
                case 'archive':
                    navigate({
                        kind: 'ChannelsFolderRoute',
                        organiser: screenRoute.organiser,
                    });
                    break;
                case 'unarchive':
                    if (screenRoute.kind === 'ChannelRoute') {
                        navigate(screenRoute);
                    }
                    break;
                case 'mute':
                case 'unmute':
                case 'delete':
                case 'join':
                case 'mark_read':
                case 'pin':
                case 'unpin':
                case 'leave':
                case 'report':
                case 'join_inbound_request':
                case 'leave_inbound_request':
                case 'restore_inbound_request':
                    break;
                default:
                    exhaustivenessCheck(userAction);
            }
        }
        onAction?.(userAction);
    };
    const isCommunityChannel = Channel.isCommunityChannel(channel);
    const isDeleteButtonEnable = vkcom_me?.communitySettingsChannelDeleteButton;
    const canDeleteChannel = isCommunityChannel
        ? channel.adminLevel >= 3 /* Peer.GroupAdminLevel.Admin */
        : channel.isOwner;
    const withDeleteAction = canDeleteChannel && !isDeleteButtonEnable;
    const withReportAction = isCommunityChannel && channel.adminLevel < 1 /* Peer.GroupAdminLevel.Moderator */;
    const canLeaveChannel = isCommunityChannel
        ? channel.isMember && !channel.isOwner
        : channel.isMember;
    const withDangerActions = withReportAction || canLeaveChannel || withDeleteAction;
    return (React.createElement(ActionsMenu, { className: className }, channel.isMember ? (React.createElement(React.Fragment, null,
        Channel.isUnread(channel) && (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('mark_read'), title: lang.use('me_convo_action_mark_read'), "aria-label": lang.use('me_convo_action_mark_read'), leftIcon: React.createElement(Icon20MessageCheckOutline, null), type: "secondary" })),
        !channel.isArchived &&
            (Channel.isPinned(channel) ? (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('unpin'), title: !isEdu && featureFlags.vkm_channel_name_to_community
                    ? lang.use('me_channel_community_action_unpin')
                    : lang.use('me_channel_action_unpin'), "aria-label": lang.use('me_channel_action_unpin'), leftIcon: React.createElement(Icon20PinSlashOutline, null), type: "secondary" })) : (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('pin'), title: !isEdu && featureFlags.vkm_channel_name_to_community
                    ? lang.use('me_channel_community_action_pin')
                    : lang.use('me_channel_action_pin'), "aria-label": lang.use('me_channel_action_pin'), leftIcon: React.createElement(Icon20PinOutline, null), type: "secondary" }))),
        channel.isArchived ? (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('unarchive'), title: lang.use('me_channel_action_unarchive'), "aria-label": lang.use('me_channel_action_unarchive'), leftIcon: React.createElement(Icon20UnarchiveOutline, null), type: "secondary" })) : (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('archive'), title: lang.use('me_channel_action_archive'), "aria-label": lang.use('me_channel_action_archive'), leftIcon: React.createElement(Icon20ArchiveOutline, null), type: "secondary" })),
        !channel.isArchived &&
            (channel.isMuted ? (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('unmute'), title: lang.use('me_channel_action_unmute'), "aria-label": lang.use('me_channel_action_unmute'), leftIcon: React.createElement(Icon20NotificationOutline, null), type: "secondary" })) : (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('mute'), title: lang.use('me_channel_action_mute'), "aria-label": lang.use('me_channel_action_mute'), leftIcon: React.createElement(Icon20NotificationSlashOutline, null), type: "secondary" }))),
        withDangerActions && React.createElement(ActionsMenuSeparator, null),
        withReportAction && (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('report'), title: lang.use('me_report_channel_label'), "aria-label": lang.use('me_report_channel_label'), type: "danger", leftIcon: React.createElement(Icon20ReportOutline, null) })),
        canLeaveChannel && (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('leave'), title: !isEdu && featureFlags.vkm_channel_name_to_community
                ? lang.use('me_channel_community_action_leave')
                : lang.use('me_channel_action_leave'), "aria-label": lang.use('me_channel_action_leave'), leftIcon: React.createElement(Icon20DoorArrowRightOutline, null), type: "danger" })),
        withDeleteAction && (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('delete'), title: lang.use('me_channel_action_delete'), "aria-label": lang.use('me_channel_action_delete'), leftIcon: React.createElement(Icon20DeleteOutline, null), type: "danger" })))) : (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('join'), title: lang.use('me_channel_action_join'), "aria-label": lang.use('me_channel_action_join'), leftIcon: React.createElement(Icon20DoorEnterArrowRightOutline, null), type: "secondary" }))));
};
//# sourceMappingURL=ChannelsListItem.js.map