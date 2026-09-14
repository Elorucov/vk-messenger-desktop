import { useChatPreview } from '../../ui/ChatInviteModal/useChatPreview';
import { useRouter } from '../../ui/Router/Router';
import { CHAT_INVITE_LINK_URL_BASE } from '../../../core/config/config';
import React, { useCallback } from 'react';
import { ChatInviteModal } from '../../ui/ChatInviteModal/ChatInviteModal';
import { ChatInviteByLinkActionsButtons } from './ChatInviteByLinkModal';
import { usePeers } from '../../hooks/misc';
export const ChatInviteByExternalLinkModal = ({ hash, onSetAccount, registerAccount }) => {
    const link = CHAT_INVITE_LINK_URL_BASE + hash;
    const { navigate } = useRouter();
    const peers = usePeers();
    const { preview, error, isJoiningChat, joinChat } = useChatPreview({
        kind: 'ExternalLink',
        link,
    });
    const handleClose = useCallback(() => {
        navigate({
            kind: 'MainRoute',
        });
    }, [navigate]);
    if (error !== null) {
        return (React.createElement(ChatInviteModal, { error: error, handleClose: handleClose, onSetAccount: onSetAccount, registerAccount: registerAccount }));
    }
    if (preview === null) {
        return (React.createElement(ChatInviteModal, { isLoading: true, handleClose: handleClose, onSetAccount: onSetAccount, registerAccount: registerAccount }));
    }
    return (React.createElement(ChatInviteModal, { handleClose: handleClose, peersCache: peers, preview: preview, onSetAccount: onSetAccount, registerAccount: registerAccount, actionsButtons: React.createElement(ChatInviteByLinkActionsButtons, { preview: preview, joinChat: joinChat, isJoiningChat: isJoiningChat }) }));
};
//# sourceMappingURL=ChatInviteByExternalLinkModal.js.map