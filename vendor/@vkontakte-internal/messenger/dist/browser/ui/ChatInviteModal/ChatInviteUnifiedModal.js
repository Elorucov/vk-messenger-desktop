import { Icon16Add } from '@vkontakte/icons';
import { Link, Button } from '@vkontakte/vkui';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import { useChatPreview, } from '../../ui/ChatInviteModal/useChatPreview';
import { useRouter } from '../../ui/Router/Router';
import { CHAT_INVITE_LINK_URL_BASE } from '../../../core/config/config';
import React, { useCallback } from 'react';
import { ChatInviteModal } from '../../ui/ChatInviteModal/ChatInviteModal';
export const ChatInviteUnifiedModal = ({ hash, onSetAccount, registerAccount, }) => {
    const { screenRoute, pop } = useRouter();
    const peers = usePeers();
    const link = CHAT_INVITE_LINK_URL_BASE + hash;
    const params = screenRoute.kind === 'ConvoRoute'
        ? { kind: 'Link', link, convoRoute: screenRoute }
        : { kind: 'ExternalLink', link };
    const { preview, error, isJoiningChat, joinChat } = useChatPreview(params);
    const handleClose = useCallback(() => {
        pop();
    }, [pop]);
    if (error) {
        return (React.createElement(ChatInviteModal, { error: error, handleClose: handleClose, onSetAccount: onSetAccount, registerAccount: registerAccount }));
    }
    if (!preview) {
        return (React.createElement(ChatInviteModal, { isLoading: true, handleClose: handleClose, onSetAccount: onSetAccount, registerAccount: registerAccount }));
    }
    return (React.createElement(ChatInviteModal, { handleClose: handleClose, peersCache: peers, preview: preview, onSetAccount: onSetAccount, registerAccount: registerAccount, actionsButtons: React.createElement(ChatInviteByLinkActionsButtons, { preview: preview, joinChat: joinChat, isJoiningChat: isJoiningChat }) }));
};
const ChatInviteByLinkActionsButtons = ({ preview, joinChat, isJoiningChat, }) => {
    const { lang } = useBrowserEnv();
    if (preview.isDonut && preview.button) {
        return (React.createElement(Button, { className: "ChatInvitePanel__action", href: preview.button.action.url, Component: Link, before: React.createElement(Icon16Add, null), size: "m" }, preview.button.title));
    }
    switch (preview.inState) {
        /**
         * Если это новый чат, то по-умолчанию inState === 'left',
         * "Вернуться в чат" выглядит так, будто пользователь там был.
         *
         * Если пользователь в беседе (inState === 'in'),
         * то показывать кнопку "Вернуться в чат" выглядит так,
         * будто он из него вышел.
         *
         * Всегда отображаем "Присоединиться" - ME-31160
         */
        case 'kicked':
            // В беседу нельзя вернуться, если юзер был кикнут из неё
            return (React.createElement("span", { className: "ChatInvitePanel__grayed" }, lang.use('me_chat_youre_kicked')));
        default:
            return (React.createElement(Button, { className: "ChatInvitePanel__action", before: React.createElement(Icon16Add, null), onClick: joinChat, loading: isJoiningChat, size: "m" }, lang.use('me_chat_join')));
    }
};
//# sourceMappingURL=ChatInviteUnifiedModal.js.map