import '../../ui/PeerTitle/PeerTitle.css';
import React from 'react';
import { Icon12Favorite, Icon16Education, Icon16Verified, Icon16MessageCross, } from '@vkontakte/icons';
import * as Peer from '../../../core/model/Peer';
import cx from 'classnames';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import * as Viewer from '../../../core/model/Viewer';
import { StatusIcon } from '../../ui/StatusIcon/StatusIcon';
/**
 * Компонент для вывода имени пира: пользователя, группы или чата.
 * Поддерживает галочку верификации, умеет сокращать имя в многоточие.
 *
 * Наследует все свойства шрифта, кроме `font-family`
 */
export const PeerTitle = React.memo(function PeerTitle({ peer, isShortened = false, isShortenedSurname = false, isAdmin = false, isOwner = false, isFavorites = false, isRestrictedToWrite = false, isClassic = false, skipImageStatus = false, className, iconColor, }) {
    const { lang } = useBrowserEnv();
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    let peerName;
    switch (true) {
        case isFavorites:
            peerName = lang.use('me_favorites');
            break;
        case isShortened:
            peerName = Peer.firstName(peer);
            break;
        case isShortenedSurname:
            peerName = Peer.shortName(peer);
            break;
        case isClassic:
            peerName = Peer.classicName(peer);
            break;
        default:
            peerName = Peer.name(peer);
            break;
    }
    const renderVerifiedIcon = () => {
        if (peer.kind === 'Chat' || peer.kind === 'Contact' || !peer.isVerified) {
            return null;
        }
        return (React.createElement("span", { className: "PeerTitle__icon PeerTitle__verifiedIcon", style: {
                color: iconColor,
            } }, isEdu && peer.kind === 'User' ? (React.createElement(Icon16Education, { width: 12, height: 12 })) : (React.createElement(Icon16Verified, null))));
    };
    return (React.createElement("div", { className: cx('PeerTitle', { 'PeerTitle--vkAdmin': Peer.isVkAdministration(peer.id) }, className) },
        React.createElement("div", { className: "PeerTitle__title" }, peerName),
        !skipImageStatus && (React.createElement(StatusIcon, { "aria-hidden": true, peer: peer, size: 14, className: "PeerTitle__icon" })),
        renderVerifiedIcon(),
        (isAdmin || isOwner) && (React.createElement("span", { className: cx('PeerTitle__icon', isAdmin && 'PeerTitle__adminIcon', isOwner && 'PeerTitle__ownerIcon') },
            React.createElement(Icon12Favorite, { "aria-hidden": false, "aria-label": lang.use(isOwner ? 'me_aria_creator' : 'me_aria_admin') }))),
        isRestrictedToWrite && (React.createElement("span", { "aria-label": lang.use('me_aria_member_temporary_ban'), className: "PeerTitle__icon PeerTitle__cantWriteIcon" },
            React.createElement(Icon16MessageCross, null)))));
});
//# sourceMappingURL=PeerTitle.js.map