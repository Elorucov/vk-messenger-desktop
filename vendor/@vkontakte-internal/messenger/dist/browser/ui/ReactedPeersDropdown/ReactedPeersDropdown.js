import React, { useMemo } from 'react';
import * as Peer from '../../../core/model/Peer';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { useMessageReactedPeers } from '../../hooks/useMessageReactedPeers';
import { Avatar } from '../../ui/Avatar/Avatar';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import { MessageReactionImage } from '../../ui/MessageReactionImage/MessageReactionImage';
import './ReactedPeersDropdown.css';
import { FailedRequest } from '../../ui/FailedRequest/FailedRequest';
import { Link } from '../../ui/Link/Link';
import { useAdaptivityWithJSMediaQueries } from '@vkontakte/vkui';
export const ReactedPeersDropdown = ({ children, peerId, cmid, reactionId, messageReactions, count = 3, canOpen, }) => {
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const peers = usePeers();
    const { lang } = useBrowserEnv();
    const { isFailed, load, reset, peers: reactedPeers, } = useMessageReactedPeers({
        peerId,
        cmid,
        reactionId,
    });
    const peerList = useMemo(() => reactedPeers
        .map((reactedPeer) => ({
        peer: Peer.safeGet(peers, reactedPeer.peerId),
        reaction: messageReactions.get(reactedPeer.reactionId),
    }))
        .filter((reactedPeer) => Boolean(reactedPeer.reaction)), [messageReactions, peers, reactedPeers]);
    const renderContent = () => {
        if (isFailed) {
            return (React.createElement("div", { className: "ReactedPeersDropdown__fail" },
                React.createElement(FailedRequest, { size: "s", align: "center", text: lang.use('me_reacted_peers_failed'), onReloadClick: (event) => {
                        event.stopPropagation();
                        load();
                    } })));
        }
        if (peerList.length) {
            return peerList.map((reactedPeer) => (React.createElement(Link, { to: {
                    kind: 'PeerPanel',
                    peerId: reactedPeer.peer.id,
                    screenName: Peer.screenName(reactedPeer.peer),
                }, stopPropagation: false, className: "ReactedPeersDropdown__item", key: reactedPeer.peer.id },
                React.createElement(ActionsMenuAction, { key: reactedPeer.peer.id, leftIcon: React.createElement(Avatar, { peer: reactedPeer.peer, size: 20 }), rightIcon: React.createElement(MessageReactionImage, { id: reactedPeer.reaction.id, image: reactedPeer.reaction.image, size: 22 }), title: Peer.name(reactedPeer.peer) }))));
        }
        return [...Array(count).keys()].map((index) => (React.createElement(ActionMenuStub, { key: index })));
    };
    return (React.createElement(Dropdown, { classNames: {
            contentWrapper: 'ReactedPeersDropdown',
        }, content: React.createElement(ActionsMenu, { className: "ReactedPeersDropdown__list", 
            // Не вызываем контекстное меню по клику на реакцию
            onContextMenu: (e) => e.stopPropagation() }, renderContent()), contentPreventDefault: false, adaptation: "horizontal", align: "center", position: "top", canOpen: Boolean(messageReactions.get(reactionId)) && canOpen, ...(!hasPointer
            ? {
                openType: 'longtouch',
            }
            : {
                openType: 'hover',
                delay: 1000,
            }), hideOnClick: true, hideOnWheel: true, onOpen: load, onClose: reset }, children));
};
const ActionMenuStub = () => {
    return (React.createElement(ActionsMenuAction, { title: React.createElement("div", { className: "ReactedPeersDropdown__stubTitle" }), leftIcon: React.createElement("div", { className: "ReactedPeersDropdown__stubIcon" }), rightIcon: React.createElement("div", { className: "ReactedPeersDropdown__stubIcon" }) }));
};
//# sourceMappingURL=ReactedPeersDropdown.js.map