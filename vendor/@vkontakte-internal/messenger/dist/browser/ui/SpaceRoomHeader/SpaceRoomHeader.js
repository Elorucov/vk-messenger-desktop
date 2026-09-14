import '../../ui/SpaceRoomHeader/SpaceRoomHeader.css';
import React from 'react';
import cx from 'classnames';
import * as Peer from '../../../core/model/Peer';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon20AdvertisingOutline, Icon20MessagesOutline, Icon24ChevronCompactLeft, } from '@vkontakte/icons';
import { Link } from '../../ui/Link/Link';
import { Subhead } from '@vkontakte/vkui';
import { useRouter } from '../../ui/Router/Router';
export const SpaceRoomHeader = ({ convo, peer, variant, spaceId, }) => {
    const { lang } = useBrowserEnv();
    const router = useRouter();
    const isBackButtonAvailable = router.screenRoute.kind === 'SpaceRoomRoute' &&
        router.screenRoute.parentRoute;
    const handleBack = () => {
        if (router.screenRoute.kind === 'SpaceRoomRoute' &&
            router.screenRoute.parentRoute) {
            router.navigate(router.screenRoute.parentRoute);
        }
        else {
            router.navigate({ kind: 'SpaceRoute', spaceId });
        }
    };
    const name = Peer.name(peer);
    const icon = variant === 'convo' ? (React.createElement(Icon20MessagesOutline, null)) : (React.createElement(Icon20AdvertisingOutline, null));
    return (React.createElement("div", { className: cx('SpaceRoomHeader', isBackButtonAvailable && 'SpaceRoomHeader__backButtonAvailable') },
        isBackButtonAvailable && (React.createElement(Tooltip, { position: "bottom", align: "center", content: lang.use('me_route_back') },
            React.createElement("button", { "aria-label": lang.use('me_route_back'), className: "SpaceRoomHeader__action SpaceRoomHeader__back", onClick: handleBack },
                React.createElement(Icon24ChevronCompactLeft, null)))),
        React.createElement(Link, { to: {
                kind: 'PeerPanel',
                peerId: peer.id,
                screenName: Peer.screenName(peer),
            }, className: "SpaceRoomHeader__info" },
            React.createElement("div", { className: "SpaceRoomHeader__avatar", role: "img", "aria-label": name }, icon),
            React.createElement("div", { className: "SpaceRoomHeader__infoContainer" },
                React.createElement("div", { className: "SpaceRoomHeader__title" }, name),
                React.createElement(Subhead, { weight: "3", className: "SpaceRoomHeader__status", useAccentWeight: true }, convo.state === 'in' &&
                    lang.use('me_group_members_count', {
                        num: convo.members.count,
                        formatted: 'short',
                    }))),
            React.createElement("button", { className: "SpaceRoomHeader__infoAnchor" }, lang.use('me_show_convo_profile')))));
};
//# sourceMappingURL=SpaceRoomHeader.js.map