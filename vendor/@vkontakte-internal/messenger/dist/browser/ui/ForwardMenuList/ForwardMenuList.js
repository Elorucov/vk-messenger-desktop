import React, { useMemo, useState } from 'react';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { ActionsMenuAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { useBrowserEnv, useConvos, useOrganisers, useOwner, usePeers, } from '../../hooks/misc';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { useConvoOrganiser } from '../../hooks/useConvoOrganiser';
import { Icon20MessagesOutline } from '@vkontakte/icons';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
const FORWARD_CONVOS_COUNT = 9;
export const ForwardMenuList = ({ onConvoClick, onFullOpenClick, }) => {
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const convosCache = useConvos();
    const peers = usePeers();
    const organisers = useOrganisers();
    const { peerIds, hasMore } = useConvoOrganiser(organisers, convosCache, { kind: 'filters', filter: 'all' }, 'all');
    const { isMobileLayout } = useLayoutData();
    const [isAllButtonVisible, setAllButtonVisible] = useState(true);
    // При маунте мы фиксируем список, чтобы чаты не прыгали
    const peerList = useMemo(() => {
        const convos = peerIds.map((peerId) => Convo.safeGet(convosCache, peerId));
        const convosWithoutFavorites = convos.filter((convo) => !Peer.isFavorites(convo.peerId, owner.id) && Convo.canForwardTo(convo));
        setAllButtonVisible(convosWithoutFavorites.length > FORWARD_CONVOS_COUNT || hasMore);
        const list = convosWithoutFavorites
            .slice(0, FORWARD_CONVOS_COUNT)
            .reduce((acc, convo) => {
            if (Convo.isPinned(convo)) {
                acc.push(convo);
                return acc;
            }
            const prevConvo = acc[acc.length - 1];
            // Добавляем разделитель после окончания запинов
            if (!Convo.isPinned(convo) &&
                prevConvo &&
                prevConvo !== 'separator' &&
                Convo.isPinned(prevConvo)) {
                acc.push('separator');
            }
            acc.push(convo);
            return acc;
        }, []);
        return list.map((convo) => {
            if (convo === 'separator') {
                return 'separator';
            }
            return Peer.safeGet(peers, convo.peerId);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (React.createElement(ScrollbarProvider, { forceVisible: "y", style: {
            maxHeight: isMobileLayout ? '300px' : 'calc(100vh - 175px)',
            maxWidth: '200px',
        }, overflowX: "hidden" },
        owner.kind !== 'Group' && (React.createElement(ActionsMenuAction, { onClick: () => onConvoClick(owner.id), title: lang.use('me_favorites'), type: "primary", leftIcon: React.createElement(PeerAvatar, { peer: owner, size: 24, withFavorite: true }) })),
        peerList.map((peer, index) => peer === 'separator' ? (React.createElement(ActionsMenuSeparator, { key: `separator-${index}` })) : (React.createElement(ActionsMenuAction, { key: peer.id, onClick: () => onConvoClick(peer.id), title: Peer.isFavorites(peer.id, owner.id)
                ? lang.use('me_favorites')
                : Peer.name(peer), type: "primary", leftIcon: React.createElement(PeerAvatar, { peer: peer, size: 24, withFavorite: true }) }))),
        isAllButtonVisible && (React.createElement(ActionsMenuAction, { onClick: onFullOpenClick, title: lang.use('me_forward_open_all'), leftIcon: React.createElement(Icon20MessagesOutline, { color: "var(--vkui--color_icon_secondary)" }), type: "primary" }))));
};
//# sourceMappingURL=ForwardMenuList.js.map