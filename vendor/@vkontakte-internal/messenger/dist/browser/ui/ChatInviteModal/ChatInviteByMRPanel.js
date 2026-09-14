import React, { useState } from 'react';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import { ChatInvitePanel } from '../../ui/ChatInviteModal/ChatInviteModal';
import { useBrowserEnv, useDispatch, usePeers } from '../../hooks/misc';
import { Button } from '@vkontakte/vkui';
import { CHAT_PREVIEW_ERRORS_LANG_MAP, useChatPreview, } from '../../ui/ChatInviteModal/useChatPreview';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { Icon56ErrorOutline } from '@vkontakte/icons';
import { IconNote } from '../../ui/IconNote/IconNote';
import { API_ERROR_FLOOD } from '@vkontakte-internal/api-schema-typescript';
export const ChatInviteByMRPanel = ({ convo, onReject, onGoBack, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const peers = usePeers();
    const { preview, error, isLoading } = useChatPreview({
        kind: 'MR',
        peerId: convo.peerId,
    });
    const [isMRAcceptingInProgress, setMRAcceptingInProgress] = useState(false);
    const peer = Peer.safeGet(peers, convo.peerId);
    if (error !== null) {
        return (React.createElement("div", { className: "ChatInviteByMRPanel__container" },
            React.createElement(IconNote, { icon: React.createElement(Icon56ErrorOutline, null), actions: React.createElement(Button, { onClick: onGoBack }, error === API_ERROR_FLOOD
                    ? lang.use('me_got_it')
                    : lang.use('me_back')) }, lang.use(CHAT_PREVIEW_ERRORS_LANG_MAP[error] || 'me_unknown_error'))));
    }
    if (isLoading || preview === null) {
        return (React.createElement("div", { className: "ChatInviteByMRPanel__container" },
            React.createElement(OptimizedSpinner, null)));
    }
    const senderPeerId = Convo.getMRSenderPeerId(convo);
    const senderPeer = Peer.safeGet(peers, senderPeerId);
    const acceptChatMR = () => {
        setMRAcceptingInProgress(true);
        dispatch({
            type: 'UserAcceptedChatMessageRequest',
            peerId: peer.id,
        });
    };
    // TODO Доработать закрытие для мобилок.
    return (React.createElement("div", { className: "ChatInviteByMRPanel__container" },
        React.createElement("div", { className: "ChatInviteByMRPanel" },
            React.createElement(ChatInvitePanel, { senderPeer: senderPeer, peersCache: peers, preview: preview, actionsButtons: React.createElement(React.Fragment, null,
                    React.createElement(Button, { className: "ChatInvitePanel__action", mode: "secondary", size: "l", onClick: onReject }, lang.use('me_reject')),
                    React.createElement(Button, { className: "ChatInvitePanel__action", size: "l", onClick: acceptChatMR, loading: isMRAcceptingInProgress }, lang.use('me_accept'))) }))));
};
//# sourceMappingURL=ChatInviteByMRPanel.js.map