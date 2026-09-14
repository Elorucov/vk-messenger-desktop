import '../../ui/AttachDonutLink/AttachDonutLink.css';
import React from 'react';
import * as Peer from '../../../core/model/Peer';
import { Button } from '@vkontakte/vkui';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import { Link, ExternalLink } from '../../ui/Link/Link';
import { Icon16StarCircleFillYellow } from '@vkontakte/icons';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
export const AttachDonutLink = React.memo(function AttachDonutLink({ donutLink }) {
    const peers = usePeers();
    const { lang, router } = useBrowserEnv();
    const group = Peer.safeGet(peers, donutLink.ownerId);
    // Невозможное состояние, так как данные группы приходят вместе с сообщением
    if (!group || group.kind !== 'Group') {
        return null;
    }
    const link = router.toUrl({ kind: 'AttachProxyRoute', attach: donutLink });
    return (React.createElement("div", { className: "AttachDonutLink" },
        React.createElement(ExternalLink, { disabled: !link, href: donutLink.action.url, className: "AttachDonutLink__overlay" }),
        React.createElement(ExternalLink, { disabled: !link, href: donutLink.action.url, className: "AttachDonutLink__avatarContainer" },
            React.createElement(BasicAvatar, { size: 44, content: Peer.name(group), picture: group.photo }),
            React.createElement(Icon16StarCircleFillYellow, { className: "AttachDonutLink__avatarIcon" })),
        React.createElement("div", { className: "AttachDonutLink__content" },
            React.createElement(PeerTitle, { peer: group, className: "AttachDonutLink__peerTitle" }),
            React.createElement("p", { className: "AttachDonutLink__text" }, donutLink.text),
            donutLink.donorsCount > 0 && (React.createElement("p", { className: "AttachDonutLink__donorsCount" }, lang.use('me_donut_link_snippet_donors_count', {
                num: donutLink.donorsCount,
            }))),
            link ? (React.createElement(Link, { to: { kind: 'AttachProxyRoute', attach: donutLink } },
                React.createElement(Button, { className: "AttachDonutLink__button", mode: "outline", appearance: "accent-invariable" }, donutLink.button.title))) : null)));
});
//# sourceMappingURL=AttachDonutLink.js.map