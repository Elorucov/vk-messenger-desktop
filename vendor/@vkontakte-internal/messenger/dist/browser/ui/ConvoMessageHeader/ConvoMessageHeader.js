import React from 'react';
import { useBrowserEnv, useFeatureFlags, useOwner, usePeer, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import { Link } from '../../ui/Link/Link';
import cx from 'classnames';
import './ConvoMessageHeader.css';
import { Icon20MessageArrowRightOutline } from '@vkontakte/icons';
import { ConvoMessageIconButton } from '../../ui/ConvoMessageIconButton/ConvoMessageIconButton';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
export const ConvoMessageHeader = ({ className, author, sentFromPeerId, scrollToMsg, isShortenedPeer, isRestrictedToWrite, disabledProfileClick, }) => {
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const sentFromPeer = usePeer(sentFromPeerId);
    const { vkm_new_bubbles_width_calc } = useFeatureFlags();
    const authorLink = (React.createElement(Link, { to: {
            kind: 'PeerPanel',
            peerId: author.id,
            screenName: Peer.screenName(author),
        }, disabled: disabledProfileClick, className: "ConvoMessageHeader__authorLink" },
        React.createElement(PeerTitle, { peer: author, isShortened: isShortenedPeer, isRestrictedToWrite: isRestrictedToWrite })));
    const sentFromLink = sentFromPeer && (React.createElement("span", null,
        React.createElement("span", { className: "ConvoMessageHeader__sentFromPrefix" }, lang.use('me_message_sent_from_new_prefix')),
        React.createElement(Link, { className: "ConvoMessageHeader__sentFromLink", to: {
                kind: 'ConvoRoute',
                peerId: sentFromPeer.id,
                entrypoint: 'fav_box',
            } }, owner.kind !== 'Group' && Peer.isFavorites(sentFromPeer.id, owner.id)
            ? lang.use('me_favorites')
            : Peer.firstName(sentFromPeer))));
    const scrollToMessageButton = scrollToMsg && (React.createElement("div", { className: "ConvoMessageHeader__goToMessageBtn" },
        React.createElement(Tooltip, { content: lang.use('me_go_to_message'), delay: 500, position: "top", align: "right", arrowOffset: { x: -3 }, tooltipOffset: { y: 4 }, vkuiStyle: true },
            React.createElement("span", null,
                React.createElement(ConvoMessageIconButton, { onClick: scrollToMsg, icon: React.createElement(Icon20MessageArrowRightOutline, null), "aria-label": lang.use('me_go_to_message') })))));
    return (React.createElement("div", { className: cx('ConvoMessageHeader', vkm_new_bubbles_width_calc && 'ConvoMessageHeader__refactored', className) },
        React.createElement("div", { className: cx('ConvoMessageHeader__sentFromInfo', vkm_new_bubbles_width_calc &&
                'ConvoMessageHeader__sentFromInfoRefactored') },
            authorLink,
            sentFromLink),
        scrollToMessageButton));
};
//# sourceMappingURL=ConvoMessageHeader.js.map