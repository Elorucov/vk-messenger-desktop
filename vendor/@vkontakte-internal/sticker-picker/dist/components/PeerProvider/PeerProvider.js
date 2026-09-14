import { useStore } from 'effector-react';
import { Ranges } from '@vkontakte-internal/shared';
import { useEffect } from 'react';
import { $peerId } from '../../model/peer';
import { setChatPeer } from '../../model/peer/chat';
import { setUserPeer } from '../../model/peer/user';
import { useAPI } from '../../hooks/api';
export function PeerProvider({ children }) {
    const api = useAPI();
    const peerId = useStore($peerId);
    const loadUser = async () => {
        let user;
        try {
            const users = await api.users.get({
                user_ids: String(peerId),
                fields: String(['photo_50', 'first_name_gen']),
            });
            user = users[0];
        }
        catch { }
        if (!user) {
            return;
        }
        setUserPeer(user);
    };
    const loadChat = async () => {
        let chat;
        try {
            const conversation = await api.messages.getConversationsById({
                peer_ids: String(peerId),
            });
            chat = conversation.items[0];
        }
        catch { }
        if (!chat) {
            return;
        }
        setChatPeer(chat);
    };
    const clear = () => {
        setUserPeer(null);
        setChatPeer(null);
    };
    useEffect(() => {
        clear();
        if (!peerId) {
            return;
        }
        if (Ranges.isChatOrChannelPeer(peerId)) {
            loadChat();
            return;
        }
        if (Ranges.isUserId(peerId)) {
            loadUser();
        }
    }, [peerId]);
    return children;
}
//# sourceMappingURL=PeerProvider.js.map