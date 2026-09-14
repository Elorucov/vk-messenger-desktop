import { getOwnerGroupId } from '../../data/store/State';
import { useCallback } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import { useOwner } from './misc';
// Делаем запрос на бэк, чтобы понять доступно ли сообщение
export const useCheckMessageIsAvailable = () => {
    const apiFetch = useApiFetch();
    const owner = useOwner();
    const checkIsAvailable = useCallback(async (peerId, cmid) => {
        const response = await apiFetch('messages.getByConversationMessageId', {
            peer_id: peerId,
            conversation_message_ids: `${cmid}`,
            extended: 1,
            group_id: getOwnerGroupId(owner.id),
        });
        // Проверка кейса когда пользователь удалил сообщение только для себя
        const isDeleted = Boolean(response.items[0]?.deleted);
        return Boolean(response.count && !isDeleted);
    }, [apiFetch, owner.id]);
    return checkIsAvailable;
};
//# sourceMappingURL=useCheckMessageIsAvailable.js.map