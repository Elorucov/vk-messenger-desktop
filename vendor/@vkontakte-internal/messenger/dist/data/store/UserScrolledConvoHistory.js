import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Peer from '../../core/model/Peer';
import * as Convo from '../../core/model/Convo';
import * as History from '../../core/model/History';
import * as Message from '../../core/model/Message';
import { MESSAGES_PER_PAGE } from '../../core/config/config';
import { getOwnerGroupId, insertPeers } from '../store/State';
import { API_ERROR_ACCESS, } from '@vkontakte-internal/api-schema-typescript';
import { fromApiMessage } from '../converter/MessageConverter';
import { IPerfStats } from '../env/IPerfStats';
import { IApi } from '../env/IApi';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'UserScrolledConvoHistory': {
            const { peerId, direction, startCmid, possibleSkipped, isPostponed } = action;
            /**
             * Отложенные не загружаются постранично. Они грузятся все сразу при открытии (на данный момент их число ограничено 100)
             */
            if (isPostponed) {
                return [];
            }
            const ownerId = draft.ownerId;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const lockId = getLockId(peerId, startCmid);
            /**
             * Близкие по времени вызовы экшена могут произойти либо
             * из разных интерфейсов, либо при проблемах в логике кода.
             *
             * Но в любом случае, если у них разные startCmid, то мы не хотим их скипать.
             */
            if (draft.locks.getHistory.has(lockId)) {
                return [];
            }
            draft.locks.getHistory.add(lockId);
            // Добавляем +1, чтобы компенсировать startCmid, поскольку он инклюзивный
            // Добавляем еще +1, чтобы не делать лишний запрос, когда мы загружаем последние
            // соообщения сверху (иначе нам придет ровно сколько надо и придется делать
            // еще один запрос по hasMore)
            let count = Math.min(MESSAGES_PER_PAGE, possibleSkipped || MESSAGES_PER_PAGE) + 2;
            let offset;
            switch (direction) {
                case 'backward':
                    /**
                     * Грузим внахлест с загруженными сообщениями, на случай,
                     * если startCmid удаленный.
                     */
                    offset = -1;
                    break;
                case 'forward':
                    /**
                     * Компенсируем первый +1 из count, чтобы грузить внахлест
                     * с загруженными сообщениями, на случай, если startCmid удаленный.
                     */
                    offset = -count + 1;
                    break;
                case 'around':
                    count = MESSAGES_PER_PAGE;
                    // Хотим получить 80% сообщений позднее переданного startCmid,
                    // и только 20% ранних сообщений, так как пользователю скорее
                    // всего интересны более поздние сообщения.
                    offset = -Math.floor(count * 0.8);
                    /**
                     * Меняем offset для случая когда грузим вокруг (с around), последнего
                     * прочитанного так как для direction равного around possibleSkipped мы не знаем.
                     */
                    if (convo.inReadBy === startCmid) {
                        offset = Math.max(-convo.unreadCount, offset);
                    }
                    break;
                default:
                    exhaustivenessCheck(direction);
            }
            return [
                async function loadConvoHistory({ api, perfStats }) {
                    try {
                        perfStats?.addEventData(IPerfStats.EventType.openChat, {
                            loadHistoryStart: perfStats.getCurrentTime(),
                        });
                        const response = await api.fetch('messages.getHistory', {
                            peer_id: peerId,
                            start_cmid: startCmid,
                            count,
                            offset,
                            extended: 1,
                            group_id: getOwnerGroupId(ownerId),
                            fwd_extended: 1,
                            /**
                             * Ограничивает уровень вложенности сообщений
                             */
                            ...(featureFlags.vkm_nested_level_messages && {
                                nested_limit: 2,
                            }),
                        }, { retries: 5 });
                        perfStats?.addEventData(IPerfStats.EventType.openChat, {
                            loadHistoryEnd: perfStats.getCurrentTime(),
                        });
                        // hasMoreBackward обозначает есть ли в истории еще более ранние посты.
                        let hasMoreBackward;
                        // hasMoreForward обозначает есть ли в истории еще более поздние посты.
                        // Необходимость флага выяснилась в задаче: ME-40879.
                        let hasMoreForward;
                        switch (direction) {
                            case 'backward': {
                                // Если пришло сообщений ровно столько, сколько мы запросили,
                                // значит возможно есть еще что грузить
                                hasMoreBackward = count === response.items.length;
                                hasMoreForward = true;
                                break;
                            }
                            case 'around': {
                                /**
                                 * Для around тоже нужно считать hasMore флаги, чтобы не словить проблем.
                                 * Например, задачи ME-40837 и ME-40879 .
                                 */
                                const responseBackwardCount = response.items.filter(({ conversation_message_id }) => Message.resolveCmid(conversation_message_id) <= startCmid).length;
                                const requestBackwardCount = count + offset;
                                // Если сообщений, включая startCmid и более ранних пришло ровно столько,
                                // сколько мы запросили, с учетом offset, значит возможно есть
                                // еще что грузить
                                hasMoreBackward = responseBackwardCount === requestBackwardCount;
                                const responseForwardCount = response.items.length - responseBackwardCount;
                                const requestForwardCount = -offset;
                                hasMoreForward = responseForwardCount === requestForwardCount;
                                break;
                            }
                            case 'forward': {
                                hasMoreBackward = true;
                                hasMoreForward = count === response.items.length;
                                break;
                            }
                            default:
                                exhaustivenessCheck(direction);
                        }
                        return {
                            type: 'UserScrolledConvoHistory_RequestSucceed',
                            response,
                            peerId,
                            startCmid,
                            hasMoreBackward,
                            hasMoreForward,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserScrolledConvoHistory_RequestFailed',
                            peerId,
                            startCmid,
                            error: err instanceof Error ? err : undefined,
                        };
                    }
                },
            ];
        }
        case 'UserScrolledConvoHistory_RequestSucceed': {
            const { peerId, startCmid, response, hasMoreBackward, hasMoreForward } = action;
            draft.locks.getHistory.delete(getLockId(peerId, startCmid));
            const convo = draft.convos.get(peerId);
            if (!convo) {
                /**
                 * Если беседы не оказалось в кэше
                 */
                return [];
            }
            const messages = response.items.map((apiMessage) => fromApiMessage(featureFlags, apiMessage).message);
            Convo.insertMessages(convo, messages, {
                backward: hasMoreBackward,
                forward: hasMoreForward,
            });
            insertPeers(draft, {
                apiUsers: response.profiles || [],
                apiGroups: response.groups || [],
                apiContacts: [],
            });
            return [];
        }
        case 'UserScrolledConvoHistory_RequestFailed': {
            const { peerId, startCmid, error } = action;
            draft.locks.getHistory.delete(getLockId(peerId, startCmid));
            if (error &&
                error instanceof IApi.RequestError &&
                error.code === API_ERROR_ACCESS) {
                const convo = draft.convos.get(peerId);
                convo && Convo.removeInitialGroupConvoGap(convo);
            }
            return [];
        }
        case 'MessagesHistoryWarmUp': {
            if (!featureFlags.vkm_history_warm_up) {
                return [];
            }
            const { convos, now } = action;
            const { limit: rawLimit, offsetMultiplier: rawOffsetMultiplier, maxUnreadInclude: rawMaxUnreadInclude, timeDiffInclude: rawTimeDiffInclude, } = featureFlags.vkm_history_warm_up;
            const limit = Number(rawLimit) || MESSAGES_PER_PAGE;
            const offsetMultiplier = Number(rawOffsetMultiplier) || 0.8;
            const maxUnreadInclude = Number(rawMaxUnreadInclude) || undefined;
            const timeDiffInclude = Number(rawTimeDiffInclude) || 604800000; // Одна неделя в мс
            /**
             * Фильтруем беседы по времени последнего сообщения
             */
            let filteredConvos = convos.filter(({ history }) => {
                const lastMessage = History.lastNode({
                    history,
                    withFailed: false,
                    withDeleted: false,
                    withPending: false,
                });
                if (lastMessage) {
                    return now - lastMessage.item.sentAt <= timeDiffInclude;
                }
                /**
                 * Если у беседы отсутствует последнее сообщение, то и прогревать
                 * там нечего.
                 */
                return false;
            });
            /**
             * По количеству непрочитанных
             */
            if (maxUnreadInclude) {
                filteredConvos = filteredConvos.filter(({ unreadCount }) => unreadCount <= maxUnreadInclude);
            }
            const requestedItems = filteredConvos.reduce((acc, convo) => {
                const { peerId, inReadBy, history } = convo;
                const lastMessageCmid = History.lastCmid(history);
                const isReadByLastMessage = inReadBy === lastMessageCmid;
                /**
                 * Если последнее сообщение является последним прочитанным,
                 * то будем грузить начиная с cmid - 1.
                 */
                const startCmid = isReadByLastMessage
                    ? Message.resolveCmid(inReadBy - 1)
                    : inReadBy;
                const lockId = getLockId(peerId, startCmid);
                if (draft.locks.getHistory.has(lockId)) {
                    /**
                     * Если присутствует лок, то прогревать не будем,
                     * конва уже грузится.
                     */
                    return acc;
                }
                draft.locks.getHistory.add(getLockId(peerId, startCmid));
                /**
                 * Если нами прочитано последнее сообщение, выставляем offset -1,
                 * который вернет нам все последние сообщения, включая last_message.
                 *
                 * (Можно было указать и 0, но при обычной загрузке истории тоже указывается -1,
                 * ввиду чего решил не менять это значение.)
                 * TODO: подумать над тем, чтоб использовать 0 вместо -1 тут и в дозагрузке истории.
                 *
                 * Иначе считаем, сколько сообщений нам нужно вернуть вокруг метки непрочитанности
                 */
                const offset = isReadByLastMessage
                    ? -1
                    : -Math.floor(limit * offsetMultiplier);
                return [
                    ...acc,
                    {
                        peerId,
                        offset,
                        startCmid,
                        convo,
                    },
                ];
            }, []);
            const ownerId = draft.ownerId;
            return [
                async function warmUpHistory({ api }) {
                    let response;
                    try {
                        response = await api.fetch('messages.getDiffContent', {
                            conversation_messages: JSON.stringify(requestedItems.map(({ peerId, offset, startCmid }) => ({
                                peer_id: peerId,
                                cmid_mark: startCmid,
                                offset,
                                limit,
                            }))),
                            extended: 1,
                            group_id: getOwnerGroupId(ownerId),
                            ...(featureFlags.vkm_nested_level_messages && {
                                nested_limit: 2,
                            }),
                        });
                    }
                    catch {
                        /**
                         * Ну не прогрели и не прогрели.
                         * Удаляем локи.
                         */
                        return {
                            type: 'MessagesHistoryWarmUp_RequestFailed',
                            failedItems: requestedItems,
                        };
                    }
                    const historyItems = response.items.reduce((acc, { messages: apiMessages, peer_id: rawPeerId }) => {
                        const item = requestedItems.find(({ peerId }) => peerId === Peer.resolveId(rawPeerId));
                        if (!item || !apiMessages) {
                            return acc;
                        }
                        const { convo, startCmid, offset } = item;
                        const responseBackwardCount = apiMessages.filter(({ conversation_message_id }) => Message.resolveCmid(conversation_message_id) <= startCmid).length;
                        const requestBackwardCount = limit + offset;
                        const hasMoreBackward = responseBackwardCount === requestBackwardCount;
                        const responseForwardCount = apiMessages.length - responseBackwardCount;
                        const requestForwardCount = -offset;
                        const hasMoreForward = responseForwardCount === requestForwardCount;
                        return [
                            ...acc,
                            {
                                peerId: convo.peerId,
                                apiMessages,
                                hasMoreBackward,
                                hasMoreForward,
                            },
                        ];
                    }, []);
                    return {
                        type: 'MessagesHistoryWarmUp_RequestSucceed',
                        requestedItems: requestedItems,
                        historyItems,
                        apiUsers: response.profiles ?? [],
                        apiGroups: response.groups ?? [],
                        apiContacts: response.contacts ?? [],
                    };
                },
            ];
        }
        case 'MessagesHistoryWarmUp_RequestSucceed': {
            const { requestedItems, historyItems, apiUsers, apiGroups, apiContacts } = action;
            for (const { peerId, startCmid } of requestedItems) {
                draft.locks.getHistory.delete(getLockId(peerId, startCmid));
            }
            for (const { peerId, apiMessages, hasMoreBackward, hasMoreForward, } of historyItems) {
                const convo = draft.convos.get(peerId);
                if (!convo) {
                    /**
                     * Если беседы не оказалось в кэше
                     */
                    continue;
                }
                const messages = apiMessages.map((apiMessage) => fromApiMessage(featureFlags, apiMessage).message);
                Convo.insertMessages(convo, messages, {
                    backward: hasMoreBackward,
                    forward: hasMoreForward,
                });
            }
            insertPeers(draft, {
                apiUsers,
                apiGroups,
                apiContacts,
            });
            return [];
        }
        case 'MessagesHistoryWarmUp_RequestFailed': {
            const { failedItems } = action;
            for (const { peerId, startCmid } of failedItems) {
                draft.locks.getHistory.delete(getLockId(peerId, startCmid));
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
function getLockId(peerId, startCmid) {
    return `${peerId}-${startCmid}`;
}
//# sourceMappingURL=UserScrolledConvoHistory.js.map