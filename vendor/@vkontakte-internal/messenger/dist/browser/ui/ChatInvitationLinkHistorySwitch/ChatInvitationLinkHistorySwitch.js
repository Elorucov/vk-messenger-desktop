import '../../ui/ChatInvitationLinkHistorySwitch/ChatInvitationLinkHistorySwitch.css';
import React, { useId } from 'react';
import { Switch } from '@vkontakte/vkui';
import { useBrowserEnv } from '../../hooks/misc';
/**
 * Переключатель доступа к последним сообщениям по ссылке-приглашению в чат.
 */
export const ChatInvitationLinkHistorySwitch = ({ peerId, withHistory, setWithHistory }) => {
    const { lang, storage } = useBrowserEnv();
    const onToggleLinks = () => {
        const peersWithoutHistoryLink = storage.get('chats-links-without-history') || [];
        const updatedPeerIds = !withHistory
            ? peersWithoutHistoryLink.filter((id) => id !== peerId)
            : peersWithoutHistoryLink.concat(peerId);
        storage.set('chats-links-without-history', updatedPeerIds);
        setWithHistory((prevValue) => !prevValue);
    };
    const id = useId();
    return (React.createElement("div", { className: "ChatInvitationLinkHistorySwitch" },
        React.createElement("span", { onClick: onToggleLinks, id: id }, lang.use('me_invite_link_history_shown_description')),
        React.createElement(Switch, { checked: withHistory, onChange: onToggleLinks, "aria-labelledby": id })));
};
//# sourceMappingURL=ChatInvitationLinkHistorySwitch.js.map