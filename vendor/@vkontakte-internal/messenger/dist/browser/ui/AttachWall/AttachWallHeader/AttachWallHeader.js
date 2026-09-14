import { Icon16RepostOutline } from '@vkontakte/icons';
import { isSameYear } from '../../../../core/utils/misc';
import React from 'react';
import { applyParentRouteParam } from '../../../../data/env/Router';
import * as Channel from '../../../../core/model/Channel';
import { useBrowserEnv } from '../../../hooks/misc';
import { useNow } from '../../../hooks/useNow';
import * as Peer from '../../../../core/model/Peer';
import { useModal } from '../../../hooks/useModal';
import { WallAuthorsModal } from '../../../ui/AttachWall/AttachWallHeader/WallAuthorsModal';
import { AttachTitle } from '../../../ui/AttachWall/AttachWallHeader/AttachTitle';
import { AttachAvatar } from '../../../ui/AttachAvatar/AttachAvatar';
export const AttachWallHeader = ({ wallOrWallReply, author, peersCached, coownerPeers, }) => {
    const { lang, router, vkcom_me } = useBrowserEnv();
    const now = useNow();
    const authorsModal = useModal();
    const openChannelRoute = (peer) => {
        if (vkcom_me?.openCommunityPageInReplay) {
            return {
                kind: 'ScreenNameProxyRoute',
                screenName: Peer.screenName(peer) || '',
            };
        }
        else {
            return applyParentRouteParam(router.screenRoute, {
                kind: 'ChannelRoute',
                channelId: Channel.resolveId(peer.id),
            });
        }
    };
    const isChannelRoute = (peer) => wallOrWallReply.kind !== 'WallReply' && Peer.isGroupPeerId(peer.id);
    const getRoute = (peer) => isChannelRoute(peer)
        ? openChannelRoute(peer)
        : {
            kind: 'PeerPanel',
            peerId: peer.id,
            screenName: Peer.screenName(peer),
        };
    return (React.createElement("header", { className: "AttachWallNew__header" },
        React.createElement(Icon16RepostOutline, { className: "AttachWallNew__icon" }),
        React.createElement("div", { className: "AttachWallNew__avatar" },
            React.createElement(AttachAvatar, { author: author, getRoute: getRoute, coownerPeers: coownerPeers })),
        React.createElement(AttachTitle, { getRoute: getRoute, coownerPeers: coownerPeers, author: author, peersCached: peersCached, onRestAuthorsClick: authorsModal.open }),
        React.createElement("div", { className: "AttachWallNew__subtitle" }, lang.use(isSameYear(now, wallOrWallReply.date)
            ? 'global_short_date_time'
            : 'global_date_year_time', {
            now,
            date: wallOrWallReply.date,
        })),
        authorsModal.isActive && coownerPeers && (React.createElement(WallAuthorsModal, { onClose: authorsModal.close, coownerPeers: coownerPeers, getRoute: getRoute, author: author }))));
};
//# sourceMappingURL=AttachWallHeader.js.map