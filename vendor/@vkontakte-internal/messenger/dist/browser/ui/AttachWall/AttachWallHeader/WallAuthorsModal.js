import React from 'react';
import { RichAvatar, SimpleCell } from '@vkontakte-internal/vkcom-kit';
import { Avatar } from '../../../ui/Avatar/Avatar';
import { useBrowserEnv } from '../../../hooks/misc';
import { Link } from '../../../ui/Link/Link';
import { PeerTitle } from '../../../ui/PeerTitle/PeerTitle';
import { Icon20StarCircleFillBlue } from '@vkontakte/icons';
import { ModalInterface } from '../../../ui/ModalInterface/ModalInterface';
export const WallAuthorsModal = ({ onClose, coownerPeers, getRoute, author, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(React.Fragment, null,
        React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), title: lang.use('me_attaches_coauthors_modal_header'), headerClass: "AttachWallNew__modalHeader", contextClass: "AttachWallNew__modalContext" },
            React.createElement(Link, { to: getRoute(author), key: author.id },
                React.createElement(SimpleCell, { before: React.createElement(RichAvatar, { src: author.photo?.photo50, size: 40 },
                        React.createElement(RichAvatar.Badge, null,
                            React.createElement(Icon20StarCircleFillBlue, null))), hasHover: true },
                    React.createElement(PeerTitle, { peer: author }))),
            coownerPeers.map((peer) => (React.createElement(Link, { to: getRoute(peer), key: peer.id },
                React.createElement(SimpleCell, { before: React.createElement(Avatar, { peer: peer, size: 40 }), hasHover: true },
                    React.createElement(PeerTitle, { peer: peer }))))))));
};
//# sourceMappingURL=WallAuthorsModal.js.map