import '../../ui/ConvoProfileSharedConvos/ConvoProfileSharedConvos.css';
import React, { useRef, memo } from 'react';
import { Icon56ErrorOutline, Icon20ChevronRight } from '@vkontakte/icons';
import { Button, List, CellButton } from '@vkontakte/vkui';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import { noop } from '../../../core/utils/misc';
import { useSharedConvos } from '../../hooks/useSharedConvos';
import { useBrowserEnv, useConvo, usePeers } from '../../hooks/misc';
import { useControlledKeyboardFocusNavigation } from '../../hooks/useControlledKeyboardFocusNavigation';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { ConvoTitle } from '../../ui/ConvoTitle/ConvoTitle';
import { PeerSubhead } from '../../ui/PeerSubhead/PeerSubhead';
export const ConvoProfileSharedConvos = ({ peerId, goToConvo, }) => {
    const { peerIds, hasFailed, isLoading, refetch } = useSharedConvos(peerId);
    return (React.createElement("div", { role: "presentation", className: "ConvoProfileSharedConvos" }, isLoading ? (React.createElement(ConvoProfileSharedConvosLoader, null)) : (React.createElement(React.Fragment, null, hasFailed ? (React.createElement(ConvoProfileSharedConvosError, { refetch: refetch })) : (React.createElement(ConvoProfileSharedConvosContent, { peerIds: peerIds, goToConvo: goToConvo }))))));
};
const ConvoProfileSharedConvosLoader = () => (React.createElement(OptimizedSpinner, { size: "s", className: "ConvoProfileSharedConvos__loader" }));
const ConvoProfileSharedConvosError = ({ refetch, }) => {
    const { lang } = useBrowserEnv();
    const handleClick = () => {
        void refetch().catch(noop);
    };
    return (React.createElement("div", { role: "alert", className: "ConvoProfileSharedConvos__error" },
        React.createElement(Icon56ErrorOutline, { "aria-hidden": true, width: 48, height: 48 }),
        React.createElement("div", { role: "presentation" }, lang.use('me_shared_convos_load_error')),
        React.createElement(Button, { type: "button", onClick: handleClick, mode: "secondary" }, lang.use('me_shared_convos_retry'))));
};
const ConvoProfileSharedConvosContent = ({ peerIds, goToConvo }) => {
    if (!peerIds.length) {
        return React.createElement(ConvoProfileSharedConvosEmpty, null);
    }
    return (React.createElement(ConvoProfileSharedConvosContentItems, { peerIds: peerIds, goToConvo: goToConvo }));
};
const ConvoProfileSharedConvosEmpty = () => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { role: "alert", className: "ConvoProfileSharedConvos__empty" }, lang.use('me_convo_profile_empty_shared_convos')));
};
const ConvoProfileSharedConvosContentItems = ({ peerIds, goToConvo }) => {
    const { lang } = useBrowserEnv();
    const $ref = useRef(null);
    const handleKeyDown = useControlledKeyboardFocusNavigation([$ref], {
        kind: 'list',
    });
    return (React.createElement(List, { getRootRef: $ref, "aria-label": lang.use('me_convo_profile_shared_convos_tab'), onKeyDown: handleKeyDown }, peerIds.map((peerId, index) => (React.createElement(ConvoProfileSharedConvosContentItem, { key: peerId, index: index, peerId: peerId, totalCount: peerIds.length, goToConvo: goToConvo })))));
};
const ConvoProfileSharedConvosContentItem = memo(function ConvoProfileSharedConvosContentItem({ index, peerId, totalCount, goToConvo, }) {
    const peers = usePeers();
    const peer = Peer.safeGet(peers, peerId);
    const convo = useConvo(peer.id);
    const handleClick = () => {
        goToConvo({ peerId, entrypoint: 'shared_convos' });
    };
    return (React.createElement("div", { role: "listitem", "aria-setsize": totalCount, "aria-posinset": index + 1 },
        React.createElement(CellButton, { before: React.createElement("div", { role: "presentation", "aria-hidden": "true" },
                React.createElement(PeerAvatar, { peer: peer, size: 40 })), subtitle: React.createElement(PeerSubhead, { peer: peer, convo: convo, showScreenName: false }), indicator: React.createElement(Icon20ChevronRight, null), onClick: handleClick },
            React.createElement(ConvoTitle, { peer: peer, isMuted: false, isCasper: Convo.isCasper(convo) }))));
});
//# sourceMappingURL=ConvoProfileSharedConvos.js.map