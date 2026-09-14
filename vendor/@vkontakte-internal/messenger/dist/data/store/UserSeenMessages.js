import { exhaustivenessCheck, sleep } from '../../core/utils/misc';
import * as Message from '../../core/model/Message';
import * as Convo from '../../core/model/Convo';
import * as Organisers from '../../core/model/Organisers';
import * as History from '../../core/model/History';
import { getOwnerGroupId } from '../store/State';
/**
 * Прочтение представляет из себя достаточно сложную логику.
 * Основная цель этой сложности в том, чтобы оптимизировать запросы, которые мы отправляем к АПИ.
 *
 * Хотя код с очередями достаточно сложный, основная идея проста.
 * Мы позволяем юайному коду диспатчить сколько угодно событий прочтения в стор. Благодаря этому,
 * юайный код может не заморачиваться с батчингом и координацией таких запросов. На стороне стора
 * мы создаем очередь прочтения для каждой беседы.
 * Эта очередь выполняет две функции:
 * 1) батчинг прочтения многих сообщений/реакций в один запрос
 * 2) мутекс, который предотвращает отправку нескольких запросов одновременно
 *
 * Далее общий порядок действий примерно такой:
 * 1. Добавляем новый cmid в батч
 *    а) если очередь уже установлена, мы считаем что мутекс выставлен и только добавляем в батч
 *    б) если очередь не была установлена, то, помимо добавления в батч, мы еще и заскедулим запрос
 *       в АПИ с определенным тротлом
 * 2. Как только тротл окончен, мы забираем очередной батч из очереди и выполняем запрос АПИ.
 *    При этом мы не удаляем саму очередь, чтобы мутекс оставался выставленным и не случилось
 *    параллельного запроса.
 * 3. Как только запрос окончен
 *    а) если очередь осталась пустой, то мы удалим ее из списка, таким образом убрав мутекс и
 *       разблокировав будущие прочтения
 *    б) если за время запроса в очереди накопились еще cmid, мы заскедулим новый запрос в АПИ
 *       как и в пункте 1.б
 */
const REACTIONS_READ_MAX_BATCH_SIZE = 100;
/**
 * Ограничение на количество сообщений в батче нужно потому,
 * что есть ограничение на количество запросов в fetchMany,
 * и помимо прочтения сообщений имеются прочтения реакций,
 * в будущем возможно добавится что-то еще.
 */
const MESSAGES_READ_MAX_BATCH_SIZE = 20;
const THROTTLE_TIMEOUT = 500;
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'UserSeenMessages': {
            const { fromCmid, toCmid, peerId, analyticsAppName } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const slice = History.around(convo.history, fromCmid);
            if (slice === undefined) {
                return [];
            }
            const toInCmid = slice.nodes.reduce((result, node) => {
                const message = node.kind === 'Node' ? node.item : undefined;
                if (message !== undefined &&
                    message.cmid > result &&
                    message.cmid <= toCmid &&
                    !message.isOut) {
                    result = message.cmid;
                }
                return result;
            }, fromCmid);
            const prevInReadBy = convo.inReadBy;
            const newUnreadCount = Convo.calcUnreadCountWithInReadBy(convo, toInCmid);
            Convo.readInUntil(convo, toInCmid, newUnreadCount);
            const readReactions = [...convo.unreadReactions.keys()].filter((cmid) => cmid >= fromCmid && cmid <= toCmid);
            if (convo.inReadBy === prevInReadBy && readReactions.length === 0) {
                return [];
            }
            readReactions.forEach((cmid) => Convo.readReactions(convo, cmid));
            Organisers.refresh(draft.organisers, convo);
            const readQueue = draft.readQueues.get(peerId);
            /**
             * Обновляем границу, до которой нужно будет прочитать беседу
             * в запросе АПИ до новой актуальной.
             */
            if (readQueue) {
                readQueue.messages.add(convo.inReadBy);
                readReactions.forEach((cmid) => readQueue.reactions.add(cmid));
                // Кроме накопления cmid очередь так же выполняет функцию мутекса,
                // чтобы мы параллельно не посылали множественные запросы на прочтение.
                // То есть, если очередь существует (даже если она пуста), это означает,
                // что запрос на прочтение в данный момент в пути.
                // После того как он будет завершен, мы удалим эту очередь из списка,
                // чтобы разблокировать последующие прочтения.
                return [];
            }
            draft.readQueues.set(peerId, {
                messages: new Set([convo.inReadBy]),
                reactions: new Set(readReactions),
            });
            /**
             * Вместо того, чтобы отправлять запрос на бэк
             * при каждом прочитанном сообщении, мы будем "батчить"
             * такие запросы.
             * Поэтому будем отправлять запрос не бэк не чаще,
             * чем раз в Х мс, с максимальным прочитанным
             * на этот момент сообщением.
             */
            return [scheduleConvoRead(peerId, prevInReadBy, analyticsAppName)];
        }
        case 'UserSeenMessages_ThrottleTimedOut': {
            const { peerId, prevInReadBy, analyticsAppName } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                draft.readQueues.delete(peerId);
                return [];
            }
            const readQueue = draft.readQueues.get(peerId);
            if (!readQueue) {
                return [];
            }
            const reactionsReadBatch = [];
            for (const cmid of readQueue.reactions) {
                reactionsReadBatch.push(cmid);
                readQueue.reactions.delete(cmid);
                if (reactionsReadBatch.length === REACTIONS_READ_MAX_BATCH_SIZE) {
                    break;
                }
            }
            let messagesReadBatch = [];
            for (const cmid of readQueue.messages) {
                if (prevInReadBy < cmid) {
                    messagesReadBatch.push(cmid);
                }
                readQueue.messages.delete(cmid);
                if (messagesReadBatch.length === MESSAGES_READ_MAX_BATCH_SIZE) {
                    break;
                }
            }
            const readUntilCmid = messagesReadBatch.length > 0
                ? Message.resolveCmid(Math.max(...messagesReadBatch))
                : prevInReadBy;
            if (!featureFlags.vkm_mark_read_without_throttle) {
                messagesReadBatch = readUntilCmid > prevInReadBy ? [readUntilCmid] : [];
            }
            const ownerId = draft.ownerId;
            const shouldReadConvo = messagesReadBatch.length > 0;
            const shouldReadReactions = featureFlags.vkm_reactions !== false && reactionsReadBatch.length > 0;
            // Если читать нам нечего, то просто синхронно вызовем результат
            // прочтения, чтобы корректно очистить все локи
            if (!shouldReadConvo && !shouldReadReactions) {
                return handler(draft, {
                    type: 'UserSeenMessages_RequestCompleted',
                    peerId,
                    readUntilCmid,
                    analyticsAppName,
                }, featureFlags, envFeatureFlags);
            }
            return [
                async function readConvoUntilMessage({ api }) {
                    try {
                        await api.fetchMany([
                            shouldReadReactions && {
                                method: 'messages.markReactionsAsRead',
                                params: {
                                    peer_id: peerId,
                                    cmids: reactionsReadBatch.join(','),
                                    group_id: getOwnerGroupId(ownerId),
                                },
                            },
                            ...messagesReadBatch.map((cmid) => ({
                                method: 'messages.markAsRead',
                                params: {
                                    peer_id: peerId,
                                    up_to_cmid: cmid,
                                    mark_conversation_as_read: 0,
                                    group_id: getOwnerGroupId(ownerId),
                                    from: analyticsAppName,
                                },
                            })),
                        ]);
                    }
                    catch (err) {
                        /**
                         * Просто игнорируем ошибки. С точки зрения чтения сообщений они некритичны.
                         */
                    }
                    return {
                        type: 'UserSeenMessages_RequestCompleted',
                        peerId,
                        readUntilCmid,
                        analyticsAppName,
                    };
                },
            ];
        }
        case 'UserSeenMessages_RequestCompleted': {
            const { peerId, readUntilCmid, analyticsAppName } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const readQueue = draft.readQueues.get(peerId);
            if (!readQueue) {
                return [];
            }
            // Если пока мы читали, у нас не появилось новых сообщений в очереди на прочтение,
            // это означает, что нам не нужно скедулить новое прочтение и нужно освободить мутекс.
            // Для этого мы просто удалим очередь из списка.
            // Подробнее множно прочитать в основном экшене выше.
            if (readQueue.messages.size === 0 && readQueue.reactions.size === 0) {
                draft.readQueues.delete(peerId);
                return [];
            }
            return [scheduleConvoRead(peerId, readUntilCmid, analyticsAppName)];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
function scheduleConvoRead(peerId, prevInReadBy, analyticsAppName) {
    return async function scheduleConvoRead() {
        await sleep(THROTTLE_TIMEOUT);
        return {
            type: 'UserSeenMessages_ThrottleTimedOut',
            prevInReadBy,
            peerId,
            analyticsAppName,
        };
    };
}
//# sourceMappingURL=UserSeenMessages.js.map