import { useCallback, useState } from 'react';
import { useFeatureFlags, useOwner } from './misc';
import { useApiFetch } from './useApiFetch';
import * as Message from '../../core/model/Message';
import { fromApiMessage } from '../../data/converter/MessageConverter';
import { getOwnerGroupId } from '../../data/store/State';
/**
 * Хук для запроса полной версии уже существующего сообщения.
 * Задача ME-79586 добавила к запросам getDiff и getHistory параметр,
 * ограничивающий уровень вложенности возвращаемых сообщений.
 * В связи с этим они приходят в урезанном виде и для их просмотра в модалке
 * нужно дозагружать полную версию сообщения.
 */
export function useFetchFullMessage() {
    const apiFetch = useApiFetch();
    const featureFlags = useFeatureFlags();
    const owner = useOwner();
    const [isLoading, setLoading] = useState(false);
    const [isError, setError] = useState(false);
    const fetchFullMessage = useCallback(async (cmid, peerId) => {
        try {
            setError(false);
            setLoading(true);
            const response = await apiFetch('messages.getByConversationMessageId', {
                peer_id: peerId,
                conversation_message_ids: cmid.toString(),
                extended: 1,
                group_id: getOwnerGroupId(owner.id),
            }, { retries: 5 });
            const apiMessage = response.items[0];
            if (!apiMessage) {
                throw new Error('Не пришло полное сообщнеие');
            }
            const res = fromApiMessage(featureFlags, apiMessage);
            const fullRootMessage = res.message;
            if (!Message.isMessageNormal(fullRootMessage)) {
                throw new Error('Некорректный формат сообщения');
            }
            if (!fullRootMessage.forwardedMessages?.[0]) {
                throw new Error('Нет пересланных сообщений');
            }
            return {
                apiMessage,
                fullRootMessage: fullRootMessage,
            };
        }
        catch (err) {
            console.error(err);
            setError(true);
            return {};
        }
        finally {
            setLoading(false);
        }
    }, [apiFetch, featureFlags, owner.id]);
    return {
        isLoading,
        isError,
        fetchFullMessage,
    };
}
//# sourceMappingURL=useFetchFullMessage.js.map