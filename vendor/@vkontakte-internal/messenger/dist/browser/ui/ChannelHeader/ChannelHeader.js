import '../../ui/ChannelHeader/ChannelHeader.css';
import React, { useCallback } from 'react';
import * as Channel from '../../../core/model/Channel';
import { ChannelAvatar } from '../../ui/ChannelAvatar/ChannelAvatar';
import { ChannelTitle } from '../../ui/ChannelTitle/ChannelTitle';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon20Lock, Icon20LockOutline, Icon24Cancel, Icon24ChevronCompactLeft, Icon24MoreHorizontal, Icon24SearchOutline, Icon28HistoryForwardOutline, } from '@vkontakte/icons';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ChannelsListItemActionsMenu, } from '../../ui/ChannelsListItem/ChannelsListItem';
import { DeleteChannelModal, LeaveChannelModal, } from '../../ui/ChannelActionModal/ChannelActionModal';
import { useModal } from '../../hooks/useModal';
import cx from 'classnames';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { useRouter } from '../../ui/Router/Router';
import { ReportChannelModal } from '../../ui/ReportModal/ReportModal';
import { Counter, Footnote } from '@vkontakte/vkui';
import { useChannelSubscribersCountLang } from '../../hooks/useChannelSubscribersCountLang';
import { RichAvatar } from '@vkontakte-internal/vkcom-kit';
export const ChannelHistoryHeader = ({ channel, className, onPinChannel, onAdultBadgeClick, closeChannel }) => {
    const { lang } = useBrowserEnv();
    const { navigate, screenRoute } = useRouter();
    const deleteChannelModal = useModal();
    const leaveChannelModal = useModal();
    const reportChannelModal = useModal();
    const isCommunityChannel = Channel.isCommunityChannel(channel);
    const isUserBannedPermanently = channel.banInfo?.endDate === 0;
    const isClosedChannel = isCommunityChannel && Channel.isClosed(channel) && !channel.isMember;
    const isPrivateClosedChannel = isCommunityChannel &&
        Channel.isPrivate(channel) &&
        !channel.isParentGroupMember;
    const isBackButtonAvailable = screenRoute.kind === 'ChannelRoute' && screenRoute.parentRoute;
    const canEditPostponed = channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */;
    const postponedCount = channel.postponed.count;
    const channelDescription = useChannelSubscribersCountLang(channel);
    const handleModalClose = (modal) => {
        if (modal.isActive) {
            modal.close();
        }
    };
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
    const handleBackClick = () => {
        if (screenRoute.kind === 'ChannelRoute' && screenRoute.parentRoute) {
            navigate(screenRoute.parentRoute);
            return;
        }
        navigate({ kind: 'MainRoute' });
    };
    const handleChannelHeaderClickSearch = useCallback(() => {
        if (screenRoute.kind !== 'ChannelRoute') {
            return;
        }
        navigate({
            ...screenRoute,
            search: screenRoute.search === undefined ? '' : undefined,
        });
    }, [navigate, screenRoute]);
    const handlePosponedNavigation = useCallback(() => {
        if (screenRoute.kind === 'ChannelRoute') {
            navigate({
                ...screenRoute,
                postponed: true,
                postCmid: undefined,
            });
        }
    }, [navigate, screenRoute]);
    return (React.createElement("div", { className: cx(className, 'ChannelHeader') },
        isBackButtonAvailable ? (React.createElement(Tooltip, { position: "bottom", align: "center", content: lang.use('me_route_back') },
            React.createElement("button", { className: "ChannelHeader__action", onClick: handleBackClick, "aria-label": lang.use('me_route_back') },
                React.createElement(Icon24ChevronCompactLeft, null)))) : (React.createElement("button", { "aria-label": lang.use('me_close'), className: "ChannelHeader__action", onClick: closeChannel },
            React.createElement(Icon24Cancel, null))),
        React.createElement(ChannelLink, { channel: channel }, isPrivateClosedChannel ? (React.createElement("div", { className: "ChannelHeader__privateStub" },
            React.createElement(Icon20LockOutline, { fill: "var(--vkui--color_icon_tertiary)" }))) : (React.createElement(ChannelAvatar, { className: "ChannelHeader__avatar", photo: channel.photo, name: channel.name, size: 32 }))),
        React.createElement(ChannelLink, { channel: channel, className: "ChannelHeader__info" },
            React.createElement(ChannelTitle, { className: "ChannelHeader__infoTitle", channel: channel, hideMutedIcon: isCommunityChannel && !channel.isMember, onAdultBadgeClick: onAdultBadgeClick }),
            channelDescription && (React.createElement("span", { className: "ChannelHeader__infoSubtitle" }, channelDescription))),
        !isCommunityChannel && !isUserBannedPermanently && (React.createElement(Tooltip, { delay: 1000, position: "bottom", align: "center", content: lang.use('me_search_in_channel') },
            React.createElement("button", { className: "ChannelHeader__action", onClick: handleChannelHeaderClickSearch, "aria-label": lang.use('me_search_in_channel') },
                React.createElement(Icon24SearchOutline, null)))),
        canEditPostponed && (React.createElement(Tooltip, { delay: 1000, position: "bottom", align: "center", content: lang.use('me_channel_postponed_history') },
            React.createElement("button", { className: "ChannelHeader__action", onClick: handlePosponedNavigation, "aria-label": lang.use('me_channel_postponed_history') },
                React.createElement(Icon28HistoryForwardOutline, { width: 20, height: 24 }),
                !!postponedCount && (React.createElement(Counter, { className: "ChannelHeader__postponedCounter", mode: "primary", size: "s" }, postponedCount))))),
        !isUserBannedPermanently && !isClosedChannel && (React.createElement(Dropdown, { content: React.createElement(ChannelsListItemActionsMenu, { isActive: true, channel: channel, onPinChannel: onPinChannel, onAction: onAction }), align: "right", hideOnClick: true, adaptive: true },
            React.createElement("button", { className: "ChannelHeader__action", "aria-label": lang.use('me_actions_more') },
                React.createElement(Icon24MoreHorizontal, null)))),
        leaveChannelModal.isActive && (React.createElement(LeaveChannelModal, { isCommunityChannel: isCommunityChannel, channel: channel, onModalClose: () => handleModalClose(leaveChannelModal) })),
        deleteChannelModal.isActive && (React.createElement(DeleteChannelModal, { isCommunityChannel: isCommunityChannel, channel: channel, onModalClose: () => handleModalClose(deleteChannelModal) })),
        reportChannelModal.isActive && (React.createElement(ReportChannelModal, { channel: channel, onClose: () => handleModalClose(reportChannelModal) }))));
};
export const ChannelPostCommentsHeader = ({ className, post, onBackClick }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: cx(className, 'ChannelHeader') },
        React.createElement(Tooltip, { position: "bottom", align: "center", content: lang.use('me_route_back') },
            React.createElement("i", { role: "img", onClick: onBackClick, className: "ChannelHeader__buttonIcon" },
                React.createElement(Icon24ChevronCompactLeft, null))),
        post && post.kind === 'Normal' && (React.createElement("div", { className: "ChannelHeader__info" },
            React.createElement("span", { className: "ChannelHeader__infoTitle" }, lang.use('me_channels_comments'))))));
};
export const ChannelLink = ({ children, channel, className }) => {
    const { router } = useRouter();
    const handleLinkClick = (e) => {
        const next = {
            kind: 'ChannelPanel',
            channelId: channel.id,
            section: undefined,
        };
        const panels = router.screenRoute.rp || [];
        const [current] = panels.slice(-1);
        if (current?.kind === 'ChannelPanel' && channel.id === current.channelId) {
            e.preventDefault();
            if (current.section !== undefined) {
                router.replace(next);
            }
            return;
        }
        router.push(next);
    };
    return (React.createElement("div", { className: cx(className, 'ChannelHeader__link'), role: "button", tabIndex: 0, onClick: handleLinkClick }, children));
};
export const RestrictedChannelHeader = ({ className, }) => {
    const { lang } = useBrowserEnv();
    const { navigate, screenRoute } = useRouter();
    const isBackButtonAvailable = screenRoute.kind === 'ChannelRoute' && screenRoute.parentRoute;
    const handleBackClick = () => {
        if (screenRoute.kind === 'ChannelRoute' && screenRoute.parentRoute) {
            navigate(screenRoute.parentRoute);
            return;
        }
        navigate({ kind: 'MainRoute' });
    };
    const handleClose = () => {
        navigate({
            kind: 'MainRoute',
        });
    };
    return (React.createElement("div", { className: cx(className, 'ChannelHeader') },
        isBackButtonAvailable ? (React.createElement(Tooltip, { position: "bottom", align: "center", content: lang.use('me_route_back') },
            React.createElement("button", { className: "ChannelHeader__action", onClick: handleBackClick, "aria-label": lang.use('me_route_back') },
                React.createElement(Icon24ChevronCompactLeft, null)))) : (React.createElement("button", { "aria-label": lang.use('me_close'), className: "ChannelHeader__action", onClick: handleClose },
            React.createElement(Icon24Cancel, null))),
        React.createElement(RichAvatar, { fallbackIcon: React.createElement(Icon20Lock, null), size: 32 }),
        React.createElement(Footnote, null, lang.use('me_channel_restricted_header_title'))));
};
//# sourceMappingURL=ChannelHeader.js.map