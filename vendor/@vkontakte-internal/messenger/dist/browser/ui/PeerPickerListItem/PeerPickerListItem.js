import React from 'react';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import { PickerItem, } from '../../ui/PickerItem/PickerItem';
import { useConvos, useOwner, usePeers } from '../../hooks/misc';
import '../../ui/PeerPickerListItem/PeerPickerListItem.css';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import { ConvoTitle } from '../../ui/ConvoTitle/ConvoTitle';
import { PeerSubhead } from '../../ui/PeerSubhead/PeerSubhead';
import cx from 'classnames';
import { Footnote } from '@vkontakte/vkui';
import { Avatar } from '../../ui/Avatar/Avatar';
import { getOnlineStatus } from '../../ui/OnlineStatus/OnlineStatus';
import { useBrowserEnv, useLastSeen } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
export const PeerPickerListItem = ({ selected = false, disabled = false, subhead, peerId, onSelection, controlType = 'check', controlSide = 'left', description, viewerAsFavorites = true, isGlobal = false, withRestrictedDisabling = false, }) => {
    const peers = usePeers();
    const convos = useConvos();
    const peer = Peer.safeGet(peers, peerId);
    const owner = useOwner();
    const lastSeen = useLastSeen(peer.id);
    const { lang } = useBrowserEnv();
    const convo = convos.get(peer.id);
    const isFavorites = Peer.isFavorites(peer.id, owner.id);
    const isRestrictedConvo = !!convo && !convo.canWrite.allowed;
    const isDisabled = disabled || (withRestrictedDisabling && isRestrictedConvo);
    const createA18yLabel = () => {
        const name = Peer.name(peer);
        let status = '';
        switch (peer.kind) {
            case 'User':
            case 'Contact':
                status = getOnlineStatus(lang, peer, Date.now(), lastSeen);
                break;
            case 'Chat':
            case 'Group':
                // Не требуется
                break;
            default:
                exhaustivenessCheck(peer);
        }
        const result = [name];
        if (status) {
            result.push(status);
        }
        return result.join(', ');
    };
    const ariaLabel = createA18yLabel();
    return (React.createElement(PickerItem, { selected: selected, onSelection: onSelection, controlType: controlType, controlSide: controlSide, className: cx('PeerPickerListItem__item', {
            'PeerPickerListItem__item--disabled': isDisabled,
        }), ariaLabel: ariaLabel },
        React.createElement("div", { className: "PeerPickerListItem" },
            React.createElement("div", { className: "PeerPickerListItem__avatar" }, viewerAsFavorites && owner.kind !== 'Group' && isFavorites ? (React.createElement(PeerAvatar, { peer: peer, size: 40, withFavorite: true })) : (React.createElement(Avatar, { peer: peer, size: 40, withBirthday: true }))),
            React.createElement("div", { className: "PeerPickerListItem__content" },
                React.createElement("div", { className: "PeerPickerListItem__name" }, peer.kind === 'User' ? (React.createElement(PeerTitle, { peer: peer, isFavorites: viewerAsFavorites && isFavorites })) : (React.createElement(ConvoTitle, { peer: peer, isMuted: false, isCasper: !!convo && Convo.isCasper(convo) }))),
                description && (React.createElement(Footnote, { style: { color: 'var(--vkui--color_text_secondary)' } }, description)),
                !description && !isFavorites && (React.createElement(PeerSubhead, { className: "PeerPickerListItem__info", peer: peer, convo: convo, subhead: subhead, withRestrictedDisabling: withRestrictedDisabling, showScreenName: isGlobal }))))));
};
//# sourceMappingURL=PeerPickerListItem.js.map