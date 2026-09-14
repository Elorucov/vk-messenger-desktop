import React, { useEffect, useState } from 'react';
import * as Convo from '../../../core/model/Convo';
import { useBrowserEnv, useConvos, usePeers } from '../../hooks/misc';
import { useMessageReactedPeers } from '../../hooks/useMessageReactedPeers';
import './MessageReactedPeersModal.css';
import { Tabs, TabsItem } from '@vkontakte-internal/vkcom-kit';
import { FailedRequest } from '../../ui/FailedRequest/FailedRequest';
import { UnknownMessageReaction } from '../../ui/UnknownMessageReaction/UnknownMessageReaction';
import { PeerList, PeerListItemLink, PeerListItemStub, } from '../../ui/PeerListItem/PeerListItem';
import { HorizontalScroll } from '@vkontakte/vkui';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
export const MessageReactedPeersModal = ({ peerId, cmid, messageReactions, onClose, }) => {
    const { lang } = useBrowserEnv();
    const convos = useConvos();
    const [selectedReactionId, setSelectedReactionId] = useState(undefined);
    const convo = Convo.safeGet(convos, peerId);
    const message = Convo.findMessageByCmid(convo, cmid);
    if (message === undefined ||
        message.kind !== 'Normal' ||
        !message.reactions ||
        message.reactions.size === 0) {
        return null;
    }
    const reactions = [...message.reactions.values()].reduce((acc, messageReaction) => {
        const reaction = messageReactions.get(messageReaction.reactionId);
        if (reaction) {
            acc.push({
                reaction,
                count: messageReaction.count,
            });
        }
        return acc;
    }, []);
    const total = reactions.reduce((acc, cur) => acc + cur.count, 0);
    return (React.createElement(ModalInterface, { title: React.createElement("div", { className: "MessageReactedPeersModal__tabs" },
            React.createElement(HorizontalScroll, { arrowSize: "m" },
                React.createElement("div", { className: "MessageReactedPeersModal__tabsContent" },
                    React.createElement(Tabs, { mode: "accent" },
                        React.createElement(TabsItem, { onClick: () => setSelectedReactionId(undefined), selected: selectedReactionId === undefined, after: React.createElement("span", { className: "MessageReactedPeersModal__tabCount" }, total) }, lang.use('me_message_reacted_peers_all')),
                        reactions.map(({ reaction, count }) => (React.createElement(TabsItem, { key: reaction.id, onClick: () => setSelectedReactionId(reaction.id), selected: selectedReactionId === reaction.id, after: React.createElement("span", { className: "MessageReactedPeersModal__tabCount" }, count) },
                            React.createElement("img", { className: "MessageReactedPeersModal__tabReaction", src: reaction.image, alt: reaction.name, width: 20, height: 20 })))))))), onClose: onClose, closeLabel: lang.use('me_close'), withCustomLayout: true, panelClass: "MessageReactedPeersModal__panel" },
        React.createElement(ScrollbarProvider, { style: { height: '100%' }, scrollableProps: {
                className: 'MessageReactedPeersModal__wrapper',
            }, overflowX: "hidden" },
            React.createElement("section", { className: "MessageReactedPeersModal__content", "aria-label": lang.use('me_message_reacted_peers_modal_title') },
                React.createElement(ReactedPeersList, { key: `${peerId}-${cmid}-${selectedReactionId}`, peerId: peerId, cmid: cmid, reactionId: selectedReactionId, messageReactions: messageReactions, onItemClick: onClose })))));
};
const ReactedPeersList = ({ peerId, cmid, reactionId, messageReactions, onItemClick, }) => {
    const { lang } = useBrowserEnv();
    const { isLoading, isFailed, load, peers } = useMessageReactedPeers({
        peerId,
        cmid,
        reactionId,
    });
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reactionId]);
    if (isFailed) {
        return (React.createElement(FailedRequest, { text: lang.use('me_reacted_peers_failed'), onReloadClick: load }));
    }
    return (React.createElement(PeerList, null,
        peers.map((peer) => (React.createElement(PeerCard, { key: peer.peerId, peerId: peer.peerId, reaction: messageReactions.get(peer.reactionId), onClick: onItemClick }))),
        isLoading &&
            [...Array(16).keys()].map((index) => (React.createElement("div", { className: "MessageReactedPeersModal__item MessageReactedPeersModal__item--stub", style: {
                    '--animation-delay': `calc(${index} * 250ms)`,
                }, key: index },
                React.createElement(PeerListItemStub, null))))));
};
export const PeerCard = ({ peerId, reaction, onClick, }) => {
    const peers = usePeers();
    const peer = peers.get(peerId);
    if (!peer) {
        return null;
    }
    return (React.createElement(PeerListItemLink, { peer: peer, onNavigate: onClick, after: reaction ? (React.createElement("img", { src: reaction.image, alt: reaction.name, width: 26, height: 26, className: "MessageReactedPeersModal__peerReaction" })) : (React.createElement(UnknownMessageReaction, { className: "MessageReactedPeersModal__peerReaction", color: "var(--vkui--color_text_accent)", fillBackground: true })) }));
};
//# sourceMappingURL=MessageReactedPeersModal.js.map