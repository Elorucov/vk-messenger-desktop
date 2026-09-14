import { Icon16RepostOutline, Icon24MessageForwardOutline, } from '@vkontakte/icons';
import React, { useMemo } from 'react';
import { applyParentRouteParam } from '../../../../data/env/Router';
import * as Channel from '../../../../core/model/Channel';
import { useBrowserEnv } from '../../../hooks/misc';
import * as Peer from '../../../../core/model/Peer';
import { Avatar, Headline } from '@vkontakte-internal/vkcom-kit';
import { ExternalLink, Link } from '../../../ui/Link/Link';
import { useRouter } from '../../../ui/Router/Router';
import '../../../ui/AttachChannelMessage/AttachChannelMessageHeader/AttachChannelMessageHeader.css';
import { useWithoutBubblesTheme } from '../../../hooks/useWithoutBubblesTheme';
import cx from 'classnames';
export const AttachChannelMessageHeader = ({ channelMessage, isChannelMessageDeleted, isUnavailable, isDonut, onCloseMessageInModal, parentGroupPeer, }) => {
    const { lang, router, withNewChannels } = useBrowserEnv();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const channelMessageLink = router.toUrl({
        kind: 'AttachProxyRoute',
        attach: channelMessage,
        organiser: router.screenRoute.organiser,
    });
    const channelLink = router.toUrl({
        kind: 'CommunityChannelProxyRoute',
        channelId: channelMessage.channelId,
    });
    const isLinkToPostAvailable = !isUnavailable && channelMessageLink && !isChannelMessageDeleted && !isDonut;
    const peerName = Peer.name(parentGroupPeer);
    const route = useMemo(() => {
        if (withNewChannels) {
            return applyParentRouteParam(router.screenRoute, {
                kind: 'ChannelRoute',
                channelId: Channel.resolveId(channelMessage.channelId),
                postCmid: isLinkToPostAvailable ? channelMessage.cmid : undefined,
            });
        }
        else {
            return {
                kind: 'CommunityChannelProxyRoute',
                channelId: Channel.resolveId(channelMessage.channelId),
                postCmid: isLinkToPostAvailable ? channelMessage.cmid : undefined,
            };
        }
    }, [router, channelMessage, withNewChannels, isLinkToPostAvailable]);
    return (React.createElement("header", { className: cx('AttachWallNew__header AttachChannelMessageHeader', {
            'AttachChannelMessageHeader--withoutBubble': isWithoutBubblesTheme,
        }) },
        isWithoutBubblesTheme && (React.createElement(Icon16RepostOutline, { className: "AttachWallNew__icon" })),
        React.createElement("div", { className: "AttachWallNew__avatar" },
            React.createElement(ChannelLink, { withNewChannels: Boolean(withNewChannels), href: isLinkToPostAvailable ? channelMessageLink : channelLink || '', to: route, onCloseMessageInModal: onCloseMessageInModal, tabIndex: -1, "aria-hidden": true },
                React.createElement(Avatar, { className: "AttachChannelMessageHeader__avatar", size: 36, src: parentGroupPeer?.photo?.photo50 }))),
        React.createElement("div", { className: "AttachWallNew__subtitle" }, lang.use('me_channel_forward_from')),
        React.createElement(ChannelLink, { withNewChannels: Boolean(withNewChannels), href: isLinkToPostAvailable ? channelMessageLink : channelLink || '', to: route, onCloseMessageInModal: onCloseMessageInModal, className: "AttachWallNew__authorLink" },
            React.createElement(Headline, { className: 'PeerTitle--ellipsis' }, peerName)),
        !isWithoutBubblesTheme && (React.createElement("div", { className: "AttachChannelMessageHeader__forward-icon" },
            React.createElement(OpenPostButton, { channelMessageLink: isLinkToPostAvailable ? channelMessageLink : channelLink || '', attach: channelMessage, onCloseMessageInModal: onCloseMessageInModal }, lang.use('me_fc_open_wall_post'))))));
};
export const OpenPostButton = ({ attach, onCloseMessageInModal, channelMessageLink }) => {
    const { router } = useRouter();
    const { withNewChannels } = useBrowserEnv();
    const route = useMemo(() => applyParentRouteParam(router.screenRoute, {
        kind: 'ChannelRoute',
        channelId: Channel.resolveId(attach.channelId),
        postCmid: attach.cmid,
    }), [router, attach]);
    return (React.createElement(ChannelLink, { withNewChannels: Boolean(withNewChannels), href: channelMessageLink, to: route, onCloseMessageInModal: onCloseMessageInModal, className: "AttachWallNew__link AttachWallNew__link--post AttachChannelMessageHeader__forward-icon--link" },
        React.createElement(Icon24MessageForwardOutline, { width: 16, height: 16 })));
};
export const ChannelLink = ({ withNewChannels, to, href, onCloseMessageInModal, children, className, ...ariaAttributes }) => {
    return (React.createElement(React.Fragment, null, withNewChannels ? (React.createElement(Link, { to: to, onNavigate: onCloseMessageInModal, className: className, ...ariaAttributes }, children)) : (React.createElement(ExternalLink, { className: className, href: href, ...ariaAttributes }, children))));
};
//# sourceMappingURL=AttachChannelMessageHeader.js.map