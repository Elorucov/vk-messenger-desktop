import { exhaustivenessCheck } from '../../core/utils/misc';
import * as ChatMembers from '../../core/model/ChatMembers';
import { getOwnerGroupId, insertChatMembers, insertPeers, } from '../store/State';
export const handler = (draft, action, featureFlags) => {
    const isMembersPaginationEnabled = !!featureFlags.vkm_members_search_pagination;
    const membersPageSize = isMembersPaginationEnabled
        ? Math.max(Number(featureFlags.vkm_members_search_pagination.membersPageSize) ||
            300, 100)
        : 0;
    switch (action.type) {
        case 'LoadChatMembers': {
            const { peerId, memberIds, shouldUpdateCount } = action;
            const groupId = getOwnerGroupId(draft.ownerId);
            const convo = draft.convos.get(peerId);
            if (!convo || convo.kind !== 'ChatConvo') {
                return [];
            }
            const partialLoading = !!memberIds?.length;
            /**
             * Применяем пагинацию только для полной загрузки участников чатов,
             * размер списка которого превышает размер одной страницы пагинации.
             */
            const isWithPagination = isMembersPaginationEnabled &&
                !partialLoading &&
                convo.members.count > membersPageSize;
            if (isWithPagination) {
                /**
                 * Если прежде все участники были загружены, то не будем пытаться
                 * грузить заново, по крайней мере не для кейса с пагинацией, так как
                 * дозагрузка участников при 52 событии происходит точечно.
                 * */
                if (ChatMembers.isFullyLoaded(convo.members)) {
                    return [];
                }
                draft.locks.getConversationMembers.add(peerId);
            }
            const startFrom = convo.members.nextFrom;
            return [
                async function loadChatMembers({ api }) {
                    try {
                        return {
                            type: 'LoadChatMembers_RequestComplete',
                            peerId,
                            response: await api.fetch('messages.getConversationMembers', {
                                peer_id: peerId,
                                extended: 1,
                                group_id: groupId,
                                member_ids_long: memberIds && memberIds.join(','),
                                limit: isWithPagination ? membersPageSize : undefined,
                                start_from: isWithPagination ? startFrom : undefined,
                            }, { retries: 1, timeout: 30 * 1000 }),
                            isWithPagination,
                            partialLoading,
                            shouldUpdateCount,
                            hasFailed: false,
                        };
                    }
                    catch {
                        return {
                            type: 'LoadChatMembers_RequestComplete',
                            peerId,
                            partialLoading,
                            isWithPagination,
                            shouldUpdateCount,
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'LoadChatMembers_RequestComplete': {
            const { peerId, response, isWithPagination, shouldUpdateCount, partialLoading, hasFailed, } = action;
            const isFixMembersCountEnabled = !!featureFlags.vkm_members_count_over_3000;
            draft.locks.getConversationMembers.delete(peerId);
            const convo = draft.convos.get(peerId);
            if (convo?.kind !== 'ChatConvo' || hasFailed || !response) {
                return [];
            }
            const { items: apiMembers, incognito_members: incognitoMembers, profiles: apiUsers = [], groups: apiGroups = [], contacts: apiContacts = [], next_from: nextFrom, } = response;
            insertChatMembers(convo.members, apiMembers, incognitoMembers);
            insertPeers(draft, {
                apiUsers,
                apiGroups,
                apiContacts,
            });
            if (isWithPagination) {
                convo.members.nextFrom = nextFrom;
            }
            /**
             * Если в messages.getConversationMembers передавать member_ids,
             * то это означает точечную подгрузку участников, и метод в count
             * возвращает количество переданных в member_ids участников
             *
             * Если же не передавать это поле, а передавать count + offset,
             * то мы подгружаем участников батчами, и count в ответе означает
             * полное количество пользователей в чате
             *
             * Это временное решение, пока мы ждем фикс в лонгполле либо апи.
             * Подробнее в комментах к МРу для https://jira.mvk.com/browse/ME-57090
             */
            if (!isFixMembersCountEnabled) {
                if (partialLoading) {
                    ChatMembers.setCount(convo.members, convo.members.members.size + convo.members.incognitoMembers.size);
                }
                else {
                    ChatMembers.setCount(convo.members, response.count);
                }
            }
            if (shouldUpdateCount && isFixMembersCountEnabled) {
                ChatMembers.setCount(convo.members, convo.members.count +
                    apiMembers.length +
                    (incognitoMembers?.length ?? 0));
            }
            if ((convo.members.count || 0) < response.count) {
                return [
                    async function loadMoreUsers() {
                        return {
                            type: 'LoadChatMembers',
                            peerId,
                        };
                    },
                ];
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=LoadChatMembers.js.map