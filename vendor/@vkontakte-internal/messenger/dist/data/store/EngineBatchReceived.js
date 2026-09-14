// noinspection LanguageDetectionInspection
import { current, isDraft } from 'immer';
import { addConvosToFolder, getConvosByIds, getOwnerGroupId, insertConvos, insertFolders, insertSublists, insertIncognitoMembers, insertPeers, removeConvosFromFolder, TypingVariants, insertChatMembers, setTags, } from '../store/State';
import { IEngine } from '../env/IEngine';
import { fromApiMessage, fromEngineMessage, } from '../converter/MessageConverter';
import * as Organisers from '../../core/model/Organisers';
import * as Filters from '../../core/model/Filters';
import * as Peer from '../../core/model/Peer';
import * as Convo from '../../core/model/Convo';
import * as Space from '../../core/model/Space';
import * as Message from '../../core/model/Message';
import * as Folder from '../../core/model/Folder';
import * as ManagedGroup from '../../core/model/ManagedGroup';
import * as Queue from '../../core/model/Queue';
import * as Attach from '../../core/model/Attach';
import * as Sticker from '../../core/model/Sticker';
import * as Reaction from '../../core/model/Reaction';
import * as History from '../../core/model/History';
import * as ChatMembers from '../../core/model/ChatMembers';
import * as Tag from '../../core/model/Tag';
import * as ThemeStyle from '../../core/model/ThemeStyle';
import * as Viewer from '../../core/model/Viewer';
import * as BotKeyboard from '../../core/model/BotKeyboard';
import { isPopupAutoplayOnGetOff } from '@vkontakte-internal/stickers-kit';
import { exhaustivenessCheck, getFlagValueByBitOffset, isDev, sleep, } from '../../core/utils/misc';
import { EDU_INTEGRATION_BANNER_ID, TYPING_EXPIRATION_TIME, } from '../../core/config/config';
import { fromApiConvo, fromLongpollPushSettings, } from '../converter/ConvoConverter';
import { fromApiKeyboard, fromApiMessageEvent, } from '../converter/BotKeyboardConverter';
import { fromApiSublist } from '../converter/SublistConverter';
import { fromApiFolder, fromEngineFolder } from '../converter/FolderConverter';
import { fromApiTag } from '../converter/TagConverter';
import { IApi } from '../env/IApi';
import { IPerfStats } from '../env/IPerfStats';
import { Time } from '../../core/utils/time';
import { findMessageByCmid } from '../../core/model/Convo';
import { convertEduSchedule } from '../converter/PeerConverter';
const MAX_REACTED_PEERS_CACHE = 200;
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    const ownerId = draft.ownerId;
    switch (action.type) {
        case 'EngineBatchReceived': {
            const { variant } = action;
            switch (variant.kind) {
                case 'FromEngineBatch':
                    return handleFromEngine(featureFlags, draft, envFeatureFlags, variant);
                case 'FromEngineFailure':
                case 'FromEngineMissingDataFailed':
                    return handleFromEngineFailure(featureFlags, draft, envFeatureFlags, variant);
                case 'FromEngineWithMissingData':
                    return handleFromEngineWithMissingData(featureFlags, draft, envFeatureFlags, variant);
                case 'FromApiEngineHistory':
                    return handleFromApiEngineHistory(featureFlags, draft, envFeatureFlags, variant);
                case 'FromApiEngineGetDiff':
                    return handleFromApiEngineGetDiff(featureFlags, draft, envFeatureFlags, variant);
                case 'FromApiEngineGetDiffContent':
                    return handleFromApiEngineGetDiffContent(featureFlags, draft, variant);
                default:
                    return exhaustivenessCheck(variant);
            }
        }
        case 'EngineBatchReceived_TypingsTimedOut': {
            const { peerId, typingType, timestamp } = action;
            const typings = draft.typings.get(peerId);
            if (!typings) {
                return [];
            }
            const expiredTyping = typings[typingType];
            if (!expiredTyping) {
                return [];
            }
            if (expiredTyping.updatedAt <= timestamp) {
                delete typings[typingType];
            }
            if (Object.keys(typings).length === 0) {
                draft.typings.delete(peerId);
            }
            return [];
        }
        case 'UpdateMessageRequestsCounter': {
            return [
                async function ({ api }) {
                    try {
                        const trackId = IApi.resolveTrackId('messages.getCounters', 'message_requests');
                        api.dangerouslyAbort(trackId);
                        const { message_requests } = await api.fetch('messages.getCounters', {
                            filter: 'message_requests',
                            group_id: getOwnerGroupId(ownerId),
                        }, {
                            trackId,
                        });
                        return {
                            type: 'UpdateMessageRequestsCounter_RequestCompleted',
                            count: message_requests ?? 0, // Если не приходит - значит 0, нам надо обновить счетчик
                        };
                    }
                    catch {
                        return {
                            type: 'Noop',
                        };
                    }
                },
            ];
        }
        case 'UpdateMessageRequestsCounter_RequestCompleted': {
            Filters.updateCounters(draft.organisers.filters, {
                messageRequests: action.count,
            });
            return [];
        }
        case 'RefetchFoldersRequest_RequestCompleted': {
            const { apiFolders, folderId } = action;
            if (featureFlags.vkm_get_folderinfo_before_add) {
                const apiFolderToAdd = apiFolders.items.find((apiFolder) => apiFolder.id === folderId);
                if (apiFolderToAdd) {
                    const folderToAdd = fromApiFolder(apiFolderToAdd);
                    insertFolders(draft, [folderToAdd], featureFlags, envFeatureFlags);
                    const folderSubLists = apiFolderToAdd.included_lists || [];
                    const folder = draft.organisers.folders.find((f) => f.id === folderId);
                    if (folder &&
                        folder.hasSublist &&
                        featureFlags.vkm_sublists_in_folder) {
                        Folder.setSublists(folder, folderSubLists);
                        insertSublists(draft, apiFolders.included_lists_info?.map(fromApiSublist));
                        for (const [, convo] of draft.convos) {
                            /**
                             * При рефетче мы не должны учитывать фоллбечный convo,
                             * который изначально добавлен в initial
                             */
                            if (convo.peerId === Peer.resolveId()) {
                                continue;
                            }
                            Organisers.refresh(draft.organisers, convo);
                        }
                    }
                    if (folderToAdd && folderToAdd.type === 'managed_groups') {
                        Queue.addQueueId(draft.activeQueueIds, Queue.MANAGED_GROUPS_COUNTERS_QUEUE);
                        return [
                            async function reconnectQueueAndUpdateCounters({ queue }) {
                                queue.reconnect();
                                return {
                                    type: 'CountersUpdate',
                                };
                            },
                        ];
                    }
                    if (folderToAdd && folderToAdd.type === 'channels') {
                        return [
                            async function updateChannelsCounter() {
                                return {
                                    type: 'CountersUpdate',
                                };
                            },
                        ];
                    }
                    return [];
                }
            }
            const folder = draft.organisers.folders.find((f) => f.id === folderId);
            if (!folder) {
                return [];
            }
            const folderSubLists = apiFolders.items.find((f) => f.id === folderId)?.included_lists || [];
            Folder.setSublists(folder, folderSubLists);
            insertSublists(draft, apiFolders.included_lists_info?.map(fromApiSublist));
            for (const [, convo] of draft.convos) {
                /**
                 * При рефетче мы не должны учитывать фоллбечный convo,
                 * который изначально добавлен в initial
                 */
                if (convo.peerId === Peer.resolveId()) {
                    continue;
                }
                Organisers.refresh(draft.organisers, convo);
            }
            return [];
        }
        case 'RefetchEduSchedule_RequestCompleted': {
            const { userId, intervals } = action;
            if (intervals) {
                if (!userId) {
                    return [];
                }
                const existing = draft.peers.get(userId);
                if (existing && existing.kind === 'User') {
                    // на обновление всегда приходит полное расписание
                    existing.eduSchedule = {
                        ...existing.eduSchedule,
                        timezone: new Date().getTimezoneOffset() * -1,
                        intervals,
                    };
                }
            }
            return [];
        }
        case 'RefetchViewerRoles_RequestCompleted': {
            const { profiles } = action;
            insertPeers(draft, {
                apiUsers: profiles,
                apiGroups: [],
                apiContacts: [],
            }, { dangerouslyOverwrite: true });
            return [];
        }
        case 'RefetchSpaceCounters_RequestCompleted': {
            const { response } = action;
            draft.locks.spacesGetCounters = false;
            if (!response) {
                return [];
            }
            for (const counter of response.items) {
                const spaceId = Space.resolveId(counter.space_id);
                const space = draft.spaces.get(spaceId);
                if (!space) {
                    continue;
                }
                space.unreadCount = counter.unread_count;
            }
            return [];
        }
        case 'TemporaryHackForResync':
        case 'LoadChatMembers':
        case 'LoadChatInfo':
        case 'ComposerDraftsUpdateNeeded':
        case 'CountersUpdate':
        case 'VKCOMRightColumnConvosUpdated':
        case 'AddConvosToSearchIndex':
            // ВНИМАНИЕ!!!
            // Добавлять сюда другие внешние экшены не надо!
            // Обрабатывается в reducer.ts
            return [];
        default:
            return exhaustivenessCheck(action);
    }
};
/**
 * Обычная обработка эвентов из движка.
 */
function handleFromEngine(featureFlags, draft, envFeatureFlags, variant) {
    const { next, receivedMessagesStats, now } = variant;
    /**
     * Если в сторе не хватает данных их нужно дозагрузить.
     * Пока мы дозагружаем данные, мы перестаем обрабатывать апдейты из лонгполла.
     * Это нужно для того, чтобы стор всегда оставался в консистентном
     * и корректном состоянии.
     */
    if (featureFlags.vkm_missing_data_rework) {
        const missing = collectMissingData(featureFlags, draft, variant.next);
        if (missing.cmidsByPeerId.size > 0 ||
            missing.convoPeerIds.size > 0 ||
            missing.userPeerIds.size > 0 ||
            missing.groupPeerIds.size > 0 ||
            missing.contactPeerIds.size > 0 ||
            missing.incognitoMemberIdsByChatId.size > 0) {
            return [fetchMissingData(next, draft.ownerId, now, missing)];
        }
    }
    else {
        if (isDataMissing(featureFlags, draft, next)) {
            return [loadMissingData(draft.convoConn.pts, next, draft.ownerId, now)];
        }
    }
    draft.convoConn.reconnectAttempts = 0;
    // Попадаем сюда только если у нас в сторе есть все нужные данные
    return [
        ...handleUpdates(featureFlags, draft, envFeatureFlags, next, now),
        addMessageReceivedEventData(receivedMessagesStats),
    ];
}
/**
 * Ресинк
 */
function handleFromEngineFailure(featureFlags, draft, envFeatureFlags, variant) {
    const { now } = variant;
    const pts = draft.convoConn.pts;
    const ownerId = draft.ownerId;
    draft.convoConn.status = 'resyncing';
    const reconnectAttempts = draft.convoConn.reconnectAttempts++;
    let chatIdsToUpdateMembers;
    if (featureFlags.vkm_resync_glph_replacement) {
        chatIdsToUpdateMembers = Array.from(draft.convos.values()).reduce((acc, convo) => {
            if (convo.kind !== 'ChatConvo') {
                return acc;
            }
            if (convo.members.members.size === 0) {
                /**
                 * Если мы никогда не грузили список участников чата,
                 * то и ресинкать его не будем. Загрузим при заходе в чат.
                 */
                return acc;
            }
            /**
             * Будем накатывать обновления списка участников только в открытых
             * чатах. В остальных просто почистим список.
             */
            const opened = draft.locks.convosCleanup.get(convo.peerId);
            if (!opened) {
                ChatMembers.resetMembers(convo.members);
                return acc;
            }
            return [...acc, convo.peerId];
        }, []);
    }
    /**
     * Здесь возвращается две функции-экшена, но отработает лишь одна,
     * так как в обеих присутствует взаимозаменяемая проверка.
     *
     * Сделано так на время существования ручки vkm_resync_glph_replacement.
     */
    return [
        async function resyncGetDiff({ api, engine, logger }) {
            if (!featureFlags.vkm_resync_glph_replacement) {
                return {
                    type: 'Noop',
                };
            }
            // Не будем спамить АПИ, подождем чуть-чуть для ресинка.
            // Иначе в случае постоянных разрывов лп мы будем перезапрашивать
            // getDiff как бешеные.
            const timeout = Math.min(2 ** reconnectAttempts * 500, 10 * 1000);
            await sleep(timeout);
            let { conversationLimit } = featureFlags.vkm_resync_glph_replacement;
            /**
             * В админке можно любое значение засетить, ввиду чего
             * на всякий случай проверим, что значение не больше 200 и не меньше 1
             * и что оно в целом валидное.
             */
            conversationLimit = Math.min(Math.max(Number(conversationLimit) || 200, 1), 200);
            const groupId = getOwnerGroupId(ownerId);
            const isForUser = groupId === 0;
            let response;
            try {
                response = await api.fetch('messages.getDiff', {
                    group_id: groupId,
                    from_version: pts,
                    /**
                     * Используем здесь значение, которое можно изменить
                     * в рамках тоггла. Нужно это для управления
                     * количеством бесед, которые можем запросить в рамках
                     * одного getDiff (без дозагрузки дополнительных страниц с данными).
                     */
                    conversations_limit: conversationLimit,
                    /**
                     * Передаем в первом запросе, чтобы получить креды от ЛП.
                     */
                    lp_version: engine.version,
                    extended_filters: [
                        'credentials',
                        'server_version',
                        'profiles',
                        'contacts',
                        'counters',
                        'groups',
                        'messages',
                        ...(isForUser ? ['folders', 'folders_with_peers'] : []),
                    ].join(','),
                    /**
                     * Ограничивает уровень вложенности сообщений
                     */
                    ...(featureFlags.vkm_nested_level_messages && {
                        nested_limit: 2,
                    }),
                    counter_filters: 'all',
                    ...(isForUser && {
                        supported_types: Folder.getSupportedTypes(featureFlags, envFeatureFlags),
                    }),
                }, {
                    retries: Infinity,
                });
            }
            catch (error) {
                logger.error('Ошибка апи от messages.getDiff', error);
                return {
                    type: 'Noop',
                };
            }
            if (response.invalidate_all) {
                /**
                 * Если пришел invalidateAll при ресинке данных
                 * из getDiff, то это значит, что случилась огромная пропасть
                 * между локальным pts и том, что на сервере. Метод не может
                 * собрать данных для обновления клиента и мы форсированно
                 * сбрасываем кэш и перезагружаемся с нуля.
                 *
                 * TODO: После работ https://jira.mvk.com/browse/ME-56059
                 * здесь будет внесен механизм перезаписи кэша с нуля через getDiff.
                 * А на данный момент просто рефрешим страницу.
                 */
                window.location.reload();
                return {
                    type: 'Noop',
                };
            }
            const newPts = response.server_version;
            if (!response.credentials || !newPts) {
                throw new Error('В ответе getDiff с credentials отсутствуют новые креды или pts!');
            }
            /**
             * Собираем массив из сущностей со всех страниц, чтобы потом по нему
             * проитерироваться и применить все изменения.
             */
            const apiEntities = [
                {
                    apiConversationsInfo: response.conversations_info,
                    apiUsers: response.profiles,
                    apiGroups: response.groups,
                    apiContacts: response.contacts,
                },
            ];
            /**
             * Это строковый показатель, сигнализиурющий о том,
             * что страницы (количество бесед) были загружены
             * не все и есть те, что необходимо догрузить.
             */
            let conversationSource = response.conversations_source;
            while (conversationSource) {
                try {
                    const nextPageResponse = await api.fetch('messages.getDiff', {
                        group_id: getOwnerGroupId(ownerId),
                        /**
                         * Указываем старый pts, что был и в первом запросе,
                         * а также полученную из первого запроса версию сервера,
                         * чтобы догрузить консистентные данные.
                         */
                        from_version: pts,
                        to_version: newPts,
                        /**
                         * Передаем строковый параметр, чтобы бэкенд смог
                         * на основе него отсчитать сколько бесед нам осталось
                         * догрузить, а сколько мы уже загрузили.
                         */
                        conversations_source: conversationSource,
                        conversations_limit: conversationLimit,
                        /**
                         * Фильтры отличаются, потому что догружаем
                         * только те сущности, что не влезли в первую страницу.
                         */
                        extended_filters: [
                            'profiles',
                            'contacts',
                            'groups',
                            'messages',
                        ].join(','),
                        /**
                         * Ограничивает уровень вложенности сообщений
                         */
                        ...(featureFlags.vkm_nested_level_messages && {
                            nested_limit: 2,
                        }),
                    }, { retries: Infinity });
                    apiEntities.push({
                        apiConversationsInfo: nextPageResponse.conversations_info,
                        apiUsers: nextPageResponse.profiles,
                        apiGroups: nextPageResponse.groups,
                        apiContacts: nextPageResponse.contacts,
                    });
                    /**
                     * Если параметр не пришел, то страница последняя и цикл
                     * завершится.
                     */
                    conversationSource = nextPageResponse.conversations_source;
                }
                catch {
                    return {
                        type: 'Noop',
                    };
                }
            }
            engine.connect({
                ts: response.credentials.ts,
                server: response.credentials.server_lp,
                key: response.credentials.key,
                pts: newPts,
                featureFlags,
            });
            let apiMembersDiff = [];
            let membersDiffResponse;
            /**
             * Если pts не поменялся, то обновлять участников чатов не имеет смысла.
             * Но это будет создавать лишнюю нагрузку на getDiffConversationMembers.
             */
            if (pts === newPts) {
                chatIdsToUpdateMembers = [];
            }
            if (chatIdsToUpdateMembers.length > 0) {
                const membersDiffParams = {
                    from_version: pts,
                    to_version: newPts,
                    peer_ids: chatIdsToUpdateMembers.join(','),
                    limit: 200,
                    group_id: groupId,
                    extended: 1,
                };
                try {
                    membersDiffResponse = await api.fetch('messages.getDiffConversationMembers', membersDiffParams, {
                        retries: 2,
                    });
                    if (membersDiffResponse.invalidate || membersDiffResponse.diff) {
                        apiMembersDiff.push(membersDiffResponse);
                    }
                }
                catch {
                    apiMembersDiff = 'failed';
                }
                let membersSource = membersDiffResponse?.source;
                while (apiMembersDiff !== 'failed' && membersSource) {
                    try {
                        const nextPageMembersResponse = await api.fetch('messages.getDiffConversationMembers', { ...membersDiffParams, source: membersSource }, { retries: 2 });
                        if (nextPageMembersResponse.invalidate ||
                            nextPageMembersResponse.diff) {
                            apiMembersDiff.push(nextPageMembersResponse);
                        }
                        membersSource = nextPageMembersResponse.source;
                    }
                    catch {
                        apiMembersDiff = 'failed';
                    }
                }
            }
            return {
                type: 'EngineBatchReceived',
                variant: {
                    kind: 'FromApiEngineGetDiff',
                    apiEntities,
                    apiCounters: response.counters,
                    apiFolders: response.folders,
                    chatIdsToUpdateMembers,
                    apiMembersDiff,
                    newPts,
                },
            };
        },
        async function resyncGLPH({ api, engine, queue, logger, channelWSEngine }) {
            if (featureFlags.vkm_resync_glph_replacement) {
                return {
                    type: 'Noop',
                };
            }
            // Не будем спамить АПИ, подождем чуть-чуть для ресинка.
            // Иначе в случае постоянных разрывов лп мы будем перезапрашивать
            // gLPH как бешеные.
            const timeout = Math.min(2 ** reconnectAttempts * 500, 10 * 1000);
            await sleep(timeout);
            let responseGLPH, responseCounters;
            // Хотя количество ретраев у этого вызова бесконечное, он
            // все равно может сфейлится при аборте.
            // Такой аборт случается при рефреше страницы в браузере
            // и спамит ошибкам в Сентри.
            // Поэтому схендлим этот кейс, чтобы их избежать.
            try {
                // Тут критично использовать именно fetchSeq, а не fetchMany,
                // чтобы случайно не пропустить эвенты лонгполла.
                ;
                [responseGLPH, responseCounters] = await api.fetchSeq([
                    {
                        method: 'messages.getLongPollHistory',
                        params: {
                            lp_version: engine.version,
                            credentials: 1,
                            pts,
                            /**
                             * Параметры ниже выглядят как магические константы,
                             * потому что они такие и есть.
                             * Они были выведены эмпирическим путем на iOS,
                             * а сюда просто скопированы оттуда.
                             */
                            msgs_limit: 1100,
                            events_limit: 1100,
                            last_n: 1000,
                            extended: 1,
                            group_id: getOwnerGroupId(ownerId),
                        },
                    },
                    {
                        method: 'messages.getCounters',
                        params: {
                            filter: 'all',
                            group_id: getOwnerGroupId(ownerId),
                        },
                    },
                ], { retries: Infinity });
            }
            catch (error) {
                logger.error('Ошибка апи от messages.getLongPollHistory', error);
                return {
                    type: 'Noop',
                };
            }
            /**
             * Если pts, который есть у нас, меньше, чем pts начала серии,
             * значит прошло слишком много эвентов и мы не можем просто ресинкнуться из истории событий.
             * Нужно ресинкать состояние целиком.
             */
            if (pts < (responseGLPH.from_pts || 0)) {
                queue.disconnect();
                channelWSEngine?.disconnect();
                console.error('Выполняется полный ресинк');
                return {
                    type: 'TemporaryHackForResync',
                };
            }
            if (!responseGLPH.credentials || !responseGLPH.credentials.pts) {
                throw new Error('В ответе getLongPollHistory отсутствуют новые креды!');
            }
            engine.connect({
                ...responseGLPH.credentials,
                pts: responseGLPH.credentials.pts,
                featureFlags,
            });
            return {
                type: 'EngineBatchReceived',
                variant: {
                    kind: 'FromApiEngineHistory',
                    apiMessages: responseGLPH.messages?.items || [],
                    apiConvos: responseGLPH.conversations || [],
                    apiUsers: responseGLPH.profiles || [],
                    apiGroups: responseGLPH.groups || [],
                    apiContacts: responseGLPH.contacts || [],
                    apiCounters: responseCounters,
                    next: {
                        kind: 'Batch',
                        pts: responseGLPH.credentials.pts,
                        ts: responseGLPH.credentials.ts,
                        /**
                         * Тут мы никак не сможем обойтись без as,
                         * если только не воспользуемся декодингом.
                         * Поэтому в виде исключения используем каст.
                         */
                        updates: (responseGLPH.history || []),
                    },
                    now,
                },
            };
        },
    ];
}
function convertDiffFlags(flags) {
    /**
     * Если появился новый флаг, нужно добавить его сюда
     */
    const mapping = {
        isDeleted: 0,
        isEdited: 1,
        isPlayed: 2,
        isExpired: 3,
        wasRestored: 4,
        isImportant: 5,
        isUnimportant: 6,
    };
    /**
     * Тайпскрипт не может определить перегрузку, помогаем ему
     */
    return typeof flags === 'number'
        ? getFlagValueByBitOffset(flags, mapping)
        : getFlagValueByBitOffset(flags, mapping);
}
function handleFromApiEngineGetDiff(featureFlags, draft, envFeatureFlags, variant) {
    const { apiEntities, apiFolders, apiCounters, chatIdsToUpdateMembers, apiMembersDiff = [], newPts, } = variant;
    let chatIdsToInvalidateMembers = [];
    if (apiMembersDiff === 'failed') {
        chatIdsToInvalidateMembers = chatIdsToUpdateMembers;
    }
    else {
        for (const { diff: membersDiff = [], profiles: apiUsers = [], groups: apiGroups = [], contacts: apiContacts = [], invalidate: invalidateAll, } of apiMembersDiff) {
            if (invalidateAll) {
                /**
                 * Если пришел invalidate для страницы диффа, то это единственная
                 * страница и других данных нет. Добавляем айди чатов, чтобы
                 * сбросить в них участников.
                 */
                chatIdsToInvalidateMembers.push(...chatIdsToUpdateMembers);
                break;
            }
            insertPeers(draft, { apiUsers, apiGroups, apiContacts }, {
                dangerouslyOverwrite: true,
            });
            membersDiff.forEach(({ peer_id: chatId, in_items: inItems = [], out_members: outMembers = [], out_incognitos: outIncognitos = [], incognito_members: incognitoMembers = [], invalidate: invalidateChatMembers, }) => {
                const convo = draft.convos.get(Peer.resolveId(chatId));
                if (!convo ||
                    convo.kind !== 'ChatConvo' ||
                    convo.members.members.size === 0) {
                    return;
                }
                if (invalidateChatMembers) {
                    chatIdsToInvalidateMembers.push(convo.peerId);
                    return;
                }
                insertChatMembers(convo.members, inItems, incognitoMembers);
                for (const outMemberIdRaw of outMembers) {
                    const outMemberId = Peer.resolveId(outMemberIdRaw);
                    if (!Peer.isUserPeerId(outMemberId) &&
                        !Peer.isGroupPeerId(outMemberId)) {
                        continue;
                    }
                    if (outMemberId === draft.ownerId) {
                        Convo.changeUserState(convo, 'left');
                    }
                    if (ChatMembers.isAdmin(convo.members, outMemberId)) {
                        ChatMembers.unsetAdmin(convo.members, outMemberId);
                    }
                    ChatMembers.removeMember(convo.members, outMemberId);
                }
                for (const outIncognitoId of outIncognitos) {
                    const incognitoId = ChatMembers.resolveIncognitoMemberId(outIncognitoId);
                    const incognitoMember = ChatMembers.getIncognitoMember(convo.members, incognitoId);
                    if (incognitoMember?.memberId) {
                        ChatMembers.removeMember(convo.members, incognitoMember.memberId);
                    }
                    ChatMembers.removeIncognitoMember(convo.members, incognitoId);
                }
            });
        }
    }
    /**
     * Сбрасываем кэш участников для открытых чатов, по которым пришел invalidate.
     * Ниже в эффектах перезагружаем участников с нуля для открытых чатов.
     */
    chatIdsToInvalidateMembers.forEach((chatId) => {
        const convo = draft.convos.get(chatId);
        if (convo && convo.kind === 'ChatConvo') {
            ChatMembers.resetMembers(convo.members);
        }
    });
    /**
     * Текст сообщений может измениться, сообщение восстановиться,
     * флаги сообщений поменяться или появиться реакции. За такими сообщениями
     * нужно дополнительно сходить в API. В список ниже попадут все cmid
     * сообщений, которые есть у нас в кэше сообщений и которые мы хотим
     * обновить. Метод getDiff вернет нам вообще все изменения, но загрузим
     * мы лишь те, что мы хотим обновить у себя.
     */
    const cmidsToFetch = new Map();
    /**
     * Список cmid сообщений, которые есть в кэше и по которым нужно произвести
     * удаления локальные + в композере.
     */
    const cmidsToRemove = new Map();
    for (const { apiConversationsInfo = [], apiUsers = [], apiGroups = [], apiContacts = [], } of apiEntities) {
        apiConversationsInfo.forEach(({ conversation, message, invalidate: invalidateHistory, 
        /**
         * В cmidsFlags лежат точечные изменения сообщений. Приходят флаги, являющиеся
         * смещением битов, обрабатываем их схожим образом, как делаем это с флагами
         * сообщений.
         */
        cmids_flags: cmidsFlags = [], 
        /**
         * Рэнджи - это массив из первого включения и последнего,
         * представляющее из себя оптимизацию по количеству передаваемых
         * данных. Если юзер удалит 100500 сообщений подряд, то придут
         * cmid начала удаления и последнего удаления, вместо 100500 cmid.
         */
        range_deleted_cmids: rangeDeletedCmids = [], range_updated_cmids: rangeUpdatedCmids = [], cmids_updated_reactions: cmidsUpdatedReactions = [], }) => {
            if (!conversation) {
                return;
            }
            const peerId = Peer.resolveId(conversation.peer.id);
            const isNotCached = !draft.convos.has(peerId);
            insertConvos(draft, [
                {
                    conversation,
                    last_message: message?.[0],
                },
            ], featureFlags, {
                dangerouslyMerge: true,
                shouldUpdateSortId: true,
                invalidateHistory,
            });
            const convo = draft.convos.get(peerId);
            if (!convo) {
                /**
                 * Мы только что инсертнули конву. Не быть ее не может,
                 * но тайпскрипт об этом не знает, ввиду чего существует
                 * эта проверка.
                 */
                return;
            }
            /**
             * Если конвы не было в кэше, или ее нужно инвалидировать,
             * то нет смысла накатывать апдейты дальше по коду
             */
            if (isNotCached || invalidateHistory) {
                return;
            }
            const deletedCmids = new Set();
            const restoredCmids = new Set();
            /**
             * Добавляем к списку с обновленными сообщениями еще и массив
             * с обновлениями реакций, чтобы обновить все и сразу.
             *
             * У сообщения могли появиться реакции + оно могло быть изменено,
             * поэтому используем Set.
             */
            const updatedCmids = new Set(cmidsUpdatedReactions.map(Message.resolveCmid));
            /**
             * Собираем списки с обновленными cmid, чтобы проверить на наличие в кэше
             * и удалить/запросить из апи, чтобы обновить.
             */
            cmidsFlags.forEach(({ cmid: rawCmid, updated_flags: flags }) => {
                const cmid = Message.resolveCmid(rawCmid);
                const { isDeleted, isPlayed, isEdited, wasRestored, isExpired, isImportant, isUnimportant, } = convertDiffFlags(flags);
                if (isDeleted) {
                    deletedCmids.add(cmid);
                }
                /**
                 * Здесь мы проходимся по списку апдейтов флагов сообщений, которые
                 * мы можем применить без походов в API. В данный момент это
                 * прослушивание сообщения и добавление сообщения в избранные.
                 *
                 * Проверять сообщение на наличие в кэше не нужно, так как проверка
                 * есть в самом методе updateMessageFlags.
                 */
                if (isPlayed || isImportant || isUnimportant) {
                    const pow = isPlayed
                        ? Message.MESSAGE_FLAGS.isPlayed
                        : Message.MESSAGE_FLAGS.isImportant;
                    const variant = isUnimportant ? 'unset' : 'set';
                    /**
                     * Транслируем апдейт в смещение бита для флага сообщения.
                     */
                    Convo.updateMessageFlags(convo, cmid, variant, 2 ** pow);
                }
                if (isEdited || isExpired) {
                    updatedCmids.add(cmid);
                }
                /**
                 * Обрабатываем отдельным кейсом, так как этих данных
                 * точно нет в кэше и мы обязаны за ними сходить в апи
                 */
                if (wasRestored) {
                    restoredCmids.add(cmid);
                }
            });
            const { deletedCmidsInCache, updatedCmidsInCache } = convo.history.confirmed.reduce((acc, node) => {
                if (node.kind === 'GapNode') {
                    return acc;
                }
                const message = node.kind === 'DeletedNode' ? node.restorable : node.item;
                /**
                 * Локальное удаление сообщения + добавление cmid в список
                 * на очищение композера
                 */
                if (deletedCmids.has(message.cmid)) {
                    acc.deletedCmidsInCache.add(message.cmid);
                }
                for (const { min, max } of rangeDeletedCmids) {
                    if (message.cmid >= min && message.cmid <= max) {
                        acc.deletedCmidsInCache.add(message.cmid);
                        break;
                    }
                }
                /**
                 * После проверки на наличие сообщения в кэше понимаем,
                 * что за сообщением нужно сходить в апи. Добавляем в список cmid.
                 */
                if (updatedCmids.has(message.cmid)) {
                    acc.updatedCmidsInCache.add(message.cmid);
                }
                for (const { min, max } of rangeUpdatedCmids) {
                    if (message.cmid >= min && message.cmid <= max) {
                        acc.updatedCmidsInCache.add(message.cmid);
                        break;
                    }
                }
                return acc;
            }, {
                deletedCmidsInCache: new Set(),
                updatedCmidsInCache: new Set(),
            });
            Array.from(restoredCmids).forEach((cmid) => {
                const { status } = Convo.findHistoryNodeByCmid(convo, cmid);
                if (status === 'NotLoaded') {
                    return;
                }
                /**
                 * Восстанавливаем удаленные сообщения
                 */
                updatedCmidsInCache.add(cmid);
            });
            if (deletedCmidsInCache.size > 0) {
                const deletedCmidsArray = Array.from(deletedCmidsInCache);
                deletedCmidsArray.forEach((cmid) => {
                    const message = Convo.findMessageByCmid(convo, cmid);
                    if (!message) {
                        return;
                    }
                    Convo.deleteMessage(convo, message, { isRestorable: false });
                });
                /**
                 * Для экшенов драфта композера
                 */
                cmidsToRemove.set(peerId, deletedCmidsArray);
            }
            if (updatedCmidsInCache.size > 0) {
                cmidsToFetch.set(peerId, Array.from(updatedCmidsInCache));
            }
        });
        insertPeers(draft, { apiUsers, apiGroups, apiContacts }, {
            dangerouslyOverwrite: true,
        });
    }
    if (apiFolders) {
        if (featureFlags.vkm_sublists_in_folder) {
            insertSublists(draft, apiFolders.included_lists_info?.map(fromApiSublist));
        }
        const folders = apiFolders.items.map(fromApiFolder);
        /**
         * Если запрашиваем папки в getDiff, то возвращается весь
         * актуальный список папок, ввиду чего полностью все затираем
         */
        insertFolders(draft, folders, featureFlags, envFeatureFlags, {
            dangerouslyOverwrite: true,
        });
    }
    if (apiCounters) {
        draft.activeCallsCount = apiCounters.calls || 0;
        Filters.updateCounters(draft.organisers.filters, {
            unread: apiCounters.messages || 0,
            unreadUnmuted: apiCounters.messages_unread_unmuted || 0,
            headerNotMutedUnread: 0,
            archive: apiCounters.messages_archive_unread || 0,
            archiveMentions: apiCounters.messages_archive_mentions_count || 0,
            archiveTotal: apiCounters.messages_archive || 0,
            messageRequests: apiCounters.message_requests || 0,
            businessNotify: apiCounters.business_notify || 0,
            businessNotifyTotal: apiCounters.business_notify_all || 0,
            adTag: apiCounters.ad_tag || 0,
            important: apiCounters.important || 0,
            unanswered: apiCounters.unanswered || 0,
        });
        apiCounters.messages_folders?.forEach((counter) => {
            Folder.setUnreadCounters(draft.organisers.folders, Folder.resolveId(counter.folder_id), counter.total_count, counter.unmuted_count);
        });
        if (featureFlags.vkm_managed_groups_mute_unmute) {
            // Для папки СС каунтеры лежат в другом месте (apiCounters.groups_folder)
            Folder.setManagedGroupsFolderCounter(draft.organisers.folders, apiCounters.groups_folder?.dialogs_count || 0, apiCounters.groups_folder?.dialogs_count_unmuted || 0);
        }
        else {
            const totalManagedGroupsFolderCounter = ManagedGroup.getUnreadTotalCount(draft.managedGroups);
            Folder.setManagedGroupsFolderCounter(draft.organisers.folders, totalManagedGroupsFolderCounter, totalManagedGroupsFolderCounter);
        }
    }
    const isPtsChanged = draft.convoConn.pts !== newPts;
    draft.convoConn.status = 'running';
    draft.convoConn.pts = newPts;
    const ownerId = draft.ownerId;
    return [
        pollEngine(),
        isPtsChanged && featureFlags.vkm_prds && refetchSpaceCounters(draft),
        isPtsChanged &&
            async function updateTitle() {
                return {
                    type: 'CountersUpdate',
                };
            },
        /**
         * Идем в апи за сообщениями, по которым есть апдейты.
         */
        async function fetchUpdatedMessages({ api }) {
            if (!cmidsToFetch.size) {
                return {
                    type: 'Noop',
                };
            }
            let response;
            try {
                response = await api.fetch('messages.getDiffContent', {
                    conversation_messages: JSON.stringify(Array.from(cmidsToFetch).map(([peerId, cmids]) => ({
                        peer_id: peerId,
                        updated_cmids: cmids,
                    }))),
                    extended: 1,
                    group_id: getOwnerGroupId(ownerId),
                }, {
                    retries: Infinity,
                });
            }
            catch {
                return {
                    type: 'Noop',
                };
            }
            const apiMessagesByPeerId = response.items.reduce((acc, { requested_messages: requestedMessages, peer_id: rawPeerId }) => {
                if (!requestedMessages?.length) {
                    return acc;
                }
                const peerId = Peer.resolveId(rawPeerId);
                const existing = acc.get(peerId);
                if (existing) {
                    existing.push(...requestedMessages);
                }
                else {
                    acc.set(peerId, requestedMessages);
                }
                return acc;
            }, new Map());
            return {
                type: 'EngineBatchReceived',
                variant: {
                    kind: 'FromApiEngineGetDiffContent',
                    apiMessagesByPeerId,
                    apiUsers: response.profiles,
                    apiGroups: response.groups,
                    apiContacts: response.contacts,
                },
            };
        },
        /**
         * Не забываем про апдейты драфта композера после удаления
         * сообщений из кэша.
         */
        ...Array.from(cmidsToRemove.entries()).map(([peerId, cmids]) => async function () {
            return {
                type: 'ComposerDraftsUpdateNeeded',
                peerId,
                foreignKind: "message" /* ComposerDraft.ForwardKind.Message */,
                itemsToDelete: cmids.map((cmid) => ({
                    peerId,
                    cmid,
                })),
            };
        }),
        /**
         * Если getDiffConversationMembers вернул нам для некоторых чатов invalidate = true,
         * то для таких запрошенных чатов (т.е. открытых в данных момент),
         * перезапросим их участников с нуля.
         */
        ...chatIdsToInvalidateMembers.map((peerId) => async function loadChatMembers() {
            return {
                type: 'LoadChatMembers',
                peerId,
            };
        }),
    ];
}
function handleFromApiEngineGetDiffContent(featureFlags, draft, variant) {
    const { apiMessagesByPeerId, apiUsers = [], apiGroups = [], apiContacts = [], } = variant;
    insertPeers(draft, { apiUsers, apiGroups, apiContacts });
    const composerDraftUpdateActions = Array.from(apiMessagesByPeerId?.entries() || []).reduce((actionData, [peerId, apiMessages]) => {
        const { itemsToDelete, itemsToReplace } = apiMessages.reduce((acc, apiMessage) => {
            const { message, mentions } = fromApiMessage(featureFlags, apiMessage);
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return acc;
            }
            const { status } = Convo.findHistoryNodeByCmid(convo, message.cmid);
            const wasDeleted = status === 'Deleted';
            /**
             * Если сообщение удалено, значит его восстановили
             */
            if (wasDeleted) {
                Convo.restoreMessage(convo, message, mentions.hasDirect || mentions.hasMass);
            }
            else {
                Convo.replaceMessage(convo, message, mentions.hasDirect || mentions.hasMass);
            }
            if (message.kind === 'Expired') {
                /**
                 * Исчезающие сообщения можно только реплаить, и нельзя форвардить,
                 * поэтому заменяем только реплаи.
                 */
                Convo.replaceExpiredReplies(convo, message.cmid);
                acc.itemsToDelete = [
                    ...acc.itemsToDelete,
                    {
                        peerId,
                        cmid: message.cmid,
                    },
                ];
            }
            if (message.kind === 'Normal' && !wasDeleted) {
                acc.itemsToReplace = [...acc.itemsToReplace, message];
            }
            return acc;
        }, { itemsToDelete: [], itemsToReplace: [] });
        if (itemsToDelete.length > 0 || itemsToReplace.length > 0) {
            actionData = [
                ...actionData,
                {
                    peerId,
                    itemsToDelete,
                    itemsToReplace,
                },
            ];
        }
        return actionData;
    }, []);
    return [
        ...composerDraftUpdateActions.map(({ peerId, itemsToDelete, itemsToReplace }) => async function () {
            return {
                type: 'ComposerDraftsUpdateNeeded',
                peerId,
                foreignKind: "message" /* ComposerDraft.ForwardKind.Message */,
                itemsToDelete,
                itemsToReplace,
            };
        }),
    ];
}
/**
 * Обработка вставки недостающих данных в кэш
 * с последующей обработкой эвентов из движка.
 */
function handleFromEngineWithMissingData(featureFlags, draft, envFeatureFlags, variant) {
    const { apiConvos, apiMessages, apiUsers, apiGroups, apiContacts, apiIncognitoMembers, now, } = variant;
    const apiExtended = optimizeExtended(apiMessages, apiConvos);
    insertConvos(draft, apiConvos.map((apiConvo) => ({
        conversation: apiConvo,
        last_message: apiExtended.messagesByPeerId
            .get(apiConvo.peer.id)
            ?.get(apiConvo.last_conversation_message_id || 0),
    })), featureFlags, { dangerouslyMerge: true });
    insertPeers(draft, { apiUsers, apiGroups, apiContacts }, { dangerouslyOverwrite: featureFlags.vkm_conditional_peer_update });
    insertIncognitoMembers(draft, apiIncognitoMembers);
    /**
     * Заново обрабатываем апдейты, уже имея все данные в сторе.
     * Тут есть один инвариант - мы ожидаем, что после первого прохода
     * загрузили все недостающие данные.
     */
    return handleUpdates(featureFlags, draft, envFeatureFlags, variant.skippedBatch, now, apiExtended);
}
/**
 * Обработка данных и эвентов, полученных из АПИ.
 */
function handleFromApiEngineHistory(featureFlags, draft, envFeatureFlags, variant) {
    const { next, apiMessages, apiConvos, apiUsers, apiGroups, apiContacts, apiCounters, now, } = variant;
    const apiExtended = optimizeExtended(apiMessages, apiConvos);
    // Вставляем потенциально недостающие данные в кэш
    insertConvos(draft, apiConvos.map((apiConvo) => ({
        conversation: apiConvo,
        last_message: apiExtended.messagesByPeerId
            .get(apiConvo.peer.id)
            ?.get(apiConvo.last_conversation_message_id || 0),
    })), featureFlags, { dangerouslyMerge: true });
    insertPeers(draft, { apiUsers, apiGroups, apiContacts }, {
        /**
         * Ресинк происходит редко, поэтому можем себе позволить
         * полностью перезаписать пиров.
         * Это вызовет большой ререндер, но одноразовый.
         */
        dangerouslyOverwrite: true,
    });
    draft.activeCallsCount = apiCounters.calls || 0;
    Filters.updateCounters(draft.organisers.filters, {
        unread: apiCounters.messages || 0,
        unreadUnmuted: apiCounters.messages_unread_unmuted || 0,
        headerNotMutedUnread: 0,
        archive: apiCounters.messages_archive_unread || 0,
        archiveMentions: apiCounters.messages_archive_mentions_count || 0,
        archiveTotal: apiCounters.messages_archive || 0,
        messageRequests: apiCounters.message_requests || 0,
        businessNotify: apiCounters.business_notify || 0,
        businessNotifyTotal: apiCounters.business_notify_all || 0,
        adTag: apiCounters.ad_tag || 0,
        important: apiCounters.important || 0,
        unanswered: apiCounters.unanswered || 0,
    });
    apiCounters.messages_folders?.forEach((counter) => {
        Folder.setUnreadCounters(draft.organisers.folders, Folder.resolveId(counter.folder_id), counter.total_count, counter.unmuted_count);
    });
    if (featureFlags.vkm_managed_groups_mute_unmute) {
        // Для папки СС каунтеры лежат в другом месте (apiCounters.groups_folder)
        Folder.setManagedGroupsFolderCounter(draft.organisers.folders, apiCounters.groups_folder?.dialogs_count || 0, apiCounters.groups_folder?.dialogs_count_unmuted || 0);
    }
    else {
        const totalManagedGroupsFolderCounter = ManagedGroup.getUnreadTotalCount(draft.managedGroups);
        Folder.setManagedGroupsFolderCounter(draft.organisers.folders, totalManagedGroupsFolderCounter, totalManagedGroupsFolderCounter);
    }
    return [
        ...handleUpdates(featureFlags, draft, envFeatureFlags, next, now, apiExtended),
        featureFlags.vkm_prds && refetchSpaceCounters(draft),
        async function updateCounters() {
            return { type: 'CountersUpdate', idleCounter: 0 };
        },
    ];
}
function handleUpdates(featureFlags, draft, envFeatureFlags, next, now, apiExtended) {
    draft.convoConn.status = 'running';
    draft.convoConn.pts = next.pts;
    const effects = next.updates.flatMap((update) => {
        switch (update[0]) {
            case 10:
            case 11:
            case 12:
                return update10to12(draft, update);
            case 20:
                return update20(draft, update);
            case 21:
                return update21(draft, update);
            case 23:
                return update23(draft, update);
            case 24:
                return update24(draft, update);
            case 52:
                return update52(draft, update, featureFlags, apiExtended);
            case 63:
            case 64:
            case 65:
            case 66:
            case 67:
            case 68:
                return update63to68(draft, update);
            case 80:
                return update80(draft, update);
            case 91:
                return update91(draft, update, now);
            case 114:
                return update114(draft, update);
            case 115:
                return update115(draft, update);
            case 119:
                return update119(draft, update);
            case 120:
                return update120(draft, update);
            case 121:
                return update121(draft, update, featureFlags);
            case 122:
                return update122(draft, update);
            case 123:
                return update123(draft, update);
            case 124:
                return update124(draft, update);
            case 201:
                return update201(draft, update);
            case 202:
                return update202(draft, update);
            case 203:
                return update203(draft, update);
            case 205:
                return update205(draft, update);
            case 10501:
            case 501:
                return update501(draft, update, featureFlags, envFeatureFlags);
            case 10502:
            case 502:
                return update502(draft, update);
            case 10503:
            case 503:
                return update503(draft, update);
            case 10504:
            case 504:
                return update504(draft, update);
            case 10505:
            case 505:
                return update505(draft, update);
            case 10506:
            case 506:
                return update506(draft, update);
            case 10507:
            case 507:
                return update507(draft, update);
            case 10508:
            case 508:
                return update508(draft, update);
            case 10509:
            case 509:
                return update509(draft, update);
            case 601:
                return update601(draft, update, featureFlags, apiExtended);
            case 602:
                return update602(draft, update);
            case 603:
                return update603(draft, update);
            case 604:
                return update604(draft, update);
            case 701:
                return update701(draft, update);
            case 10001:
            case 10002:
            case 10003:
                return update10001to10003(draft, update, featureFlags, apiExtended);
            case 10004:
            case 10005:
            case 10018:
            case 10019:
                return update10004to10005and10018to10019(draft, update, featureFlags, apiExtended);
            case 10006:
            case 10007:
                return update10006to10007(draft, update);
            case 10013:
                return update10013(draft, update, featureFlags, apiExtended);
            case 10014:
                return update10014(draft, update, featureFlags, apiExtended);
            case 80005:
                if (!featureFlags.vkm_prds) {
                    return [];
                }
                return update80005(draft, update);
            default:
                /**
                 * Ничего не делаем, просто игнорируем апдейты, которых не знаем.
                 * При этом добавляем тайпгарды, чтобы быть уверенными, что мы точно обработали все,
                 * что знаем.
                 */
                const _typeguard = update;
                return [];
        }
    });
    return [pollEngine(), ...effects];
}
export function pollEngine() {
    const now = Date.now();
    return async function pollEngine({ engine, perfStats }) {
        const next = await engine.poll();
        if (next.kind === 'Failure') {
            return {
                type: 'EngineBatchReceived',
                variant: {
                    kind: 'FromEngineFailure',
                    now,
                },
            };
        }
        const receivedMessagesStats = collectReceivedMessagesStats(next, perfStats);
        return {
            type: 'EngineBatchReceived',
            variant: {
                kind: 'FromEngineBatch',
                next,
                receivedMessagesStats,
                now,
            },
        };
    };
}
function collectReceivedMessagesStats(next, perfStats) {
    if (perfStats === undefined || next.updates.length > 10) {
        return;
    }
    const newMessageUpdates = next.updates.filter((update) => update[0] === 10004);
    if (newMessageUpdates.length !== 0) {
        /**
         * Раскомментить код ниже, чтобы понять, насколько точную стату собираем.
         */
        // window.performance.mark('reforged__message_received__LP')
        return {
            time: perfStats.getCurrentTime(),
            updates: newMessageUpdates,
        };
    }
    return;
}
function addMessageReceivedEventData(data) {
    return async function addMessageReceivedEventData({ perfStats }) {
        if (perfStats === undefined || data === undefined) {
            return { type: 'Noop' };
        }
        const { time, updates } = data;
        const peerIds = updates.reduce((peerIds, update) => {
            if (update[0] === 10004) {
                peerIds.push(Peer.resolveId(update[4]));
            }
            return peerIds;
        }, []);
        if (perfStats.getEvent(IPerfStats.EventType.receiveMessage)?.data.LP !==
            undefined) {
            perfStats.removeEvent(IPerfStats.EventType.receiveMessage);
        }
        const event = perfStats.getEvent(IPerfStats.EventType.receiveMessage);
        const eventData = {
            LPMessagesCount: peerIds.length,
            LP: time,
        };
        if (event === undefined) {
            perfStats.addEvent(IPerfStats.EventType.receiveMessage, {
                peerIds,
                data: eventData,
            });
            return { type: 'Noop' };
        }
        const eventPeerId = event.peerIds[0];
        if (eventPeerId && peerIds.includes(Peer.resolveId(eventPeerId))) {
            perfStats.addEventData(IPerfStats.EventType.receiveMessage, eventData);
        }
        return { type: 'Noop' };
    };
}
function fetchMissingData(skippedBatch, ownerId, now, { cmidsByPeerId, convoPeerIds, userPeerIds, groupPeerIds, contactPeerIds, incognitoMemberIdsByChatId, }) {
    return async function fetchMissingData({ api, logger, engine }) {
        let response;
        try {
            response = await api.fetchMany([
                cmidsByPeerId.size > 0 && {
                    method: 'messages.getDiffContent',
                    params: {
                        conversation_messages: JSON.stringify(Array.from(cmidsByPeerId).map(([peerId, cmids]) => ({
                            peer_id: peerId,
                            updated_cmids: Array.from(cmids),
                        }))),
                        extended: 1, // Для получения пиров в постах, аттачах, форвардах и реплаях
                        group_id: getOwnerGroupId(ownerId),
                    },
                },
                convoPeerIds.size > 0 && {
                    method: 'messages.getConversationsById',
                    params: {
                        peer_ids: Array.from(convoPeerIds).join(','),
                        group_id: getOwnerGroupId(ownerId),
                        extended: 1, // Для получения пира из закрепленных сообщений, пира ЛС и last_message
                        with_last_messages: 1,
                    },
                },
                userPeerIds.size > 0 && {
                    method: 'users.get',
                    params: {
                        user_ids: Array.from(userPeerIds).map(Peer.toRealId).join(','),
                    },
                },
                groupPeerIds.size > 0 && {
                    method: 'groups.getById',
                    params: {
                        group_ids: Array.from(groupPeerIds).map(Peer.toRealId).join(','),
                    },
                },
                contactPeerIds.size > 0 && {
                    method: 'messages.getContactsById',
                    params: {
                        contact_ids: Array.from(contactPeerIds)
                            .map(Peer.toRealId)
                            .join(','),
                    },
                },
                ...Array.from(incognitoMemberIdsByChatId.entries()).map(([chatId, incognitoMembersIds]) => ({
                    method: 'messages.getIncognitoMembersByIds',
                    params: {
                        peer_id: chatId,
                        incognito_member_ids: incognitoMembersIds.join(','),
                        extended: 1,
                    },
                })),
            ], { retries: Infinity });
        }
        catch (error) {
            logger.error('[fetchMissingData]', error);
            /**
             * Будем уходить в ресинк в таких случаях, иначе никогда не заполим движок снова
             */
            return {
                type: 'EngineBatchReceived',
                variant: {
                    kind: 'FromEngineMissingDataFailed',
                    now,
                },
            };
        }
        const [diffContentResponse, convos, users, groupsResponse, contacts, ...incognitoMembersResponses] = response;
        const requestedMessages = [
            ...(diffContentResponse?.items.reduce((acc, { requested_messages: requestedMessages }) => [
                ...acc,
                ...(requestedMessages ?? []),
            ], []) ?? []),
        ];
        const apiCmidsByPeerId = new Map();
        for (const apiMessage of requestedMessages) {
            let rawCmids = apiCmidsByPeerId.get(apiMessage.peer_id);
            if (!rawCmids) {
                rawCmids = new Set();
                apiCmidsByPeerId.set(apiMessage.peer_id, rawCmids);
            }
            rawCmids.add(apiMessage.conversation_message_id);
        }
        const isMessageMissing = cmidsByPeerId.size !== apiCmidsByPeerId.size ||
            Array.from(cmidsByPeerId.entries()).some(([peerId, requestedCmidsSet]) => {
                const respondedCmidsSet = apiCmidsByPeerId.get(peerId);
                if (!respondedCmidsSet) {
                    return true;
                }
                return (requestedCmidsSet.size !== respondedCmidsSet.size ||
                    [...requestedCmidsSet].some((value) => !respondedCmidsSet.has(value)));
            });
        if (isMessageMissing) {
            /**
             * Существует вероятность не получить сообщение из апи. В таком случае
             * в приложении будет отображено некорректное сообщение или "Вложение удалено".
             *
             * Причина отсутствия запрошенного сообщения в ответе от метода апи
             * кроется в работе движка по уведомлению пользователей о событии нового
             * сообщения. Более подробно в тикете ME-62077.
             *
             * В таком случае мы должны уходить в ресинк, разрывая соединение с ЛП.
             * В данном кейсе выбранное решение является ОР, аналогичным образом днный кейс обрабатывается в мобильных клиентах.
             */
            engine.disconnect();
            return {
                type: 'EngineBatchReceived',
                variant: {
                    kind: 'FromEngineMissingDataFailed',
                    now,
                },
            };
        }
        const [apiIncognitoMembers, incognitoContacts] = incognitoMembersResponses.reduce((acc, response) => {
            const { items = [], contacts = [] } = response;
            acc[0].push(...items);
            acc[1].push(...contacts);
            return acc;
        }, [[], []]);
        const apiMessages = [...requestedMessages, ...(convos?.last_messages ?? [])];
        const apiUsers = [
            ...(users ?? []),
            ...(diffContentResponse?.profiles ?? []),
            ...(convos?.profiles ?? []),
        ];
        const apiGroups = [
            ...(groupsResponse?.groups ?? []),
            ...(diffContentResponse?.groups ?? []),
            ...(convos?.groups ?? []),
        ];
        const apiContacts = [
            ...(contacts ?? []),
            ...(diffContentResponse?.contacts ?? []),
            ...(convos?.contacts ?? []),
            ...incognitoContacts,
        ];
        return {
            type: 'EngineBatchReceived',
            variant: {
                kind: 'FromEngineWithMissingData',
                apiConvos: convos?.items ?? [],
                apiMessages,
                apiUsers,
                apiGroups,
                apiContacts,
                skippedBatch,
                apiIncognitoMembers,
                now,
            },
        };
    };
}
function loadMissingData(pts, skippedBatch, ownerId, now) {
    return async function loadMissingData({ api, engine, queue, channelWSEngine, }) {
        let response;
        // Хотя количество ретраев у этого вызова бесконечное, он
        // все равно может сфейлиться при аборте.
        // Такой аборт случается при рефреше страницы в браузере
        // и спамит ошибкам в Сентри.
        // Поэтому схендлим этот кейс, чтобы их избежать.
        try {
            response = await api.fetch('messages.getLongPollHistory', {
                pts,
                lp_version: engine.version,
                /**
                 * При накате истории без установленных лимитов
                 * велик шанс наткнуться на ответ gLPH с more: true
                 * Подробнее ME-48645
                 */
                msgs_limit: 1100,
                events_limit: 1100,
                last_n: 1000,
                extended: 1,
                group_id: getOwnerGroupId(ownerId),
            }, { retries: Infinity });
        }
        catch {
            return {
                type: 'Noop',
            };
        }
        // Если pts, который есть у нас, меньше, чем pts начала серии,
        // значит прошло слишком много эвентов и мы не можем просто ресинкнуться из истории событий.
        // Нужно ресинкать состояние целиком.
        if (pts < (response.from_pts || 0)) {
            /**
             * фиксим проблему с двойным вызовом queue.poll, channelWSEngine.poll
             * https://jira.mvk.com/browse/ME-45534, https://jira.mvk.com/browse/ME-73453
             */
            queue.disconnect();
            channelWSEngine?.disconnect();
            /**
             * Точные причины возникновения этой ошибки не до конца известны,
             * но понятен корректный способ ее фикса - дозаполнять кэш без использования
             * messages.getLongPollHistory.
             * Для этого есть задача и ее нужно доделать: https://jira.mvk.com/browse/ME-39193
             */
            return { type: 'TemporaryHackForResync' };
        }
        return {
            type: 'EngineBatchReceived',
            variant: {
                kind: 'FromEngineWithMissingData',
                apiConvos: response.conversations || [],
                apiMessages: response.messages?.items || [],
                apiUsers: response.profiles || [],
                apiGroups: response.groups || [],
                /**
                 * Мы не случайно берем именно батч, полученный из лонгполла,
                 * а не тот, который пришел из АПИ.
                 *
                 * Дело в том, что взяв батч из АПИ, мы пропустим неперсистентные эвенты.
                 * Такие, например, как тайпинги.
                 *
                 * С одной стороны зачем париться? Неперсистентные эвенты не сильно
                 * важны для юзера. А с другой - это не стоит нам труда, но маленькая деталь
                 * приятная пользователю.
                 *
                 * Плюс это позволит нам безболезненно заменить дозагрузку данных
                 * с getLongPollHistory, на другие механизмы.
                 */
                skippedBatch,
                apiContacts: response.contacts || [],
                apiIncognitoMembers: response.incognito_members || [],
                now,
            },
        };
    };
}
function refetchSpaceCounters(draft) {
    if (draft.locks.spacesGetCounters) {
        return null;
    }
    draft.locks.spacesGetCounters = true;
    const spaceIds = Array.from(draft.spaces.keys());
    return async function refetchSpaceCounters({ api }) {
        try {
            return {
                type: 'RefetchSpaceCounters_RequestCompleted',
                response: await api.fetch('spaces.getCounters', {
                    space_ids: spaceIds.join(','),
                }, { retries: Infinity }),
            };
        }
        catch {
            return {
                type: 'RefetchSpaceCounters_RequestCompleted',
            };
        }
    };
}
/**
 * В целях оптимизации поиска сущностей по айдишнику
 * превращаем массив в мап.
 *
 * Делаем это, потому что коду их обработки эвентов
 * требуется доставать конкретную сущность, а не просто итерироваться.
 */
function optimizeExtended(apiMessages, apiConvos) {
    const messagesByPeerId = new Map();
    for (const apiMessage of apiMessages) {
        let messages = messagesByPeerId.get(apiMessage.peer_id);
        if (!messages) {
            messages = new Map();
            messagesByPeerId.set(apiMessage.peer_id, messages);
        }
        messages.set(apiMessage.conversation_message_id, apiMessage);
    }
    return {
        messagesByPeerId,
        convos: new Map(apiConvos.map((apiConvo) => [apiConvo.peer.id, apiConvo])),
    };
}
/**
 * Возвращает функцию-каллбэк, которая ищет сообщение в истории по локальному индентификатору
 */
function findReplyInCacheCallback(convo) {
    return function findReplyInCache(cmid) {
        const message = Convo.findMessageByCmid(convo, cmid);
        return message?.kind === 'Normal' ? message : undefined;
    };
}
/**
 * Получение айдишников сущностей, за которыми необходимо дополнительно сходить в АПИ.
 */
function collectMissingData(featureFlags, draft, next) {
    /**
     * В этой мапе нам важны лишь цмиды. Мапим мы их на беседы только
     * ради запросов апи. Беседы будем фетчить по отдельному списку.
     */
    const cmidsByPeerId = new Map();
    const convoPeerIds = new Set();
    const userPeerIds = new Set();
    const groupPeerIds = new Set();
    const contactPeerIds = new Set();
    const incognitoMemberIdsByChatId = new Map();
    const addPeerId = (peerId) => {
        switch (true) {
            case Peer.isUserPeerId(peerId):
                userPeerIds.add(peerId);
                return;
            case Peer.isGroupPeerId(peerId):
                groupPeerIds.add(peerId);
                return;
            case Peer.isContactPeerId(peerId):
                contactPeerIds.add(peerId);
                return;
            case Peer.isChatPeerId(peerId):
                /**
                 * При добавлении беседы через этот метод, он может спарситься
                 * в userPeerIds (и тд) если это личная переписка, а нам нужно именно
                 * за конвой сходить, поэтому в convoPeerIds добавляем не через
                 * этот метод, а через обращение к сету. Здесь же игнорируем.
                 */
                return;
            default:
                exhaustivenessCheck(peerId);
        }
    };
    const addCmid = (peerId, cmid) => {
        let cmids = cmidsByPeerId.get(peerId);
        if (!cmids) {
            cmids = new Set();
            cmidsByPeerId.set(peerId, cmids);
        }
        cmids.add(cmid);
    };
    for (const update of next.updates) {
        const fallenConvoPeerId = getFallenConvoMissingByUpdate(draft, update);
        if (fallenConvoPeerId !== null) {
            convoPeerIds.add(fallenConvoPeerId);
        }
        /**
         * 10004, 10005, 10018 события
         * Изменения сообщений
         */
        if (IEngine.isIncompleteUpdate(update)) {
            const [, rawCmid] = update;
            const isNewMessage = update[0] === 10004;
            const rawPeerId = isNewMessage ? update[4] : update[3];
            const peerId = Peer.resolveId(rawPeerId);
            const cmid = Message.resolveCmid(rawCmid);
            const convo = draft.convos.get(peerId);
            if (!convo && !isNewMessage) {
                /**
                 * Если это не новое сообщение и беседы у нас не было в кэше,
                 * то ничего фетчим не будем, так как смысла в этом нет.
                 */
                continue;
            }
            if (!convo) {
                /**
                 * Дофетчим конву, если отсутствовала
                 * и далее сообщение
                 */
                convoPeerIds.add(peerId);
            }
            addCmid(peerId, cmid);
            continue;
        }
        switch (update[0]) {
            case 12: {
                const [, rawPeerId, flags] = update;
                const flagsMap = Convo.convertFlags(flags);
                if (flagsMap.isAdTag || flagsMap.isImportant || flagsMap.isUnanswered) {
                    convoPeerIds.add(Peer.resolveId(rawPeerId));
                }
                break;
            }
            /*
             * Изменился majorId и minorId соответственно
             */
            case 20:
            case 21: {
                const [, rawPeerId] = update;
                const peerId = Peer.resolveId(rawPeerId);
                /**
                 * Всегда ходим за этими апдейтами, так как в случае
                 * изменения majorId - это изменение закрепленных бесед,
                 * а в случае с minorId это изменение id последнего сообщения
                 * (с сохранением minorId для исчезнувших сообщений в фантом чате).
                 */
                convoPeerIds.add(peerId);
                break;
            }
            /**
             * Изменение данных чата
             */
            case 52: {
                const [, updateType, rawPeerId, extra] = update;
                const peerId = Peer.resolveId(rawPeerId);
                const convo = draft.convos.get(peerId);
                /**
                 * Если конвы у нас в кэше нет, значит она не прогружена
                 * и отсутствует в списке чатов пользователя (возможно ее minorId
                 * давно не менялся). В этом кейсе нам подгружать ничего не нужно.
                 */
                if (!convo) {
                    break;
                }
                switch (updateType) {
                    case IEngine.ChatUpdateType.FlagsChanged:
                    case IEngine.ChatUpdateType.TitleChanged:
                    case IEngine.ChatUpdateType.AvatarChanged:
                    case IEngine.ChatUpdateType.BannerChanged:
                    case IEngine.ChatUpdateType.MessageRequestChanged:
                    case IEngine.ChatUpdateType.MessageRequestCanceled:
                    case IEngine.ChatUpdateType.MessageRequestAccepted:
                    case IEngine.ChatUpdateType.MessageRequestRejected:
                    case IEngine.ChatUpdateType.CallInProgressChanged:
                    case IEngine.ChatUpdateType.DescriptionChanged:
                    case IEngine.ChatUpdateType.KeyboardChanged:
                        convoPeerIds.add(peerId);
                        break;
                    case IEngine.ChatUpdateType.ContactJoined:
                        addPeerId(Peer.resolveId(extra));
                        break;
                    case IEngine.ChatUpdateType.UserJoined:
                    case IEngine.ChatUpdateType.UserLeft:
                    case IEngine.ChatUpdateType.UserKicked: {
                        const targetPeerId = Peer.resolveId(extra);
                        if (convo.kind === 'ChatConvo' &&
                            convo.members.memberIds.size !== 0) {
                            /**
                             * Если список участников чата никогда не открывался,
                             * то нет смысла его пополнять. При взаимодействии с этим чатом,
                             * участники подгрузятся сами, а для отображения пира в сервисном
                             * сообщении, мы сходим за данными в 10004 событии.
                             */
                            if (!draft.peers.has(targetPeerId)) {
                                addPeerId(targetPeerId);
                            }
                        }
                        /**
                         * Если текущий пользователь возвращается в беседу, то запрашиваем данные,
                         * так как у вышедших/исключенных пользователей данные о беседе неполные
                         */
                        if (updateType === IEngine.ChatUpdateType.UserJoined &&
                            targetPeerId === draft.ownerId) {
                            convoPeerIds.add(peerId);
                        }
                        break;
                    }
                    case IEngine.ChatUpdateType.IncognitoJoined:
                        if (convo.kind !== 'ChatConvo' ||
                            convo.members.memberIds.size === 0) {
                            break;
                        }
                        const incognitoMemberIds = incognitoMemberIdsByChatId.get(convo.peerId) || [];
                        incognitoMemberIdsByChatId.set(convo.peerId, [
                            ...incognitoMemberIds,
                            ChatMembers.resolveIncognitoMemberId(extra),
                        ]);
                        break;
                    case IEngine.ChatUpdateType.Pinned: {
                        const [, , rawPeerId, rawCmid] = update;
                        /**
                         * Если 0, значит сообщение было откреплено и перезапрос данных не нужен
                         */
                        if (rawCmid === 0) {
                            break;
                        }
                        const peerId = Peer.resolveId(rawPeerId);
                        const cmid = Message.resolveCmid(rawCmid);
                        const { status } = Convo.findHistoryNodeByCmid(convo, cmid);
                        if (status === 'NotLoaded') {
                            addCmid(peerId, cmid);
                        }
                        break;
                    }
                    case IEngine.ChatUpdateType.UserMigratedToMax: {
                        if (convo.kind === 'ChatConvo' && !convo.transitionData) {
                            convoPeerIds.add(peerId);
                        }
                        break;
                    }
                    case IEngine.ChatUpdateType.CopyFlagChanged:
                    case IEngine.ChatUpdateType.AdminGrated:
                    case IEngine.ChatUpdateType.AdminKicked:
                    case IEngine.ChatUpdateType.BusinessNotifyDataChanged:
                    case IEngine.ChatUpdateType.DonUnsubscribed:
                    case IEngine.ChatUpdateType.DonSubscribed:
                    case IEngine.ChatUpdateType.IsNewChange:
                    case IEngine.ChatUpdateType.StyleChanged:
                    case IEngine.ChatUpdateType.ShortPollReactionsChanged:
                    case IEngine.ChatUpdateType.ContactConverted:
                    case IEngine.ChatUpdateType.ConvertIncognito:
                    case IEngine.ChatUpdateType.IncognitoLeft:
                    case IEngine.ChatUpdateType.PostponedMessagesCountChanged:
                    case IEngine.ChatUpdateType.PostponedMessagesError:
                    case IEngine.ChatUpdateType.OwnerGranted:
                    case IEngine.ChatUpdateType.MembersChanged:
                        /**
                         * События не требуют перезапроса данных.
                         * Частично это описано в доке по ссылке (но на момент чтения может быть out-of-date):
                         * https://confluence.mvk.com/pages/viewpage.action?pageId=20054518
                         */
                        break;
                    default:
                        const _typeguard = updateType;
                }
                break;
            }
            /**
             * 10013 – Удаление всех сообщений в диалоге до untilCmid включительно
             * 10014 – Восстановление всех сообщений в диалоге до untilCmid включительно
             */
            case 10013:
            case 10014: {
                const [, rawPeerId] = update;
                const peerId = Peer.resolveId(rawPeerId);
                if (draft.convos.has(peerId)) {
                    convoPeerIds.add(peerId);
                }
                break;
            }
            /**
             * Тайпинги
             */
            case 63:
            case 64:
            case 65:
            case 66:
            case 67:
            case 68:
                /**
                 * Не загружаем информацию для печатающих пользователей,
                 * используем только кеш и счетчики.
                 *
                 * Для бесед 1х1 у нас всегда гарантированно будет пользователь
                 * в кэше - тут ничего дозагружать не надо.
                 *
                 * Для чатов мы будем поступать так:
                 * 1. Если пользователь есть в кэше, то покажем его с именем
                 * 2. Если пользователя нет, то просто скажем, что кто-то печатает
                 *
                 * При это в момент открытия чата мы подгружаем его мемберов,
                 * поэтому для открытого уже чата данные у нас будут.
                 *
                 * Плюс мы подгружаем пользователей в каждом пришедшем сообщении,
                 * поэтому активно пишущие мемберы в данный момент тоже будут подгружаться
                 * в наш кэш.
                 *
                 * По сути мы делаем эту оптимизацию по двум причинам:
                 * 1. Мы не считаем, что это супер важная информация для пользователя
                 * 2. Мы не хотим бомбить АПИ запросами на подгрузку данных
                 */
                break;
            case 10003: {
                const [, rawCmid, flags, rawPeerId] = update;
                const peerId = Peer.resolveId(rawPeerId);
                /**
                 * Если происходит ансет флага удаленности или спама,
                 * значит сообщение было восстановлено. Это вызовет 21 ивент
                 * изменения minorId. В этом случаем нам нужно сходить за сообщением.
                 * Беседа же загрузится в рамках 21 ивента.
                 */
                const { isDeleted: wasRestored, isSpam } = Message.convertFlags(flags);
                if (!wasRestored && !isSpam) {
                    /**
                     * Нам не нужно грузить сообщение при других
                     * изменениях флагов сообщений.
                     */
                    break;
                }
                const cmid = Message.resolveCmid(rawCmid);
                addCmid(peerId, cmid);
                break;
            }
            /**
             * Новое сообщение
             */
            case 10004: {
                const [, rawCmid, , , rawPeerId, , , additional, attachments] = update;
                const peerId = Peer.resolveId(rawPeerId);
                const cmid = Message.resolveCmid(rawCmid);
                const convo = draft.convos.get(peerId);
                if (!convo) {
                    /**
                     * Это событие, повышающее беседу в списке бесед.
                     * Если у нас ее нет в кэше, то мы обязательно должны за ней сходить.
                     */
                    convoPeerIds.add(peerId);
                }
                const findReplyInCache = (cmid) => convo && findReplyInCacheCallback(convo)(cmid);
                /**
                 * Проверяем достаточно ли у нас данных о сообщении из ЛП.
                 * Вдруг у нас нет необходимости дополнительно идти за ним в АПИ.
                 */
                if (isAttachmentMissing(attachments, additional, findReplyInCache)) {
                    /**
                     * Если мы пойдем за этим сообщением в апи, то мы получим
                     * всех пиров, связанных с этим сообщением через extended: 1.
                     */
                    addCmid(peerId, cmid);
                    break;
                }
                const { message } = fromEngineMessage(featureFlags, update, draft.ownerId, findReplyInCache);
                /**
                 * Если же данных из ЛП нам достаточно, но пира в кэше нет,
                 * то сходим только за ним.
                 */
                if (!draft.peers.has(message.peerId)) {
                    addPeerId(message.peerId);
                }
                if (!draft.peers.has(message.authorId)) {
                    addPeerId(message.authorId);
                }
                if (message.kind === 'Service') {
                    switch (message.action.type) {
                        case 'cannot_call_privacy_settings':
                        case 'chat_photo_remove':
                        case 'chat_group_call_started':
                        case 'chat_screenshot':
                        case 'chat_invite_user_by_link':
                        case 'chat_invite_user_by_call_join_link':
                        case 'chat_kick_don':
                        case 'call_transcription_failed':
                        case 'chat_pin_message':
                        case 'chat_unpin_message':
                        case 'chat_photo_update':
                        case 'chat_create':
                        case 'chat_title_update':
                        case 'conversation_style_update':
                        case 'conversation_style_update_action':
                        case 'sent_message_requests_count':
                        case 'rejected_message_request':
                        case 'custom':
                        case 'unknown':
                        case 'chat_without_owner_admins':
                        case 'chat_without_owner_all':
                            break;
                        case 'sent_message_request':
                            if (!draft.peers.has(message.action.from)) {
                                addPeerId(message.action.from);
                            }
                            break;
                        /**
                         * В следующих типах сервисного сообщения
                         * есть peerId, за профилем которого хотим
                         * сходить в рамках 10004 события
                         *
                         * При появлении новых событий, использующих
                         * профиль пира - добавить их ниже.
                         */
                        case 'chat_invite_user':
                        case 'chat_kick_user':
                        case 'accepted_message_request':
                        case 'chat_invite_user_by_call':
                        case 'chat_invite_user_by_message_request':
                        case 'chat_kick_user_call_block':
                        case 'chat_owner_changed':
                        case 'chat_without_owner_admin':
                            if (!draft.peers.has(message.action.peerId)) {
                                addPeerId(message.action.peerId);
                            }
                            break;
                        default:
                            exhaustivenessCheck(message.action);
                    }
                }
                break;
            }
            /**
             * Редактирование и обновление флагов сообщения
             */
            case 10005:
            case 10018: {
                const [, rawCmid, rawFlags, rawPeerId, , , additional, attachments] = update;
                const peerId = Peer.resolveId(rawPeerId);
                const convo = draft.convos.get(peerId);
                if (!convo) {
                    /**
                     * Если конвы в кэше нет, то ничего догружать не нужно.
                     */
                    break;
                }
                const cmid = Message.resolveCmid(rawCmid);
                const message = Convo.findMessageByCmid(convo, cmid);
                if (!message) {
                    /**
                     * Если сообщения нет в кэше, значит смысла что-то догружать нет.
                     */
                    break;
                }
                const findReplyInCache = findReplyInCacheCallback(convo);
                if (isAttachmentMissing(attachments, additional, findReplyInCache)) {
                    addCmid(peerId, cmid);
                }
                const flags = Message.convertFlags(rawFlags);
                if (flags.hasReactions) {
                    addCmid(peerId, cmid);
                }
                break;
            }
            /**
             * Инвалидация сообщения. Сообщение нужно перезагрузить.
             */
            case 10019: {
                const [, rawCmid, rawPeerId] = update;
                const peerId = Peer.resolveId(rawPeerId);
                const convo = draft.convos.get(peerId);
                if (!convo) {
                    /**
                     * Если конвы в кэше нет, то ничего догружать не нужно.
                     */
                    break;
                }
                const cmid = Message.resolveCmid(rawCmid);
                const message = Convo.findMessageByCmid(convo, cmid);
                if (!message) {
                    /**
                     * Если сообщения нет в кэше, значит смысла что-то догружать нет.
                     */
                    break;
                }
                addCmid(peerId, cmid);
                break;
            }
            /**
             * Событие о реакции (создана или изменена)
             */
            case 601: {
                const [, subtype, rawPeerId, rawCmid] = update;
                /*
                 * Данные могут понадобиться только в случае если реакцию добавили
                 */
                if (subtype !== 1 && subtype !== 2) {
                    break;
                }
                /*
                 * Данные нужны для работы нотификаций. Однако, если они не включены,
                 * то можно не грузить ничего.
                 */
                if (!draft.viewer.settings.push.messageReaction.isEnabled) {
                    break;
                }
                const cmid = Message.resolveCmid(rawCmid);
                const peerId = Peer.resolveId(rawPeerId);
                const convo = draft.convos.get(peerId);
                if (!convo) {
                    /**
                     * Грузим конву, если ее нет в кэше и сообщение,
                     * так как его точно нет в кэше.
                     */
                    convoPeerIds.add(peerId);
                    addCmid(peerId, cmid);
                }
                else {
                    const { status } = History.findNodeByCmid(convo.history, cmid);
                    if (status === 'NotLoaded') {
                        addCmid(peerId, cmid);
                    }
                }
                break;
            }
            case 701: {
                const [, rawPeerId] = update;
                convoPeerIds.add(Peer.resolveId(rawPeerId));
                break;
            }
            case 603: {
                const [, subtype, , ...peerIds] = update;
                switch (subtype) {
                    case 0:
                    case 2:
                        /**
                         * В случае удаления пиров из памяти, ничего дозагружать не надо
                         * Если придет подтип 2, то профили дозагрузятся в ответе на запрос списка бесед
                         */
                        break;
                    case 1:
                        /**
                         * В случае добавления пиров дозагружаем данные, иначе не сможем показать профили в списке чатов
                         */
                        peerIds.forEach((peerId) => {
                            convoPeerIds.add(peerId);
                        });
                        break;
                    default:
                        exhaustivenessCheck(subtype);
                }
                break;
            }
            /**
             * Почистить кейсы после раскрытки поднятия ЛП
             * Задача: https://jira.mvk.com/browse/ME-65557
             */
            case 10:
            case 11:
            case 23:
            case 24:
            case 80:
            case 91:
            case 114:
            case 115:
            case 119:
            case 120:
            case 121:
            case 122:
            case 123:
            case 124:
            case 201:
            case 202:
            case 203:
            case 205:
            case 602:
            case 604:
            case 10001:
            case 10002:
            case 10006:
            case 10007:
            case 10501:
            case 501:
            case 10502:
            case 502:
            case 10503:
            case 503:
            case 10504:
            case 504:
            case 10505:
            case 505:
            case 10506:
            case 506:
            case 10507:
            case 507:
            case 10508:
            case 508:
            case 10509:
            case 509:
            case 80005:
                /**
                 * Для этих эвентов ничего дозагружать не нужно.
                 */
                break;
            default:
                /**
                 * Ничего не делаем, просто игнорируем апдейты, которых не знаем.
                 * При этом добавляем тайпгарды, чтобы быть уверенными, что мы точно обработали все,
                 * что знаем.
                 */
                const _typeguard = update;
        }
    }
    convoPeerIds.forEach((peerId) => {
        /**
         * Здесь мы защищаемся от двойного запроса данных:
         *
         * Если в convoPeerIds попал айди личной беседы (1 на 1),
         * то здесь мы пройдемся по остальным сущностям пиров
         * и удалим появление этого айди. Так как далее мы запросим
         * конву с extended: 1, мы точно получим пира личной беседы из
         * profiles, groups или contact.
         */
        switch (true) {
            case Peer.isUserPeerId(peerId):
                userPeerIds.delete(peerId);
                return;
            case Peer.isGroupPeerId(peerId):
                groupPeerIds.delete(peerId);
                return;
            case Peer.isContactPeerId(peerId):
                contactPeerIds.delete(peerId);
                return;
            case Peer.isChatPeerId(peerId):
                return;
            default:
                exhaustivenessCheck(peerId);
        }
    });
    /**
     * При обработке IncompleteUpdate из ЛП есть
     * вероятность получить некорректные данные (peerId = 0).
     * Точные причины этого не до конца известны, но есть вероятность
     * фикса этой проблемы с поднятием версии ЛП до 20. TODO убрать после апа.
     * Подробнее https://jira.mvk.com/browse/ME-63290
     */
    convoPeerIds.delete(Peer.resolveId());
    cmidsByPeerId.delete(Peer.resolveId());
    userPeerIds.delete(Peer.resolveId());
    return {
        cmidsByPeerId,
        convoPeerIds,
        userPeerIds,
        groupPeerIds,
        contactPeerIds,
        incognitoMemberIdsByChatId,
    };
}
/**
 * Проверка кэша на наличие всех необходимых данных.
 */
function isDataMissing(featureFlags, draft, next) {
    for (const update of next.updates) {
        const fallenConvoPeerId = getFallenConvoMissingByUpdate(draft, update);
        if (fallenConvoPeerId !== null) {
            return true;
        }
        if (IEngine.isIncompleteUpdate(update)) {
            return true;
        }
        switch (update[0]) {
            case 12: {
                const [, rawPeerId, flags] = update;
                const flagsMap = Convo.convertFlags(flags);
                if ((flagsMap.isAdTag || flagsMap.isImportant || flagsMap.isUnanswered) &&
                    !draft.convos.has(Peer.resolveId(rawPeerId))) {
                    return true;
                }
                break;
            }
            case 20:
            case 21: {
                const [, rawPeerId] = update;
                const peerId = Peer.resolveId(rawPeerId);
                const convo = draft.convos.get(peerId);
                if (!convo) {
                    return true;
                }
                break;
            }
            case 52: {
                const [, updateType, rawPeerId, extra] = update;
                const peerId = Peer.resolveId(rawPeerId);
                const convo = draft.convos.get(peerId);
                if (!convo) {
                    break;
                }
                switch (updateType) {
                    case IEngine.ChatUpdateType.FlagsChanged:
                    case IEngine.ChatUpdateType.TitleChanged:
                    case IEngine.ChatUpdateType.AvatarChanged:
                    case IEngine.ChatUpdateType.BannerChanged:
                    case IEngine.ChatUpdateType.MessageRequestChanged:
                    case IEngine.ChatUpdateType.MessageRequestCanceled:
                    case IEngine.ChatUpdateType.MessageRequestAccepted:
                    case IEngine.ChatUpdateType.MessageRequestRejected:
                    case IEngine.ChatUpdateType.CallInProgressChanged:
                    case IEngine.ChatUpdateType.ContactConverted:
                    case IEngine.ChatUpdateType.ContactJoined:
                    case IEngine.ChatUpdateType.DescriptionChanged:
                    case IEngine.ChatUpdateType.IncognitoJoined:
                    case IEngine.ChatUpdateType.ConvertIncognito:
                    case IEngine.ChatUpdateType.StyleChanged:
                    case IEngine.ChatUpdateType.KeyboardChanged:
                        return true;
                    case IEngine.ChatUpdateType.UserJoined:
                    case IEngine.ChatUpdateType.UserLeft:
                    case IEngine.ChatUpdateType.UserKicked: {
                        const targetPeerId = Peer.resolveId(extra);
                        if (!draft.peers.has(targetPeerId)) {
                            return true;
                        }
                        /**
                         * Если текущий пользователь возвращается в беседу, то запрашиваем данные,
                         * так как у вышедших/исключенных пользователей данные о беседе неполные
                         */
                        if (updateType === IEngine.ChatUpdateType.UserJoined &&
                            targetPeerId === draft.ownerId) {
                            return true;
                        }
                        break;
                    }
                    case IEngine.ChatUpdateType.Pinned: {
                        const [, , , rawCmid] = update;
                        // Если 0, значит сообщение было откреплено и перезапрос данных не нужен
                        if (rawCmid === 0) {
                            break;
                        }
                        const cmid = Message.resolveCmid(rawCmid);
                        const { status } = Convo.findHistoryNodeByCmid(convo, cmid);
                        if (status === 'NotLoaded') {
                            return true;
                        }
                        break;
                    }
                    case IEngine.ChatUpdateType.UserMigratedToMax: {
                        /**
                         * Необходимо перезагрузить конво, если до этого у нас не было информации
                         * о переходе
                         */
                        return convo.kind === 'ChatConvo' && !convo.transitionData;
                    }
                    case IEngine.ChatUpdateType.CopyFlagChanged:
                    case IEngine.ChatUpdateType.AdminGrated:
                    case IEngine.ChatUpdateType.AdminKicked:
                    case IEngine.ChatUpdateType.BusinessNotifyDataChanged:
                    case IEngine.ChatUpdateType.DonUnsubscribed:
                    case IEngine.ChatUpdateType.DonSubscribed:
                    case IEngine.ChatUpdateType.IsNewChange:
                    case IEngine.ChatUpdateType.ShortPollReactionsChanged:
                    case IEngine.ChatUpdateType.IncognitoLeft:
                    case IEngine.ChatUpdateType.PostponedMessagesCountChanged:
                    case IEngine.ChatUpdateType.PostponedMessagesError:
                    case IEngine.ChatUpdateType.OwnerGranted:
                    case IEngine.ChatUpdateType.MembersChanged:
                        /**
                         * События не требуют перезапроса данных.
                         * Частично это описано в доке по ссылке (но на момент чтения может быть out-of-date):
                         * https://confluence.mvk.com/pages/viewpage.action?pageId=20054518
                         */
                        break;
                    default:
                        const _typeguard = updateType;
                }
                break;
            }
            case 10013:
            case 10014: {
                const [, rawPeerId] = update;
                const peerId = Peer.resolveId(rawPeerId);
                if (draft.convos.has(peerId)) {
                    return true;
                }
                break;
            }
            case 701:
                return true;
            case 63:
            case 64:
            case 65:
            case 66:
            case 67:
            case 68:
                /**
                 * Не загружаем информацию для печатающих пользователей,
                 * используем только кеш и счетчики.
                 *
                 * Для бесед 1х1 у нас всегда гарантированно будет пользователь
                 * в кэше - тут ничего дозагружать не надо.
                 *
                 * Для чатов мы будем поступать так:
                 * 1. Если пользователь есть в кэше, то покажем его с именем
                 * 2. Если пользователя нет, то просто скажем, что кто-то печатает
                 *
                 * При этом в момент открытия чата мы подгружаем его мемберов,
                 * поэтому для уже открытого чата данные будут.
                 *
                 * Плюс мы подгружаем пользователей в каждом пришедшем сообщении,
                 * поэтому активно пишущие мемберы в данный момент тоже будут подгружаться
                 * в наш кэш.
                 *
                 * По сути мы делаем эту оптимизацию по трем причинам:
                 * 1. Мы не считаем, что это супер важная информация для пользователя
                 * 2. Мы не хотим бомбить АПИ запросами на подгрузку данных
                 * 3. Данные нельзя дозагрузить с помощью getLongPollHistory.
                 */
                break;
            case 10003: {
                const [, , flags, rawPeerId] = update;
                const peerId = Peer.resolveId(rawPeerId);
                const convo = draft.convos.get(peerId);
                if (!convo) {
                    break;
                }
                // Если происходит ансет флага удаленности или спама, значит сообщение было восcтановлено
                const { isDeleted: wasRestored, isSpam } = Message.convertFlags(flags);
                if (wasRestored || isSpam) {
                    return true;
                }
                break;
            }
            case 10004: {
                const [, , , , rawPeerId, , , additional, attachments] = update;
                const peerId = Peer.resolveId(rawPeerId);
                const convo = draft.convos.get(peerId);
                if (!convo) {
                    return true;
                }
                const findReplyInCache = findReplyInCacheCallback(convo);
                if (isAttachmentMissing(attachments, additional, findReplyInCache)) {
                    return true;
                }
                const { message } = fromEngineMessage(featureFlags, update, draft.ownerId, findReplyInCache);
                if (!draft.peers.has(message.peerId) ||
                    !draft.peers.has(message.authorId)) {
                    return true;
                }
                // Если нам пришло сообщение от пользователя в беседе с этим пользователем,
                // но он почему-то офлайн.
                // Перезагрузим, чтобы обновить данные онлайна пользователя.
                if (Peer.isUserPeerId(message.authorId) &&
                    message.peerId === message.authorId &&
                    !draft.lastSeens.has(message.authorId)) {
                    return true;
                }
                break;
            }
            case 10005:
            case 10018: {
                const [, rawCmid, rawFlags, rawPeerId, , , additional, attachments] = update;
                const peerId = Peer.resolveId(rawPeerId);
                const convo = draft.convos.get(peerId);
                if (!convo) {
                    break;
                }
                const cmid = Message.resolveCmid(rawCmid);
                const message = Convo.findMessageByCmid(convo, cmid);
                if (!message) {
                    break;
                }
                const findReplyInCache = findReplyInCacheCallback(convo);
                if (isAttachmentMissing(attachments, additional, findReplyInCache)) {
                    return true;
                }
                const flags = Message.convertFlags(rawFlags);
                if (flags.hasReactions) {
                    return true;
                }
                break;
            }
            case 10019: {
                const [, rawCmid, rawPeerId] = update;
                const peerId = Peer.resolveId(rawPeerId);
                const convo = draft.convos.get(peerId);
                if (!convo) {
                    /**
                     * Если конвы в кэше нет, то ничего догружать не нужно.
                     */
                    break;
                }
                const cmid = Message.resolveCmid(rawCmid);
                const message = Convo.findMessageByCmid(convo, cmid);
                if (!message) {
                    /**
                     * Если сообщения нет в кэше, значит смысла что-то догружать нет.
                     */
                    break;
                }
                return true;
            }
            case 601: {
                const [, subtype, rawPeerId, rawCmid] = update;
                // Данные могут понадобиться только в случае если реакцию добавили
                if (subtype !== 1 && subtype !== 2) {
                    break;
                }
                /*
                 * Данные нужны для работы нотификаций. Однако, если они не включены,
                 * то можно не грузить ничего.
                 */
                if (!draft.viewer.settings.push.messageReaction.isEnabled) {
                    break;
                }
                const convo = draft.convos.get(Peer.resolveId(rawPeerId));
                if (!convo ||
                    History.findNodeByCmid(convo.history, Message.resolveCmid(rawCmid))
                        .status === 'NotLoaded') {
                    return true;
                }
                break;
            }
            case 603: {
                const [, subtype] = update;
                switch (subtype) {
                    case 0:
                    case 2:
                        /**
                         * В случае удаления пиров из памяти, ничего дозагружать не надо
                         * Если придет подтип 2, то профили дозагрузятся в ответе на запрос списка бесед
                         */
                        break;
                    case 1:
                        /**
                         * В случае добавления пиров дозагружаем данные, иначе не сможем показать профили в списке чатов
                         */
                        return true;
                    default:
                        exhaustivenessCheck(subtype);
                }
                break;
            }
            case 10:
            case 11:
            case 23:
            case 24:
            case 80:
            case 91:
            case 114:
            case 115:
            case 119:
            case 120:
            case 121:
            case 122:
            case 123:
            case 124:
            case 201:
            case 202:
            case 203:
            case 205:
            case 602:
            case 604:
            case 10001:
            case 10002:
            case 10006:
            case 10007:
            case 10501:
            case 501:
            case 10502:
            case 502:
            case 10503:
            case 503:
            case 10504:
            case 504:
            case 10505:
            case 505:
            case 10506:
            case 506:
            case 10507:
            case 507:
            case 10508:
            case 508:
            case 10509:
            case 509:
            case 80005:
                /**
                 * Для этих эвентов ничего дозагружать не нужно.
                 */
                break;
            default:
                /**
                 * Ничего не делаем, просто игнорируем апдейты, которых не знаем.
                 * При этом добавляем тайпгарды, чтобы быть уверенными, что мы точно обработали все,
                 * что знаем.
                 */
                const _typeguard = update;
        }
    }
    return false;
}
/**
 * Проверяем есть ли в сообщении аттач, который надо перезагружать из АПИ.
 */
function isAttachmentMissing(attachments, additional, findReplyInCache) {
    /**
     * Сообщение не может одновременно содержать реплаи и форварды.
     * Но если есть reply, то будет и fwd, поэтому, мы проверяем наличие
     * только форвардов как наличие fwd и отсутствие reply.
     */
    if (attachments.fwd && !attachments.reply) {
        return true;
    }
    if (attachments.reply) {
        const parsed = JSON.parse(attachments.reply);
        const cmid = Message.resolveCmid(parsed.conversation_message_id);
        if (!findReplyInCache(cmid)) {
            return true;
        }
    }
    if (attachments.geo) {
        return true;
    }
    if (additional.has_template) {
        return true;
    }
    /**
     * Движок возвращает полную информацию о стикерах и голосовых сообщениях,
     * поэтому при их наличии можно не перезапрашивать сообщение.
     *
     * Оптимизация применяется только при одном вложении в сообщении, потому что
     * при наличии нескольких вложений данных будет уже не хватать.
     *
     * Например, может прийти реакция на историю стикером, во вложениях
     * будут находиться стикер и история, но в поле attachments придет только
     * объект стикера
     */
    if (attachments.attachments &&
        attachments.attach1_type &&
        !attachments.attach2_type) {
        try {
            const parsed = JSON.parse(attachments.attachments);
            if (Array.isArray(parsed) &&
                parsed[0].type === attachments.attach1_type) {
                return false;
            }
        }
        catch {
            return true;
        }
    }
    if (attachments.attach1_type) {
        return true;
    }
    return false;
}
function getFallenConvoMissingByUpdate(draft, update) {
    let rawPeerId;
    switch (update[0]) {
        case 10004:
            rawPeerId = update[4];
            break;
        case 10001:
        case 10002:
        case 10003:
        case 10005:
        case 10018:
            rawPeerId = update[3];
            break;
        case 63:
        case 64:
        case 65:
        case 66:
        case 67:
        case 68:
        case 20:
        case 21:
        case 23:
        case 10:
        case 11:
        case 12:
        case 602:
        case 701:
        case 10006:
        case 10007:
        case 10013:
        case 10014:
            rawPeerId = update[1];
            break;
        case 601:
        case 10019:
        case 52:
        case 91:
            rawPeerId = update[2];
            break;
        case 114:
        case 119:
            rawPeerId = update[1].peer_id;
            break;
        /**
         * Данные кейсы игнорируются, так как они не подразумевают неоходимость дозапросить
         * мертвые чаты в случае если с LP пришло событие и мы хотим обновить кэш чатов.
         */
        case 10501:
        case 10502:
        case 10503:
        case 10504:
        case 10505:
        case 10506:
        case 10507:
        case 10508:
        case 10509:
        case 115:
        case 120:
        case 121:
        case 122:
        case 123:
        case 124:
        case 201:
        case 202:
        case 203:
        case 205:
        case 24:
        case 501:
        case 502:
        case 503:
        case 504:
        case 505:
        case 506:
        case 507:
        case 508:
        case 509:
        case 603:
        case 604:
        case 80:
        case 80005:
            break;
        default:
            /**
             * Ничего не делаем, просто игнорируем апдейты, которых не знаем.
             * При этом добавляем тайпгарды, чтобы быть уверенными, что мы точно обработали все,
             * что знаем.
             */
            const _typeguard = update;
    }
    if (!rawPeerId) {
        return null;
    }
    const peerId = Peer.resolveId(rawPeerId);
    return !draft.convos.get(peerId)?.isAlive ? peerId : null;
}
function update10to12(draft, update) {
    const [type, rawPeerId, flags] = update;
    const variant = {
        10: 'unset',
        11: 'replace',
        12: 'set',
    }[type];
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    /**
     * TODO: убрать когда счётчики фильтров ad_tag, important и unanswered будут приходить из события 80
     */
    Filters.updateCountersByFlags(draft.organisers.filters, variant, flags);
    if (!convo) {
        return [];
    }
    Convo.updateFlags(convo, variant, flags);
    Organisers.refresh(draft.organisers, convo);
    return [];
}
function update20(draft, update) {
    const [, rawPeerId, majorSortId] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    Convo.updateSortId(convo, { majorSortId });
    Organisers.refresh(draft.organisers, convo);
    return [];
}
function update21(draft, update) {
    const [, rawPeerId, minorSortId] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    Convo.updateSortId(convo, { minorSortId });
    Organisers.refresh(draft.organisers, convo);
    const isConvoBecomeEmpty = minorSortId <= 0;
    const hasMessageRequests = draft.organisers.filters.messageRequest.totalCount > 0;
    // Если у пользователя есть МРы (не нулевой счетчик) и какая-то его конва стала пустой,
    // то есть должна скрыться из всех фильтров. То нам надо обновить счетчик МРов.
    // Поскольку если это МР и этой беседы не было в кэше, то в LP мы ее получим уже не МРом,
    // а простой беседой, и не сможем понять, МР это или нет.
    if (isConvoBecomeEmpty && hasMessageRequests) {
        return [
            async function () {
                return {
                    type: 'UpdateMessageRequestsCounter',
                    peerId,
                };
            },
        ];
    }
    return [];
}
function update23(draft, update) {
    const [, rawPeerId, rawMask] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const mask = Tag.resolveMask(rawMask);
    const convo = draft.convos.get(peerId);
    if (convo) {
        const tags = Tag.getSelectedTags(draft.organisers.tags.items, mask);
        Convo.updateTags(convo, tags.length ? tags.map((tag) => tag.id) : undefined);
        Tag.refresh(draft.organisers.tags, convo);
    }
    return [];
}
function update24(draft, update) {
    const [, bit] = update;
    const tag = draft.organisers.tags.items.find((tag) => tag.bit === bit);
    if (tag) {
        tag.peerIds.forEach((peerId) => {
            const convo = draft.convos.get(peerId);
            if (convo?.tags) {
                const tags = Array.from(convo.tags).filter((id) => id !== tag.id);
                Convo.updateTags(convo, tags.length ? tags : undefined);
            }
        });
        Tag.deleteTag(draft.organisers.tags, tag.id);
    }
    return [];
}
function update52(draft, update, featureFlags, apiExtended) {
    const [, updateType, rawPeerId, extra] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    const apiConvo = apiExtended?.convos.get(rawPeerId);
    const newer = apiConvo && fromApiConvo(featureFlags, apiConvo);
    switch (updateType) {
        case IEngine.ChatUpdateType.CopyFlagChanged:
            // Этот тип вообще не ясно что означает, поэтому пока не хэндлим
            return [];
        case IEngine.ChatUpdateType.TitleChanged:
        case IEngine.ChatUpdateType.AvatarChanged:
        case IEngine.ChatUpdateType.FlagsChanged:
        case IEngine.ChatUpdateType.BannerChanged:
        case IEngine.ChatUpdateType.DescriptionChanged:
            /**
             * Эти данные хранятся в пире беседы.
             * Мы его полностью переписываем при дозагрузке данных беседы в кэш.
             */
            return [];
        case IEngine.ChatUpdateType.Pinned: {
            if (convo.kind !== 'ChatConvo') {
                return [];
            }
            const rawCmid = extra;
            const cmid = Message.resolveCmid(rawCmid);
            draft.hiddenPinnedMessages.delete(peerId);
            // Если у нас есть новые данные из АПИ, то воспользуемся ими
            if (newer?.convo.kind === convo.kind) {
                newer.convo.pinnedMessage &&
                    Convo.pinMessage(convo, newer.convo.pinnedMessage);
                return [];
            }
            // Иначе будем пробовать обработать сами
            if (cmid === 0) {
                Convo.unpinMessage(convo);
            }
            else {
                const message = Convo.findMessageByCmid(convo, cmid);
                if (message?.kind === 'Normal') {
                    Convo.pinMessage(convo, Message.toPinned(message));
                }
            }
            return [];
        }
        case IEngine.ChatUpdateType.ContactJoined: {
            /**
             * @TODO подумать как обрабатывать этот кейс
             * Не приходит информация о добавленном в чат юзере при перезапросе данных,
             * и из за этого мы не можем его сразу показать во вкладке приглашенных в чат участников.
             * Поэтому пока что ничего не делаем, чтобы не было ошибки "Пир не найден"
             */
            return [];
        }
        case IEngine.ChatUpdateType.UserJoined: {
            if (convo.kind !== 'ChatConvo') {
                return [];
            }
            const extraPeerId = Peer.resolveId(extra);
            if (!Peer.isUserPeerId(extraPeerId) && !Peer.isGroupPeerId(extraPeerId)) {
                return [];
            }
            /**
             * Если мемберы еще не загружены, то не добавляем участника при вступлении, чтобы он не был
             * одним единственным участником и не реджектил загрузку всех участников в shouldLoadMembers
             */
            if (convo.members.memberIds.size !== 0) {
                const canKick = 
                // Если я админ, а пользователь нет
                (ChatMembers.isAdmin(convo.members, draft.ownerId) &&
                    !ChatMembers.isAdmin(convo.members, extraPeerId)) ||
                    // Или если я владелец чата
                    convo.ownerId === draft.ownerId;
                /**
                 * Пока не ясно как тут проверить что пользователя пригласил я (а значит что я могу его и кикинуть)
                 * Поэтому пока что могу кикать только если я админ до перезапроса участников беседы
                 */
                const member = convo.members.members.get(extraPeerId);
                /** Подгружаем мембера в случае отсутствия, так как нам как минимум нужен флаг isRestrictedToWrite */
                if (!member) {
                    return [
                        Peer.isChatPeerId(peerId) &&
                            async function () {
                                return {
                                    type: 'LoadChatMembers',
                                    peerId,
                                    memberIds: [extraPeerId],
                                    shouldUpdateCount: true,
                                };
                            },
                    ];
                }
                const newMember = {
                    peerId: extraPeerId,
                    canKick,
                    isMessageRequest: false,
                    isRestrictedToWrite: member.isRestrictedToWrite,
                };
                ChatMembers.addMembers(convo.members, [newMember], !featureFlags.vkm_members_count_over_3000);
                if (featureFlags.vkm_members_count_over_3000) {
                    ChatMembers.setCount(convo.members, convo.members.count + 1);
                }
            }
            if (extraPeerId === draft.ownerId) {
                draft.locks.getConversationMembers.add(peerId);
                const peerDrafts = draft.composerDrafts[peerId];
                if (peerDrafts && peerDrafts[peerDrafts.length - 1]) {
                    Convo.updateIsDrafted(convo, true);
                    Organisers.refresh(draft.organisers, convo);
                }
                return [
                    Peer.isChatPeerId(peerId) &&
                        async function () {
                            return {
                                type: 'LoadChatMembers',
                                peerId,
                            };
                        },
                    Peer.isChatPeerId(peerId) &&
                        async function () {
                            return {
                                type: 'LoadChatInfo',
                                peerId,
                            };
                        },
                ];
            }
            return [];
        }
        case IEngine.ChatUpdateType.MembersChanged: {
            if (convo.kind !== 'ChatConvo') {
                return [];
            }
            /** Очищаем кэш мемберов для консистентности данных между клиентом и сервером
             * при пагинации */
            ChatMembers.resetMembers(convo.members);
            /** Этот апдейт прилетает, когда даются и пропадают права владельца чата.
             * В случае передачи прав владельца чата полностью обновляем список участников,
             * так как меняются доступные действия над другими участниками чата (кик, бан, мут и тд)
             * */
            return [
                Peer.isChatPeerId(peerId) &&
                    async function () {
                        return {
                            type: 'LoadChatMembers',
                            peerId,
                        };
                    },
            ];
        }
        case IEngine.ChatUpdateType.UserLeft: {
            if (convo.kind !== 'ChatConvo') {
                return [];
            }
            const extraPeerId = Peer.resolveId(extra);
            if (!Peer.isUserPeerId(extraPeerId) && !Peer.isGroupPeerId(extraPeerId)) {
                return [];
            }
            if (extraPeerId === draft.ownerId) {
                Convo.changeUserState(convo, 'left');
            }
            if (ChatMembers.isAdmin(convo.members, extraPeerId)) {
                ChatMembers.unsetAdmin(convo.members, extraPeerId);
            }
            ChatMembers.removeMember(convo.members, extraPeerId);
            return [];
        }
        case IEngine.ChatUpdateType.UserKicked: {
            if (convo.kind !== 'ChatConvo') {
                return [];
            }
            const extraPeerId = Peer.resolveId(extra);
            if (!Peer.isUserPeerId(extraPeerId) && !Peer.isGroupPeerId(extraPeerId)) {
                break;
            }
            if (extraPeerId === draft.ownerId) {
                Convo.changeUserState(convo, 'kicked');
                Convo.restrictViewerToWrite(convo, 'kicked');
                Convo.updateIsDrafted(convo, false);
                Organisers.refresh(draft.organisers, convo);
            }
            if (ChatMembers.isAdmin(convo.members, extraPeerId)) {
                ChatMembers.unsetAdmin(convo.members, extraPeerId);
            }
            ChatMembers.removeMember(convo.members, extraPeerId);
            break;
        }
        case IEngine.ChatUpdateType.KeyboardChanged:
            const hiddenBotKeyboardId = draft.hiddenBotKeyboards.get(convo.peerId);
            if (!hiddenBotKeyboardId) {
                return [];
            }
            if (!convo.currentKeyboard ||
                hiddenBotKeyboardId !==
                    BotKeyboard.resolveKeyboardId(convo.currentKeyboard)) {
                draft.hiddenBotKeyboards.delete(convo.peerId);
            }
            return [];
        case IEngine.ChatUpdateType.CallInProgressChanged: {
            const inReadBy = convo.inReadBy;
            const unreadCount = convo.unreadCount;
            return [
                async function updateCallsCounter({ calls }) {
                    calls?.updateConvoCounter(peerId, inReadBy, unreadCount);
                    return { type: 'Noop' };
                },
            ];
        }
        case IEngine.ChatUpdateType.IsNewChange: {
            Convo.updateIsNew(convo, !!extra);
            return [];
        }
        case IEngine.ChatUpdateType.AdminGrated: {
            const extraPeerId = Peer.resolveId(extra);
            if (convo.kind !== 'ChatConvo' ||
                (!Peer.isUserPeerId(extraPeerId) && !Peer.isGroupPeerId(extraPeerId))) {
                return [];
            }
            ChatMembers.setAdmin(convo.members, extraPeerId);
            const member = ChatMembers.getMember(convo.members, extraPeerId);
            if (member) {
                ChatMembers.addMembers(convo.members, [
                    {
                        ...member,
                        // Только создатель чата может кикнуть админа без удаления его из админов
                        canKick: convo.ownerId === draft.ownerId,
                    },
                ], !featureFlags.vkm_members_count_over_3000);
            }
            if (extraPeerId === draft.ownerId &&
                Convo.isForbidedWritingForAll(convo)) {
                Convo.allowViewerToWrite(convo);
            }
            return [];
        }
        case IEngine.ChatUpdateType.OwnerGranted: {
            const newOwnerId = Peer.resolveId(extra);
            if (convo.kind !== 'ChatConvo' || !Peer.isUserPeerId(newOwnerId)) {
                return [];
            }
            Convo.updateOwner(convo, newOwnerId);
            /** Если поменялся овнер и им стали не мы или
             * мы назначили овнера, когда фактический отсутствует в беседе,
             * то убираем право на смену владельца */
            if (newOwnerId !== draft.ownerId) {
                Convo.updateAcl(convo, { ...convo.acl, canChangeOwner: false });
            }
            const member = ChatMembers.getMember(convo.members, newOwnerId);
            /** На нового владельца ставим флаг canKick: false, так как его никто не может кикать */
            if (member) {
                ChatMembers.addMembers(convo.members, [
                    {
                        ...member,
                        canKick: false,
                    },
                ]);
            }
            if (newOwnerId === draft.ownerId &&
                Convo.isForbidedWritingForAll(convo)) {
                /*
                 * При получении прав владельца снимается мут с пользователя
                 * */
                Convo.allowViewerToWrite(convo);
            }
            return [];
        }
        case IEngine.ChatUpdateType.AdminKicked: {
            const extraPeerId = Peer.resolveId(extra);
            if (convo.kind !== 'ChatConvo' ||
                (!Peer.isUserPeerId(extraPeerId) && !Peer.isGroupPeerId(extraPeerId))) {
                return [];
            }
            ChatMembers.unsetAdmin(convo.members, extraPeerId);
            const member = ChatMembers.getMember(convo.members, extraPeerId);
            if (member) {
                ChatMembers.addMembers(convo.members, [
                    {
                        ...member,
                        canKick: ChatMembers.isAdmin(convo.members, draft.ownerId),
                    },
                ], !featureFlags.vkm_members_count_over_3000);
            }
            if (extraPeerId === draft.ownerId &&
                Convo.isForbidedWritingForAll(convo)) {
                Convo.restrictViewerToWrite(convo, 'forbid_writing_for_all');
                Convo.updateIsDrafted(convo, false);
                Organisers.refresh(draft.organisers, convo);
            }
            return [];
        }
        case IEngine.ChatUpdateType.ContactConverted: {
            const contactPeerId = Peer.resolveId(extra);
            const contactConvo = draft.convos.get(contactPeerId);
            const contactPeer = draft.peers.get(contactPeerId);
            if (!contactPeer ||
                !contactConvo ||
                contactPeer.kind !== 'Contact' ||
                !Peer.isUserPeerId(peerId)) {
                return [];
            }
            Peer.convertContact(contactPeer, peerId);
            Convo.updateSortId(contactConvo, { minorSortId: 0 });
            return [];
        }
        case IEngine.ChatUpdateType.ShortPollReactionsChanged: {
            if (convo.kind !== 'ChatConvo') {
                return [];
            }
            convo.shouldShortPollReactions = Boolean(extra);
            return [];
        }
        case IEngine.ChatUpdateType.IncognitoJoined: {
            if (convo.kind !== 'ChatConvo') {
                return [];
            }
            const incognitoId = ChatMembers.resolveIncognitoMemberId(extra);
            const incognitoMember = ChatMembers.getIncognitoMember(convo.members, incognitoId);
            if (!incognitoMember?.memberId) {
                return [];
            }
            const peerId = Peer.resolveId(incognitoMember.memberId);
            if (!Peer.isUserPeerId(peerId) && !Peer.isContactPeerId(peerId)) {
                return [];
            }
            const member = {
                peerId,
                isRestrictedToWrite: !!convo.members.members?.get(peerId)?.isRestrictedToWrite,
                canKick: ChatMembers.isAdmin(convo.members, draft.viewer.id) ||
                    draft.viewer.id === incognitoMember.inviterId,
                isMessageRequest: false,
                joinDate: incognitoMember.inviteDate * 1000,
            };
            ChatMembers.addMembers(convo.members, [member], !featureFlags.vkm_members_count_over_3000);
            if (featureFlags.vkm_members_count_over_3000) {
                ChatMembers.setCount(convo.members, convo.members.count + 1);
            }
            return [];
        }
        case IEngine.ChatUpdateType.ConvertIncognito:
        case IEngine.ChatUpdateType.IncognitoLeft: {
            if (convo.kind !== 'ChatConvo') {
                return [];
            }
            const incognitoId = ChatMembers.resolveIncognitoMemberId(extra);
            const incognitoMember = ChatMembers.getIncognitoMember(convo.members, incognitoId);
            if (incognitoMember?.memberId) {
                ChatMembers.removeMember(convo.members, incognitoMember.memberId);
            }
            ChatMembers.removeIncognitoMember(convo.members, incognitoId);
            return [];
        }
        case IEngine.ChatUpdateType.StyleChanged: {
            if (newer?.convo) {
                convo.styleId = newer.convo.styleId;
            }
            return [];
        }
        case IEngine.ChatUpdateType.PostponedMessagesCountChanged: {
            convo.postponed.count = extra;
            return [];
        }
        case IEngine.ChatUpdateType.PostponedMessagesError: {
            convo.postponed.hasError = !!extra;
            return [];
        }
        case IEngine.ChatUpdateType.UserMigratedToMax: {
            const extraPeerId = Peer.resolveId(extra);
            if (featureFlags.vkm_edu_offboarding &&
                convo.kind === 'ChatConvo' &&
                convo.transitionData &&
                Peer.isUserPeerId(extraPeerId)) {
                convo.transitionData?.peerIds.push(extraPeerId);
            }
            return [];
        }
        case IEngine.ChatUpdateType.BusinessNotifyDataChanged:
        case IEngine.ChatUpdateType.MessageRequestChanged:
        case IEngine.ChatUpdateType.MessageRequestAccepted: // За этим экшеном следует IEngine.ChatUpdateType.UserJoined и обрабатываем его
        case IEngine.ChatUpdateType.MessageRequestCanceled:
        case IEngine.ChatUpdateType.MessageRequestRejected:
        case IEngine.ChatUpdateType.DonSubscribed:
        case IEngine.ChatUpdateType.DonUnsubscribed:
            /**
             * ВАЖНО!!!
             * Если добавляешь новый эвент и для него не требуется производить
             * никаких действий, добавь его отдельно и сопроводи комментарием,
             * объясняющим почему событию не требуются никаких действий.
             * Примером могут служить другие эвенты в этой функции.
             */
            return [];
        default:
            /**
             * Ничего не делаем, просто игнорируем апдейты, которых не знаем.
             * При этом добавляем тайпгарды, чтобы быть уверенными, что мы точно обработали все,
             * что знаем.
             */
            const _typeguard = updateType;
    }
    return [];
}
function update63to68(draft, update) {
    const [type, rawPeerId, rawUserIds, , updatedAt] = update;
    const typingPeerIds = new Set(rawUserIds.map((rawId) => Peer.resolveId(rawId)));
    typingPeerIds.delete(draft.viewer.id);
    if (!typingPeerIds.size) {
        return [];
    }
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    const variant = {
        63: 'text',
        64: 'voice',
        65: 'photo',
        66: 'video',
        67: 'file',
        68: 'videomessage',
    }[type];
    const updatedTypings = {
        ...(draft.typings.get(peerId) || {}),
        [variant]: {
            peerIds: typingPeerIds,
            updatedAt,
        },
    };
    draft.typings.set(peerId, updatedTypings);
    return [
        async function clearTypings() {
            await sleep(TYPING_EXPIRATION_TIME);
            return {
                type: 'EngineBatchReceived_TypingsTimedOut',
                peerId,
                typingType: variant,
                timestamp: updatedAt,
            };
        },
    ];
}
function update80(draft, update) {
    const [, unread, unreadUnmuted, showOnlyNotMuted, businessNotify, , headerNotMutedUnread, archive, , archiveMentions,] = update;
    Filters.updateCounters(draft.organisers.filters, {
        unread,
        headerNotMutedUnread,
        unreadUnmuted,
        archive,
        archiveMentions,
        businessNotify,
    });
    draft.viewer.settings.countOnlyNotMuted = Boolean(showOnlyNotMuted);
    return [
        async function updateTitle() {
            return { type: 'CountersUpdate', idleCounter: headerNotMutedUnread };
        },
    ];
}
function update91(draft, update, now) {
    const [, subtype, peerIdRaw, memberIdRaw, duration] = update;
    const convo = draft.convos.get(Peer.resolveId(peerIdRaw));
    if (!convo || convo.kind !== 'ChatConvo') {
        return [];
    }
    const memberId = Peer.resolveId(memberIdRaw);
    switch (subtype) {
        case 1:
        case 2:
            if (memberId === draft.viewer.id) {
                const timestamp = duration ? now + duration * 1000 : undefined;
                Convo.restrictViewerToWrite(convo, 'restricted_to_write_in_chat', timestamp);
                Convo.updateIsDrafted(convo, false);
                Organisers.refresh(draft.organisers, convo);
            }
            ChatMembers.restrictMemberToWrite(convo.members, memberId);
            break;
        case 3:
            if (memberId === draft.viewer.id) {
                Convo.allowViewerToWrite(convo);
                const peerDrafts = draft.composerDrafts[convo.peerId];
                if (peerDrafts && peerDrafts[peerDrafts.length - 1]) {
                    Convo.updateIsDrafted(convo, true);
                    Organisers.refresh(draft.organisers, convo);
                }
            }
            ChatMembers.allowMemberToWrite(convo.members, memberId);
            break;
        default:
            exhaustivenessCheck(subtype);
    }
    return [];
}
function update114(draft, update) {
    const [, { peer_id }] = update;
    const peerId = Peer.resolveId(peer_id);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    const push = fromLongpollPushSettings(update);
    Convo.updatePush(convo, push);
    return [];
}
function update115(draft, update) {
    const [, payload] = update;
    const { browserNotifications } = draft.viewer.settings;
    return [
        async function ({ calls, notification }) {
            if (!calls) {
                return {
                    type: 'Noop',
                };
            }
            calls.showIncomingCall(payload);
            if (!browserNotifications) {
                return {
                    type: 'Noop',
                };
            }
            const peerId = Peer.resolveId(payload.from_id);
            let caller = '';
            let image;
            if (payload.caller_info) {
                caller = `${payload.caller_info.first_name} ${payload.caller_info.last_name}`;
                image = payload.caller_info.photo_400;
            }
            /**
             * Если есть информация о чате, используем её вместо информации о звонящем
             *
             * Особенность звонков – при любом (!) НЕ прямом звонке они всегда присылают и caller_info, chat_info
             *
             * Даже если звонок будет создан вне чата, они, судя по всему, создают чат звонка и присылают информацию
             * об этом чате звонка про который никто не знает. И при этом мы всегда получаем информацию caller_info о том
             * кто добавил нас в звонок. Сейчас выводим по аналогии с UI звонков, то есть показываем всегда информацию
             * о чате в котором нас добавили в звонок, и если информации нет, выводи информацию о звонящем.
             *
             * В случае прямого звонка там просто не приходит chat_info, и выводим информацию о звонящем
             */
            if (payload.chat_info) {
                caller = payload.chat_info.title;
                image = payload.chat_info.photo_400;
            }
            notification.notify({
                kind: 'call',
                peerId,
                caller,
                image,
            }, peerId);
            return {
                type: 'Noop',
            };
        },
    ];
}
function update119(draft, update) {
    const [, data] = update;
    const peerId = Peer.resolveId(data.peer_id);
    const ownerId = Peer.resolveId(data.owner_id);
    const convo = draft.convos.get(peerId);
    const peer = draft.peers.get(peerId);
    const owner = draft.peers.get(ownerId);
    const messageEvent = convo && peer && owner ? fromApiMessageEvent(peer, owner, data) : undefined;
    draft.botKeyboardEvent = messageEvent;
    return [];
}
function update120(draft, update) {
    const [, rawTags] = update;
    if (rawTags.length) {
        const tagMap = draft.organisers.tags.items.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
        setTags(draft, rawTags.map((item) => fromApiTag(item, tagMap[item.id]?.peerIds)));
    }
    return [];
}
function update121(_draft, update, featureFlags) {
    const [, , userId] = update;
    if (featureFlags.vkm_enable_schedule_edu) {
        return [
            async function ({ api }) {
                try {
                    const apiEduSchedule = await api.fetch('messagesEdu.getUserSchedule', {
                        user_ids: userId.toString(),
                    });
                    const eduSchedule = apiEduSchedule[0];
                    if (!eduSchedule) {
                        return {
                            type: 'Noop',
                        };
                    }
                    const { intervals } = convertEduSchedule(eduSchedule);
                    return {
                        type: 'RefetchEduSchedule_RequestCompleted',
                        userId: Peer.resolveRealId('User', userId),
                        intervals,
                    };
                }
                catch {
                    return {
                        type: 'Noop',
                    };
                }
            },
        ];
    }
    return [];
}
function update501(draft, update, featureFlags, envFeatureFlags) {
    if (featureFlags.vkm_get_folderinfo_before_add) {
        return [
            async function refetchFolders({ api }) {
                try {
                    const apiFolders = await api.fetch('messages.getFolders', {
                        with_peers: 1,
                        supported_types: Folder.getSupportedTypes(featureFlags, envFeatureFlags),
                    });
                    const [, folderId] = update;
                    return {
                        type: 'RefetchFoldersRequest_RequestCompleted',
                        apiFolders,
                        folderId: Folder.resolveId(folderId),
                    };
                }
                catch {
                    return {
                        type: 'Noop',
                    };
                }
            },
        ];
    }
    const [folder] = insertFolders(draft, [fromEngineFolder(update)], featureFlags, envFeatureFlags);
    if (folder) {
        if (folder.type === 'managed_groups') {
            Queue.addQueueId(draft.activeQueueIds, Queue.MANAGED_GROUPS_COUNTERS_QUEUE);
        }
        return [
            folder.type === 'managed_groups' &&
                async function reconnectQueueAndUpdateCounters({ queue }) {
                    queue.reconnect();
                    return {
                        type: 'CountersUpdate',
                    };
                },
            folder.type === 'channels' &&
                async function updateChannelsCounter() {
                    return {
                        type: 'CountersUpdate',
                    };
                },
            /**
             * Если мы получили папку с саблистом, тогда необходимо
             * сделать запрос в getFolders для получения саблистов
             */
            folder.hasSublist &&
                featureFlags.vkm_sublists_in_folder &&
                async function refetchFolders({ api }) {
                    try {
                        const apiFolders = await api.fetch('messages.getFolders', {
                            with_peers: 1,
                            supported_types: Folder.getSupportedTypes(featureFlags, envFeatureFlags),
                        });
                        return {
                            type: 'RefetchFoldersRequest_RequestCompleted',
                            apiFolders,
                            folderId: folder.id,
                        };
                    }
                    catch {
                        return {
                            type: 'Noop',
                        };
                    }
                },
        ];
    }
    return [];
}
function update502(draft, update) {
    const [, folderId] = update;
    const id = Folder.resolveId(folderId);
    const folderType = draft.organisers.folders.find((f) => f.id === id)?.type;
    Folder.deleteFolder(draft.organisers.folders, id);
    // Если удаленная папка - СС, тогда должны удалить ее id из Queue и сделать reconnect с актуальными ids
    if (folderType === 'managed_groups') {
        Queue.deleteQueueId(draft.activeQueueIds, Queue.MANAGED_GROUPS_COUNTERS_QUEUE);
        return [
            async function reconnectQueueAndUpdateCounters({ queue }) {
                queue.reconnect();
                return {
                    type: 'CountersUpdate',
                };
            },
        ];
    }
    if (folderType === 'channels') {
        return [
            async function updateChannlesCounter() {
                return {
                    type: 'CountersUpdate',
                };
            },
        ];
    }
    return [];
}
function update503(draft, update) {
    const [, folderId, name] = update;
    const id = Folder.resolveId(folderId);
    const folder = draft.organisers.folders.find((f) => f.id === id);
    //Событие изменения имени прилетело раньше самой папки?
    if (!folder) {
        return [];
    }
    Folder.setName(folder, name);
    return [];
}
function update504(draft, update) {
    const [, folderId, ...peerIds] = update;
    const id = Folder.resolveId(folderId);
    const convos = getConvosByIds(draft, peerIds);
    const folder = draft.organisers.folders.find((f) => f.id === id);
    //Событие изменения имени прилетело раньше самой папки?
    if (!folder) {
        return [];
    }
    addConvosToFolder(draft, id, convos);
    return [];
}
function update505(draft, update) {
    const [, folderId, ...peerIds] = update;
    const id = Folder.resolveId(folderId);
    const convos = getConvosByIds(draft, peerIds);
    const folder = draft.organisers.folders.find((f) => f.id === id);
    //Событие изменения имени прилетело раньше самой папки?
    if (!folder) {
        return [];
    }
    removeConvosFromFolder(draft, id, convos);
    return [];
}
function update506(draft, update) {
    const [, ...order] = update;
    Folder.reorderFolders(draft.organisers.folders, order.map((id) => Folder.resolveId(id)));
    return [];
}
function update507(draft, update) {
    const [, ...counters] = update;
    for (const counter of counters) {
        if (counter.length < 3) {
            continue;
        }
        const id = Folder.resolveId(counter[0]);
        const folderType = draft.organisers.folders.find((f) => f.id === id)?.type;
        /**
         * Тк counters для папки сообществ мы обновляем через Queue, то здесь
         * прилетают некорректные каунтеры (0, 0) и мы должны скипнуть эту папку
         */
        if (folderType === 'managed_groups') {
            continue;
        }
        Folder.setUnreadCounters(draft.organisers.folders, id, counter[1], counter[2]);
    }
    return [];
}
function update508(draft, update) {
    const [, folderId] = update;
    const id = Folder.resolveId(folderId);
    const folder = draft.organisers.folders.find((f) => f.id === id);
    // Инвалидируем только существующие папки
    if (!folder) {
        return [];
    }
    // Просто сбрасываем состояние папки
    Folder.replaceFolder(draft.organisers.folders, fromApiFolder({
        id: id,
        name: folder.name,
        type: folder.type,
        flags: Folder.convertFlags({
            type: folder.type,
            hasSublist: folder.hasSublist,
        }),
    }));
    return [];
}
/**
 * Сейчас актуальные флаги прилетают в 501 событии (21 версия ЛП)
 * Данное событие оставили намеренно, тк возможно пригодится.
 */
function update509(draft, update) {
    const [, folderId, flags] = update;
    const id = Folder.resolveId(folderId);
    const folder = draft.organisers.folders.find((f) => f.id === id);
    if (folder) {
        Folder.updateFlags(folder, flags);
    }
    return [];
}
function update701(draft, update) {
    const [, rawPeerId] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    if (convo.kind !== 'ChatConvo') {
        return [];
    }
    convo.isDeleted = true;
    /**
     * 701 событие приходит для удаления и восстановление чата, однако сейчас в проде нет восстановления чата, поэтому
     * 701 событие рассматриваем только как удаление чата и обновляем флаг в памяти. Когда доедет новый формат события
     * на движки, нужно обновить обработку здесь, и добавить поддержку параметра для различия, чат был удален, или
     * восстановлен.
     *
     * @todo Добавить в 701 признак, что чат был именно удален или восстановлен
     */
    return [];
}
function update122(draft, update) {
    const [, , rawPeerId] = update;
    const peerId = Peer.resolveId(rawPeerId);
    if (!Peer.isUserPeerId(peerId)) {
        // Обновляем роли только для пользователей
        return [];
    }
    return [
        async function ({ api }) {
            try {
                const profiles = await api.fetch('users.get', {
                    user_ids: peerId.toString(),
                });
                return {
                    type: 'RefetchViewerRoles_RequestCompleted',
                    peerId,
                    profiles,
                };
            }
            catch {
                return {
                    type: 'Noop',
                };
            }
        },
    ];
}
function update123(draft, update) {
    const [, { peer_id: rawPeerId, user_id: rawUserId }] = update;
    const peerId = Peer.resolveRealId('User', rawPeerId);
    const userId = Peer.resolveRealId('User', rawUserId);
    draft.userDetails[peerId] = {
        ...draft.userDetails[peerId],
        is_answer_locked: true,
        answer_locked_by_user_id: userId,
    };
    return [];
}
function update124(draft, update) {
    const [, { peer_id: rawPeerId, user_id: rawUserId }] = update;
    const peerId = Peer.resolveRealId('User', rawPeerId);
    const userId = Peer.resolveRealId('User', rawUserId);
    draft.userDetails[peerId] = {
        ...draft.userDetails[peerId],
        is_answer_locked: false,
        answer_locked_by_user_id: userId,
    };
    return [];
}
/**
 *
 * Новое сообщение в отложках
 */
function update201(draft, update) {
    const [, rawPeerId, rawCmid, rawRandomId] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    const randomId = Message.resolveRandomId(rawRandomId);
    const cmid = Message.resolveCmid(rawCmid);
    const pendingMsg = Convo.findMessageByRandomId(convo, randomId, true);
    /**
     * У нас нет никакой информации, что это за сообщение (скорее всего отправлено с другого клиента) - оптимистично обновить кэш не получится!
     */
    const isUnknownMessage = !pendingMsg && !Convo.findMessageByCmid(convo, cmid, true);
    if (isUnknownMessage) {
        resetConvoPostponedHistoryCache(convo);
        return [];
    }
    if (!pendingMsg) {
        return [];
    }
    const postponedNormal = Message.createPostponedFromQueued(pendingMsg, cmid, pendingMsg.extra?.delayedUntil);
    /**
     * Так как мы можем послать отложку из обычной истории чата, то мы попадаем
     * в состояние гонки, когда переходя в экран отложенных к нам параллельно летит и ответ от лп
     * и загружается вся история отложенных. Если мы получили все отложки, а потом получили ответ лп, то возможна ситуация
     * задвоения отправленного сообщения.
     */
    if (Convo.findMessageByCmid(convo, postponedNormal.cmid, true)) {
        Convo.removePostponedPending(convo, randomId);
        return [];
    }
    Convo.appendMessage(convo, postponedNormal, 0, false);
    return [];
}
/**
 *
 * Удаление отложенного сообщения
 */
function update202(draft, update) {
    const [, rawPeerId, rawCmid] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    const cmid = Message.resolveCmid(rawCmid);
    const message = Convo.findMessageByCmid(convo, cmid, true);
    if (message) {
        Convo.deleteMessage(convo, message, { isRestorable: false });
    }
    return [];
}
/**
 *
 * Отложенное сообщение было отредактировано
 */
function update203(draft, update) {
    const [, rawPeerId, rawOldCmid, rawCmid] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    const cmid = Message.resolveCmid(rawCmid);
    const oldCmid = Message.resolveCmid(rawOldCmid);
    const editingMsg = Convo.findMessageByCmid(convo, oldCmid, true);
    if (editingMsg &&
        editingMsg.kind === 'Normal' &&
        editingMsg.editing?.status === 'pending') {
        Convo.deleteMessage(convo, editingMsg, { isRestorable: false });
        Message.updateEditedPostponed(editingMsg, cmid);
        Convo.appendMessage(convo, editingMsg, 0, false);
    }
    else {
        resetConvoPostponedHistoryCache(convo);
    }
    return [];
}
/**
 *
 * При отправке отложенного произошла ошибка
 */
function update205(draft, update) {
    const [, rawPeerId, rawCmid] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    const cmid = Message.resolveCmid(rawCmid);
    const message = Convo.findMessageByCmid(convo, cmid, true);
    const isUnknownMessage = !(message && message.kind === 'Normal');
    if (isUnknownMessage) {
        resetConvoPostponedHistoryCache(convo);
        return [];
    }
    Message.updatePostponedFailedStatus(message, true);
    return [];
}
function update601(draft, update, featureFlags, apiExtended) {
    const [, subtype, rawPeerId, rawCmid] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const cmid = Message.resolveCmid(rawCmid);
    let total = 0;
    let reactions = [];
    let reactionId;
    switch (subtype) {
        case 1: {
            const [, , , , rawReactionId, totalReactions, ...rest] = update;
            total = totalReactions;
            reactions = rest;
            reactionId = Reaction.resolveId(rawReactionId);
            break;
        }
        case 2:
        case 3:
        case 4: {
            const [, , , , totalReactions, ...rest] = update;
            total = totalReactions;
            reactions = rest;
            break;
        }
        default:
            /**
             * Ничего не делаем, просто игнорируем апдейты, которых не знаем.
             * При этом добавляем тайпгарды, чтобы быть уверенными, что мы точно обработали все,
             * что знаем.
             */
            const _typeguard = subtype;
            return [];
    }
    const messageReactions = [];
    let index = 0;
    for (let i = 0; i < total; i++) {
        const fieldsCount = reactions[index];
        if (!fieldsCount) {
            return [];
        }
        const reactionFields = reactions.slice(index + 1, index + 1 + fieldsCount);
        index += 1 + fieldsCount;
        const [reactionId, reactionsCount, peersCount] = reactionFields.slice(0, 3);
        //Что-то не то с событием, такого быть не должно
        if (reactionId === undefined ||
            reactionsCount === undefined ||
            peersCount === undefined) {
            return [];
        }
        const peerIds = reactionFields
            .slice(3, 3 + peersCount)
            .map(Peer.resolveId)
            .sort((a, b) => a - b);
        messageReactions.push({
            reactionId: Reaction.resolveId(reactionId),
            count: reactionsCount,
            peerIds: new Set(peerIds),
        });
    }
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    let reactedCount = 0;
    let reactedPeerIds = [];
    let activeReaction;
    if (subtype === 2 || subtype === 4) {
        reactedCount = reactions[index] ?? 0;
        const reactedPeersStartIndex = index + 1;
        const reactedPeersEndIndex = reactedPeersStartIndex + Math.min(3, reactedCount ?? 0);
        reactedPeerIds = reactions
            .slice(reactedPeersStartIndex, reactedPeersEndIndex)
            .map((id) => {
            return Peer.resolveId(id);
        });
        activeReaction = reactions[reactedPeersEndIndex]
            ? Reaction.resolveId(reactions[reactedPeersEndIndex])
            : undefined;
    }
    let message;
    //Обновляем данные о реакции в сообщении из кэша
    //Если его нет, то ничего не делаем, реакции загрузятся вместе с сообщением
    message = Convo.findMessageByCmid(convo, cmid);
    if (message?.kind === 'Normal') {
        if (subtype === 1 || subtype === 3) {
            Message.setCurrentUserReaction(message, reactionId);
        }
        Message.setReactions(message, messageReactions);
    }
    //Если сообщения нет в кэше, то должно прийти в gLPH
    if (!message) {
        const messageApi = apiExtended?.messagesByPeerId.get(peerId)?.get(cmid);
        message = messageApi && fromApiMessage(featureFlags, messageApi).message;
        //Если сообщении нет в кэше и в данных из gLPH, то наши полномочия всё
        if (!message) {
            return [];
        }
    }
    else {
        message = isDraft(message) ? current(message) : message;
    }
    const messageKey = `${peerId}-${cmid}`;
    const prevReactedPeers = draft.messageReactedPeers.get(messageKey) ?? new Set();
    let newReactedPeers = [];
    switch (subtype) {
        //Для события установки реакции нам нужно найти пиров, которые до этого не ставили реакции
        case 2:
            newReactedPeers = reactedPeerIds.filter((id) => !prevReactedPeers.has(id));
            draft.messageReactedPeers.set(messageKey, new Set([...prevReactedPeers, ...newReactedPeers]));
            break;
        //Для события удаления просто удаляем их из кэша, т.к. последовательность установить-удалить-установить
        //должна вызывать нотификацию
        case 4:
            const updatedSet = new Set([...prevReactedPeers].filter((id) => !reactedPeerIds.includes(id)));
            if (updatedSet.size === 0) {
                draft.messageReactedPeers.delete(messageKey);
                break;
            }
            draft.messageReactedPeers.set(messageKey, updatedSet);
            break;
        default:
            break;
    }
    //Подчищаем кэш, чтобы не разростался
    if (draft.messageReactedPeers.size > MAX_REACTED_PEERS_CACHE) {
        const keys = draft.messageReactedPeers.keys();
        const count = draft.messageReactedPeers.size - MAX_REACTED_PEERS_CACHE;
        for (let i = 0; i < count; i++) {
            draft.messageReactedPeers.delete(keys.next().value);
        }
    }
    const reactedPeers = newReactedPeers
        .map((id) => {
        const peer = draft.peers.get(Peer.resolveId(id));
        const currentPeer = isDraft(peer) ? current(peer) : peer;
        return currentPeer ?? null;
    })
        .filter((peer) => peer !== null);
    const isReactionNotificationEnabled = !Convo.isMuted(convo) &&
        draft.viewer.settings.push.messageReaction.isEnabled;
    const hasUnknownReactions = messageReactions.some((reaction) => !draft.messageReactionsConfig.assets.has(reaction.reactionId));
    if (activeReaction) {
        Convo.setUnreadReaction(convo, cmid, activeReaction);
    }
    return [
        async function notifyReaction({ notification }) {
            if (message?.kind !== 'Normal') {
                return {
                    type: 'Noop',
                };
            }
            const isMessageOutdated = message.sentAt < Date.now() - Time.HalfDay;
            const messageReactionsCount = [...message.reactions.values()].reduce((acc, cur) => acc + cur.count, 0);
            const shouldNotify = isReactionNotificationEnabled &&
                message.isOut &&
                subtype === 2 &&
                !isMessageOutdated &&
                messageReactionsCount < 8 &&
                //Если отреагировавших 0, то или убрали реакцию или мы сами себе поставили
                reactedCount > 0;
            if (shouldNotify) {
                notification.notify({
                    kind: 'reaction',
                    message,
                    reactedPeers,
                    reactedCount,
                });
            }
            return {
                type: 'Noop',
            };
        },
        hasUnknownReactions &&
            async function ({ channelEngine }) {
                return {
                    type: 'InvalidateMessageReactions',
                    force: true,
                    shouldFetchChannelReactionsMapping: !!channelEngine,
                };
            },
    ];
}
function update602(draft, update) {
    const [, rawPeerId, ...extra] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    const unreadCmidsAmount = extra[0];
    if (unreadCmidsAmount === undefined) {
        // Движок прислал непонятный эвент, мы не сможем его обработать
        return [];
    }
    const rawCmids = extra.slice(1, unreadCmidsAmount + 1);
    const cmids = rawCmids.map(Message.resolveCmid);
    Convo.replaceUnreadReactions(convo, cmids);
    return [];
}
function update603(draft, update) {
    const [, subtype] = update;
    switch (subtype) {
        // Удаляем некоторые беседы из памяти
        case 0: {
            const [, , , ...peerIds] = update;
            peerIds.forEach((peerId) => {
                draft.precreatedConvos.peerIds.delete(peerId);
            });
            break;
        }
        // Добавляем беседы в память
        case 1: {
            const [, , , ...peerIds] = update;
            peerIds.forEach((peerId) => {
                draft.precreatedConvos.peerIds.add(peerId);
            });
            break;
        }
        /**
         * Стираем все беседы из памяти
         *
         * UI должен будет подхватить что список пуст и можно загрузить больше данных, поэтому
         * логика дозагрузки ложится на плечи UI и других базовых алгоритмов
         */
        case 2: {
            draft.precreatedConvos = {
                peerIds: new Set(),
                hasMore: true,
            };
            break;
        }
        default:
            exhaustivenessCheck(subtype);
    }
    return [];
}
function update604(draft, update) {
    const [, isEnabled, featureId] = update;
    switch (featureId) {
        case EDU_INTEGRATION_BANNER_ID:
            draft.eduIntegrationBanner.isEnabled = isEnabled === 1;
            break;
        default:
            exhaustivenessCheck(featureId);
    }
    return [];
}
function update10001to10003(draft, update, featureFlags, apiExtended) {
    const [type, rawCmid, flags, rawPeerId, , , , , ,] = update;
    const cmid = Message.resolveCmid(rawCmid);
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    const convertedFlags = Message.convertFlags(flags);
    if (type === 10003) {
        const { isDeleted: wasRestored, isSpam } = convertedFlags;
        // Если сообщение было восстановлено из спама или из удаленных
        if ((wasRestored || isSpam) && rawCmid) {
            const apiMessage = apiExtended?.messagesByPeerId
                .get(rawPeerId)
                ?.get(rawCmid);
            if (apiMessage) {
                const result = fromApiMessage(featureFlags, apiMessage);
                Convo.restoreMessage(convo, result.message, result.mentions.hasDirect || result.mentions.hasMass);
            }
        }
    }
    const variant = {
        10001: 'replace',
        10002: 'set',
        10003: 'unset',
    }[type];
    const { status } = Convo.findHistoryNodeByCmid(convo, cmid);
    if (status === 'NotLoaded') {
        return [];
    }
    Convo.updateMessageFlags(convo, cmid, variant, flags);
    return [
        async () => {
            if (type !== 10002) {
                return {
                    type: 'Noop',
                };
            }
            const { isDeleted, isDeletedForAll } = convertedFlags;
            if (isDeleted || isDeletedForAll) {
                return {
                    type: 'ComposerDraftsUpdateNeeded',
                    peerId,
                    foreignKind: "message" /* ComposerDraft.ForwardKind.Message */,
                    itemsToDelete: [{ peerId, cmid }],
                };
            }
            return {
                type: 'Noop',
            };
        },
    ];
}
function update10004to10005and10018to10019(draft, update, featureFlags, apiExtended) {
    const [, rawCmid] = update;
    let rawPeerId;
    switch (update[0]) {
        case 10004:
            rawPeerId = update[4];
            break;
        case 10005:
        case 10018:
            rawPeerId = update[3];
            break;
        case 10019:
            rawPeerId = update[2];
            break;
        default:
            exhaustivenessCheck(update);
    }
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    /**
     * Сообщение, полученное из АПИ при дозагрузке данных,
     * может содержать больше данных, чем сообщение лонгполла.
     *
     * Например, если оно содержит аттачи.
     *
     * Поэтому мы предпочитаем АПИ сообщение тому, что из лонгполла.
     */
    const apiMessage = apiExtended?.messagesByPeerId.get(rawPeerId)?.get(rawCmid);
    const apiConvo = apiExtended?.convos.get(peerId);
    let message;
    let mentions;
    let keyboardEvent;
    const engineResult = IEngine.isIncompleteUpdate(update) || update[0] === 10019
        ? undefined
        : fromEngineMessage(featureFlags, update, draft.ownerId, findReplyInCacheCallback(convo));
    if (apiMessage) {
        const apiResult = fromApiMessage(featureFlags, apiMessage);
        /**
         * Если сообщение из АПИ пришло раньше, чем 601 событие (новая реацкия), то
         * не перезаписываем реакции - проставим и анимируем их уже в 601, чтобы не было рассинхрона
         */
        if (apiResult.message.kind === 'Normal') {
            const cachedMessage = findMessageByCmid(convo, apiResult.message.cmid);
            if (cachedMessage && cachedMessage.kind === 'Normal') {
                message = {
                    ...apiResult.message,
                    reactions: cachedMessage.reactions,
                    reactionId: cachedMessage.reactionId,
                };
            }
            else {
                message = apiResult.message;
            }
        }
        else {
            message = apiResult.message;
        }
        mentions = apiResult.mentions;
    }
    else if (!engineResult) {
        /**
         * На этом этапе мы уже должны были распарсить сообщение из АПИ.
         * Если его нет, то делать нам по сути нечего, поскольку данных в исходном
         * кортеже не хватает.
         * Такое может возникнуть, например, если:
         * - сообщение удалено для всех (АПИ не вернет его, чтобы сохранить приватность)
         * - сообщение отправлено в спам
         * Есть еще какие-то кейсы, о которых мы не знаем. Такие кейсы крайне редкие.
         * Но мы решили, что будем считать, что АПИ не возвращает такие данные не случайно,
         * поэтому просто пропустим обработку.
         *
         * В случае если появятся репорты, можно поискать предыдущую версию обработки
         * этого кейса в истории гита и вернуться к поиску причин.
         */
        return [];
    }
    else {
        message = engineResult.message;
        mentions = engineResult.mentions;
    }
    /**
     * Обработка клавиатуры из апи нам нужна, пока еще существует механизм
     * дозапроса данных через gLPH, потому что он возвращает историю с короткими
     * кортежами сообщений, которые не содержат никакой информации, и рассчитывают,
     * что мы достанем всю инфу из готовых объектов
     */
    if (apiConvo?.current_keyboard) {
        const keyboard = fromApiKeyboard(apiConvo.current_keyboard, peerId);
        if (keyboard.kind === 'InputKeyboard') {
            keyboardEvent = { kind: 'InputKeyboardUpsertEvent', keyboard };
        }
    }
    else if (apiConvo) {
        keyboardEvent = { kind: 'InputKeyboardDeleteEvent' };
    }
    else if (engineResult) {
        keyboardEvent = engineResult.keyboardEvent;
    }
    /**
     * Временное решение (ME-49095): даже если у нас есть сообщение из апи,
     * достаем информацию о меншене из лонгполла, так как там больше инфы.
     * В частности, из лонгполла мы можем понять, был масс меншен либо личное
     * упоминание. Это нам важно понимать для того, чтобы показать или
     * не показать уведомление (ведь масс меншены могут быть отключены)
     *
     * Задача на поддержку нового поля из апи у бэкенда:
     * https://jira.mvk.com/browse/ME-49216
     */
    if (engineResult) {
        mentions = engineResult.mentions;
    }
    switch (update[0]) {
        case 10004: {
            /**
             * Тайпинги приходят только раз в 5 секунд,
             * поэтому обновляем их оптимистично
             */
            const typings = draft.typings.get(convo.peerId);
            if (typings) {
                for (const type of TypingVariants) {
                    const typing = typings[type];
                    if (!typing || !typing.peerIds.has(message.authorId)) {
                        continue;
                    }
                    typing.peerIds.delete(message.authorId);
                    if (typing.peerIds.size === 0) {
                        delete typings[type];
                    }
                    if (Object.keys(typings).length === 0) {
                        draft.typings.delete(convo.peerId);
                    }
                }
            }
            const minorSortId = update[3];
            const hasMention = mentions.hasDirect || mentions.hasMass;
            /**
             * TODO удалить в рамках https://jira.mvk.com/browse/ME-54285 .
             * после того, как разберемся с проблемой https://jira.mvk.com/browse/ME-53355.
             */
            if (hasMention && isDev) {
                if (convo.inReadBy >= message.cmid) {
                    throw new Error(`Peer: ${convo.peerId} получено сообщение с меншеном со cmid: ${message.cmid} и границей прочитанности: ${convo.inReadBy}`);
                }
                if (message.isOut) {
                    throw new Error(`Peer: ${convo.peerId} получен меншен в исходящем сообщении`);
                }
            }
            if (convo.kind === 'ChatConvo') {
                Convo.appendMessage(convo, message, minorSortId, hasMention, keyboardEvent);
            }
            else {
                Convo.appendMessage(convo, message, minorSortId, false, keyboardEvent);
            }
            Organisers.refresh(draft.organisers, convo);
            if (!draft.locks.convosCleanup.has(convo.peerId)) {
                Convo.cleanup(convo);
            }
            if (keyboardEvent?.kind === 'InputKeyboardUpsertEvent') {
                const hiddenBotKeyboardId = draft.hiddenBotKeyboards.get(convo.peerId);
                if (hiddenBotKeyboardId &&
                    hiddenBotKeyboardId !==
                        BotKeyboard.resolveKeyboardId(keyboardEvent.keyboard)) {
                    draft.hiddenBotKeyboards.delete(convo.peerId);
                }
            }
            const flags = Message.convertFlags(update[2]);
            const isMessageUnread = Convo.isMessageUnread(convo, message);
            if (message.kind === 'Normal' &&
                !message.isOut &&
                message.attaches.sticker &&
                Sticker.isPopupSticker(message.attaches.sticker) &&
                !convo.isStickersPopupAutoplayDisabledByAdmin &&
                !convo.isStickersPopupAutoplayDisabledByUser &&
                !isPopupAutoplayOnGetOff()) {
                Attach.triggerPopupStickerAutoplayOnReceive(message);
            }
            const { browserNotifications, soundNotifications, push } = draft.viewer.settings;
            let convoKindPushSettings = null;
            switch (convo.kind) {
                case 'UserConvo':
                    convoKindPushSettings = push.userConvo;
                    break;
                case 'ChatConvo':
                    convoKindPushSettings = push.chatConvo;
                    break;
                case 'GroupConvo':
                    convoKindPushSettings = push.groupConvo;
                    break;
                default:
            }
            /**
             * Отправка пуша несмотря на расписание недоступности
             */
            let needSendNotifyDespriteSchedule = true;
            if (featureFlags.vkm_enable_schedule_edu &&
                Viewer.isEdu(draft.viewer.profileType)) {
                /**
                 * Получаем отправителя сообщения
                 */
                let sender = draft.peers.get(peerId);
                /**
                 * Если это групповой чат, то нам нужно "вытащить" отправителя сообщения
                 */
                if (sender?.kind === 'Chat') {
                    const senderId = Number(update?.[7]?.from);
                    const peerId = Peer.resolveId(senderId);
                    sender = draft.peers.get(peerId);
                }
                /**
                 * Получаем информацию о том, есть ли у нас одна из ролей администратора, учителя или сотрудника и
                 * находимся ли мы в режиме недоступности
                 */
                const viewer = draft.peers.get(draft.viewer.id);
                const isUnavailabilityModeEnable = viewer?.kind === 'User' &&
                    Peer.hasEduOrganizationalRoles(viewer) &&
                    Peer.getUnavailabilityEnabled(viewer);
                /**
                 * Если у отправителя одна из ролей ученика или родителя и мы находимся в расписании недоступности,
                 * то пуш отправлять не нужно
                 */
                if (isUnavailabilityModeEnable &&
                    sender?.kind === 'User' &&
                    !Peer.hasEduOrganizationalRoles(sender)) {
                    needSendNotifyDespriteSchedule = false;
                }
            }
            /**
             * Нужно ли отправлять уведомления любого типа
             */
            const shouldNotify = !message.isOut &&
                !flags.noPush &&
                isMessageUnread &&
                needSendNotifyDespriteSchedule;
            /**
             * Нужно ли отправлять пуши.
             */
            let shouldNotifyPush = shouldNotify && browserNotifications && convoKindPushSettings?.isEnabled;
            /**
             * Нужно ли отправлять уведомления для подписавшихся на них.
             */
            const shouldNotifyListeners = shouldNotify && (!Convo.isMuted(convo) || hasMention);
            /**
             * Нужно ли проигрывать звук нового сообщения.
             */
            const shouldNotifySound = shouldNotify &&
                soundNotifications &&
                !message.isSilent &&
                !Convo.isMuted(convo);
            // Регулируем отправку пушей с помощью настроек текущего чата и настроек
            // пользователя.
            if (shouldNotifyPush) {
                // Чат / пользователь запрещает все пуши.
                if (convo.push.mode === 'nothing' || push.mention === 'nothing') {
                    shouldNotifyPush = false;
                }
                // Чат / пользователь разрешает только прямые упоминания.
                else if (convo.push.mode === 'direct-mention' ||
                    push.mention === 'direct-mention') {
                    shouldNotifyPush = !Convo.isMuted(convo) || mentions.hasDirect;
                }
                // Чат разрешает все пуши.
                else {
                    shouldNotifyPush = !Convo.isMuted(convo) || hasMention;
                }
            }
            const marusiaEvent = Peer.isMarusia(peerId) &&
                message.kind === 'Normal' && {
                type: 'add_message',
                payload: {
                    randomId: Number(message.randomId),
                    text: Message.toRawText(message),
                    isOutbound: message.isOut,
                    local: false,
                    payload: update[7]?.payload,
                    attachIds: Attach.ids(message.attaches),
                },
            };
            const newUnreadCount = convo.unreadCount;
            const newInReadBy = convo.inReadBy;
            if (message.kind === 'Service' &&
                (message.action.type === 'conversation_style_update' ||
                    message.action.type === 'conversation_style_update_action')) {
                convo.styleId = ThemeStyle.resolveStyleId(message.action.styleId || 'system');
            }
            const isConvoInAllFilter = draft.organisers.filters.all.ids.convos.has(peerId);
            return [
                async function newMessageNotify({ notification }) {
                    if (shouldNotifyPush) {
                        notification.notify({ kind: 'message', message }, peerId);
                    }
                    if (shouldNotifyListeners) {
                        notification.notifyListeners({ kind: 'message' });
                    }
                    if (shouldNotifySound) {
                        notification.playSound();
                    }
                    return {
                        type: 'Noop',
                    };
                },
                convo.kind === 'ChatConvo' &&
                    convo.activeCall &&
                    async function updateCallsCounter({ calls }) {
                        calls?.updateConvoCounter(peerId, newInReadBy, newUnreadCount);
                        return { type: 'Noop' };
                    },
                marusiaEvent &&
                    async function notifyMarusia({ marusia }) {
                        marusia?.handleAction(marusiaEvent);
                        return { type: 'Noop' };
                    },
                async function updateVKCOMRightColumnConvos() {
                    return {
                        type: 'VKCOMRightColumnConvosUpdated',
                        change: 'add',
                        peerId,
                        reason: 'newMessage',
                    };
                },
                isConvoInAllFilter &&
                    async function addConvosToSearchIndex() {
                        return {
                            type: 'AddConvosToSearchIndex',
                            peerIds: [peerId],
                        };
                    },
            ];
        }
        case 10005:
        case 10018:
        case 10019: {
            Convo.replaceMessage(convo, message, mentions.hasDirect || mentions.hasMass, keyboardEvent);
            if (message.kind === 'Expired') {
                /**
                 * Исчезающие сообщения можно только реплаить, и нельзя форвардить,
                 * поэтому заменяем только реплаи.
                 */
                Convo.replaceExpiredReplies(convo, message.cmid);
            }
            return [
                async () => ({
                    type: 'ComposerDraftsUpdateNeeded',
                    peerId,
                    foreignKind: "message" /* ComposerDraft.ForwardKind.Message */,
                    itemsToDelete: message.kind === 'Expired'
                        ? [{ peerId, cmid: message.cmid }]
                        : undefined,
                    itemsToReplace: message.kind === 'Normal' ? [message] : undefined,
                }),
            ];
        }
        default:
            return exhaustivenessCheck(update);
    }
}
function update10006to10007(draft, update) {
    const [type, rawPeerId, rawCmid, rawNewUnreadCount] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const cmid = Message.resolveCmid(rawCmid);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    /**
     * GLPH не возвращает счетчик непрочитанных, в таком случае считаем его сами.
     */
    const newUnreadCount = rawNewUnreadCount ?? Convo.calcUnreadCountWithInReadBy(convo, cmid);
    if (type === 10006) {
        Convo.readInUntil(convo, cmid, newUnreadCount);
        /**
         * При написании сообщения в избранное автоматически приходит событие
         * прочтения _входящего_ сообщение, но сообщения в избранном мы рендерим
         * как исходящие, поэтому, чтобы отметить его прочитанным, нужно прочитать
         * _исходящее_ сообщение
         */
        if (Peer.isFavorites(convo.peerId, draft.ownerId)) {
            Convo.readOutUntil(convo, cmid);
        }
    }
    else {
        Convo.readOutUntil(convo, cmid);
    }
    Organisers.refresh(draft.organisers, convo);
    return [
        type === 10006 &&
            convo.kind === 'ChatConvo' &&
            convo.activeCall &&
            async function updateCallsCounter({ calls }) {
                calls?.updateConvoCounter(peerId, rawCmid, newUnreadCount);
                return { type: 'Noop' };
            },
        type === 10006 &&
            async function removeInBoundMessagesNotification({ notification }) {
                // удаляем пуш-уведомления о входящем сообщении, если мы его прочли
                notification.removeNotification(peerId, cmid);
                return { type: 'Noop' };
            },
    ];
}
function update10014(draft, update, featureFlags, apiExtended) {
    const [, rawPeerId] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    const apiConvo = apiExtended?.convos.get(rawPeerId);
    const newerConvo = apiConvo && fromApiConvo(featureFlags, apiConvo);
    if (!newerConvo) {
        /**
         * Мы перезагружаем беседу в этом эвенте,
         * поэтому у нас обязательно должна быть newerConvo
         */
        return [
            async function reportMissingExtended({ logger }) {
                logger.error('[EngineBatchReceived]', new Error(`В ${update[0]} отсутствует дозагруженная беседа`));
                return {
                    type: 'Noop',
                };
            },
        ];
    }
    Organisers.refresh(draft.organisers, newerConvo.convo);
    return [];
}
function update10013(draft, update, featureFlags, apiExtended) {
    const [, rawPeerId, rawUntilCmid] = update;
    const peerId = Peer.resolveId(rawPeerId);
    const untilCmid = Message.resolveCmid(rawUntilCmid);
    const convo = draft.convos.get(peerId);
    if (!convo) {
        return [];
    }
    /**
     * Обеспечиваем идемпотентность обработки эвента.
     * Если айдишник сообщения из апдейта не соответствуют айдишнику
     * последнего сообщения беседы, значит мы уже обрабатывали этот апдейт
     */
    if (History.lastCmid(convo.history) !== untilCmid) {
        return [];
    }
    const apiConvo = apiExtended?.convos.get(rawPeerId);
    const newerConvo = apiConvo && fromApiConvo(featureFlags, apiConvo);
    if (!newerConvo) {
        /**
         * Мы перезагружаем беседу в этом эвенте,
         * поэтому у нас обязательно должна быть newerConvo
         */
        return [
            async function reportMissingExtended({ logger }) {
                logger.error('[EngineBatchReceived]', new Error(`В ${update[0]} отсутствует дозагруженная беседа`));
                return {
                    type: 'Noop',
                };
            },
        ];
    }
    return [];
}
function update80005(draft, _update) {
    return [refetchSpaceCounters(draft)];
}
function resetConvoPostponedHistoryCache(convoDraft) {
    convoDraft.postponed.history = {
        confirmed: [
            {
                kind: 'GapNode',
                fromCmid: 1,
                toCmid: 1,
            },
        ],
        /**
         * Локально зафейленные на клиенте сообщения инвалидировать не нужно. Здесь источник правды - мы.
         * Апи нам их не вернёт.
         */
        pending: convoDraft.postponed.history.pending.filter((pendinNode) => pendinNode.item.hasFailed),
    };
    convoDraft.postponed.loaded = false;
}
//# sourceMappingURL=EngineBatchReceived.js.map