import { insertChannels, insertPeers } from '../store/State';
import { exhaustivenessCheck, sleep } from '../../core/utils/misc';
import * as Organisers from '../../core/model/Organisers';
import * as ChannelFilters from '../../core/model/ChannelFilters';
import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import * as Peer from '../../core/model/Peer';
import * as Chain from '../../core/model/Chain';
import { fromApiPost, fromApiPostonedPost } from '../converter/PostConverter';
import { CHANNELS_GLPH_TIMEOUT, CHANNELS_PER_PAGE } from '../../core/config/config';
function optimizeExtended(apiChannelsMessages) {
    const channelsMessagesById = new Map();
    for (const apiChannelMessage of apiChannelsMessages) {
        let posts = channelsMessagesById.get(apiChannelMessage.channel_id);
        if (!posts) {
            posts = new Map();
            channelsMessagesById.set(apiChannelMessage.channel_id, posts);
        }
        posts.set(apiChannelMessage.cmid, apiChannelMessage);
    }
    return channelsMessagesById;
}
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'ChannelEngineBatchReceived': {
            switch (action.variant.kind) {
                case 'FromChannelEngine': {
                    return handleFromChannelEngine(draft, action.variant, featureFlags);
                }
                case 'FromChannelEngineWithMissingData': {
                    return handleFromChannelEngineWithMissingData(draft, action.variant, featureFlags);
                }
                case 'FromChannelEngineApiHistory': {
                    return handleFromChannelEngineApiHistory(draft, action.variant, featureFlags);
                }
                case 'FromChannelEngineApiChannels': {
                    return handleFromChannelEngineApiChannels(draft, action.variant, featureFlags);
                }
                default:
                    return exhaustivenessCheck(action.variant);
            }
        }
        case 'ComposerDraftsUpdateNeeded':
        case 'UserOpenedChannel':
        case 'UserLeftChannel':
        case 'CountersUpdate': {
            // ВНИМАНИЕ!!!
            // Добавлять сюда другие внешние экшены не надо!
            // Обрабатывается в reducer.ts
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
function handleFromChannelEngine(draft, variant, featureFlags) {
    const { next } = variant;
    // Используется только для ChannelWSEngine, чтобы явно снять 'resyncing'
    if (next.kind === 'Connected') {
        draft.channelConn.status = 'running';
        return [
            async function ({ channelWSEngine }) {
                if (!channelWSEngine) {
                    return {
                        type: 'Noop',
                    };
                }
                return {
                    type: 'ChannelEngineBatchReceived',
                    variant: {
                        kind: 'FromChannelEngine',
                        next: await channelWSEngine.poll(),
                    },
                };
            },
        ];
    }
    // Используется только для ChannelWSEngine
    if (next.kind === 'RuntimeError') {
        return handleRuntimeErrors(draft, next);
    }
    if (next.kind === 'Failure') {
        draft.channelConn.status = 'resyncing';
        const { ts, channelOffsetMap, userOffset } = draft.channelConn;
        // Создаем копию, чтобы использовать channelOffsetMap за пределами immer
        const channelOffsetMapCopy = new Map(channelOffsetMap);
        const reconnectAttempts = draft.channelConn.reconnectAttempts++;
        return [
            async function resyncChannels({ api, channelEngine, channelWSEngine }) {
                if (channelWSEngine || !channelEngine) {
                    return {
                        type: 'Noop',
                    };
                }
                // Не будем спамить АПИ, подождем чуть-чуть для ресинка.
                // Иначе в случае постоянных разрывов лп мы будем перезапрашивать
                // gLPH как бешеные.
                const timeout = Math.min(2 ** reconnectAttempts * 500, 10 * 1000);
                await sleep(timeout);
                let res;
                // Хотя количество ретраев у этого вызова бесконечное, он
                // все равно может сфейлится при аборте.
                // Такой аборт случается при рефреше страницы в браузере
                // и спамит ошибкам в Сентри.
                // Поэтому схендлим этот кейс, чтобы их избежать.
                try {
                    res = await api.fetch('channels.getLongPollHistory', {
                        lp_version: channelEngine.version,
                        ts,
                        // Тут лимит взят просто из головы.
                        // Пытаемся запрашивать не слишком мало и не слишком много.
                        limit: 1000,
                        extended: 1,
                    }, { retries: Infinity, timeout: CHANNELS_GLPH_TIMEOUT });
                }
                catch {
                    return {
                        type: 'Noop',
                    };
                }
                channelEngine.connect({
                    ...res.credentials,
                    // Будем загружать историю в несколько заходов,
                    // поэтому заменим тут ts на пришедший.
                    ts: res.new_ts,
                });
                return {
                    type: 'ChannelEngineBatchReceived',
                    variant: {
                        kind: 'FromChannelEngineApiHistory',
                        ts: res.new_ts,
                        // К сожалению, АПИ не может сгенерировать нам достаточно подходящие типы,
                        // поэтому тут мы вынуждены кастить
                        history: res.history,
                        apiPosts: res.messages || [],
                        apiChannels: res.channels || [],
                        apiGroups: res.groups || [],
                        apiProfiles: res.profiles || [],
                    },
                };
            },
            async function resyncChannelsWS({ channelWSEngine }) {
                if (channelWSEngine) {
                    /**
                     * В данном случае EventHub вернет нам все, что случилось
                     * с нашего текущего ts до серверного ts. Аналогично GLPH.
                     */
                    channelWSEngine.connect({
                        offsetMap: channelOffsetMapCopy,
                        userOffset,
                    });
                    return {
                        type: 'ChannelEngineBatchReceived',
                        variant: {
                            kind: 'FromChannelEngine',
                            next: await channelWSEngine.poll(),
                        },
                    };
                }
                return {
                    type: 'Noop',
                };
            },
        ];
    }
    const missing = collectMissingData(draft, next);
    if (missing.channelIds.size > 0 ||
        missing.userIds.size > 0 ||
        missing.postCmidsByChannel.size > 0) {
        return [
            async function fetchMissingData({ api }) {
                try {
                    const response = await api.fetchMany([
                        missing.channelIds.size > 0 && {
                            method: 'channels.getById',
                            params: {
                                channel_ids: Array.from(missing.channelIds).join(','),
                                extended: 1,
                            },
                        },
                        missing.userIds.size > 0 && {
                            method: 'users.get',
                            params: {
                                user_ids: Array.from(missing.userIds)
                                    .map(Peer.toRealId)
                                    .join(','),
                                extended: 1,
                            },
                        },
                        ...Array.from(missing.postCmidsByChannel).map(([channelId, cmids]) => ({
                            method: 'channels.getMessagesById',
                            params: {
                                channel_id: channelId,
                                cmids: Array.from(cmids).join(','),
                                extended: 1,
                            },
                        })),
                    ], { retries: Infinity });
                    return {
                        type: 'ChannelEngineBatchReceived',
                        variant: {
                            kind: 'FromChannelEngineWithMissingData',
                            next,
                            response,
                        },
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
    draft.channelConn.reconnectAttempts = 0;
    return handleUpdates(draft, next, featureFlags);
}
function handleFromChannelEngineWithMissingData(draft, variant, featureFlags) {
    const { next, response: [responseChannels, responseUsers, ...responseChannelsPosts], } = variant;
    let channelsMessagesById = new Map();
    if (responseChannelsPosts) {
        responseChannelsPosts.forEach((response) => {
            insertPeers(draft, {
                apiUsers: response.profiles || [],
                apiGroups: response.groups || [],
                apiContacts: [],
            });
            if (response.items?.length) {
                channelsMessagesById = optimizeExtended(response.items);
            }
        });
    }
    if (responseChannels) {
        insertChannels(draft, {
            apiChannels: responseChannels.items || [],
            apiGroups: responseChannels.groups || [],
            dangerouslyMerge: true,
            featureFlags,
        });
    }
    if (responseUsers || responseChannels) {
        insertPeers(draft, {
            apiUsers: [
                ...(responseUsers || []),
                ...(responseChannels?.profiles || []),
            ],
            apiGroups: responseChannels?.groups || [],
            apiContacts: [],
        });
    }
    return handleUpdates(draft, next, featureFlags, { channelsMessagesById });
}
function handleFromChannelEngineApiHistory(draft, variant, featureFlags) {
    const { ts, history, apiChannels, apiGroups, apiPosts, apiProfiles } = variant;
    const postsByChannelId = new Map();
    for (const apiPost of apiPosts) {
        let posts = postsByChannelId.get(apiPost.channel_id);
        if (!posts) {
            posts = new Map();
            postsByChannelId.set(apiPost.channel_id, posts);
        }
        posts.set(apiPost.cmid, apiPost);
    }
    insertPeers(draft, { apiUsers: apiProfiles, apiGroups, apiContacts: [] }, {
        dangerouslyOverwrite: true,
    });
    insertChannels(draft, {
        apiChannels,
        apiGroups,
        dangerouslyMerge: true,
        featureFlags,
    });
    const next = {
        kind: 'Batch',
        ts,
        updates: history.reduce((acc, update) => {
            switch (update[0]) {
                case 70001:
                case 70002: {
                    const post = postsByChannelId.get(update[1])?.get(update[2]);
                    if (!post) {
                        // Пост нам может не вернуться в этих сообщениях из gLPH
                        // в случае, если он позже был удален.
                        // В таком случае мы проигнорируем этот эвент.
                        // При этом нам все равно придет эвент на удаление,
                        // благодаря которому мы выставим верный minorSortId
                        return acc;
                    }
                    acc.push([...update, post]);
                    return acc;
                }
                default:
                    acc.push(update);
                    return acc;
            }
        }, []),
    };
    return handleUpdates(draft, next, featureFlags);
}
function handleFromChannelEngineApiChannels(draft, variant, featureFlags) {
    insertChannels(draft, {
        apiChannels: variant.apiChannels || [],
        apiGroups: variant.apiGroups || [],
        dangerouslyMerge: true,
        featureFlags,
    });
    insertPeers(draft, {
        apiUsers: variant.apiProfiles || [],
        apiGroups: variant.apiGroups || [],
        apiContacts: [],
    }, {
        dangerouslyOverwrite: true,
    });
    return [
        async function ({ channelWSEngine }) {
            if (!channelWSEngine) {
                return {
                    type: 'Noop',
                };
            }
            return {
                type: 'ChannelEngineBatchReceived',
                variant: {
                    kind: 'FromChannelEngine',
                    next: await channelWSEngine.poll(),
                },
            };
        },
    ];
}
function handleUpdates(draft, next, featureFlags, apiExtended) {
    draft.channelConn.status = 'running';
    switch (next.kind) {
        case 'Batch':
            draft.channelConn.ts = next.ts;
            break;
        case 'ChannelQueueBatch':
            const [channelId, offset] = next.offset;
            draft.channelConn.channelOffsetMap.set(channelId, offset);
            break;
        case 'UserQueueBatch':
            draft.channelConn.userOffset = next.userOffset;
            break;
        default:
            exhaustivenessCheck(next);
    }
    const handleUpdate = (update) => {
        switch (update[0]) {
            case 70001:
                return update70001(draft, update, apiExtended);
            case 70002:
                return update70002(draft, update, apiExtended);
            case 70003:
                return update70003(draft, update);
            case 70004:
                return update70004(draft, update);
            case 70005:
                return update70005(draft, update);
            case 70006:
                return update70006(draft, update);
            case 70007:
                return update70007(draft, update);
            case 70008:
                return update70008(draft, update);
            case 70009:
                return update70009(draft, update, next.kind === 'UserQueueBatch');
            case 70010:
                return update70010(draft, update, apiExtended);
            case 70011:
                return update[1].flatMap(handleUpdate);
            case 70012:
                return update70012(draft, update);
            case 70013:
                return update70013(draft, update);
            case 70014:
                return update70014(draft, update);
            case 70015:
                return update70015(draft, update);
            case 70017:
                return update70017(draft, update);
            case 70018:
                return update70018(draft, update);
            case 70019:
                return update70019(draft, update);
            case 70020:
                return update70020(draft, update);
            case 70021:
                return update70021(draft, update);
            case 70022:
                return update70022(draft, update);
            default:
                /**
                 * Ничего не делаем, просто игнорируем апдейты, которых не знаем.
                 * При этом добавляем тайпгарды, чтобы быть уверенными, что мы точно обработали все,
                 * что знаем.
                 */
                const _typeguard = update;
                return [];
        }
    };
    const effects = next.updates.flatMap(handleUpdate);
    return [
        ...effects,
        async function pollChannelEngine({ channelEngine, channelWSEngine }) {
            const lpEngineEnabled = !channelWSEngine && channelEngine;
            const wsEngineEnabled = !!channelWSEngine;
            if (lpEngineEnabled) {
                return {
                    type: 'ChannelEngineBatchReceived',
                    variant: {
                        kind: 'FromChannelEngine',
                        next: await channelEngine.poll(),
                    },
                };
            }
            if (wsEngineEnabled) {
                return {
                    type: 'ChannelEngineBatchReceived',
                    variant: {
                        kind: 'FromChannelEngine',
                        next: await channelWSEngine.poll(),
                    },
                };
            }
            return {
                type: 'Noop',
            };
        },
    ];
}
/**
 * Проверка кэша на наличие всех необходимых данных.
 */
function collectMissingData(draft, next) {
    const channelIds = new Set();
    const userIds = new Set();
    const postCmidsByChannel = new Map();
    function handleUpdate(update) {
        switch (update[0]) {
            case 70001: {
                const [, rawChannelId, cmid, , apiPost] = update;
                const channelId = Channel.resolveId(rawChannelId);
                if (!draft.channels.has(channelId)) {
                    channelIds.add(channelId);
                }
                if (!apiPost) {
                    const postCmid = Post.resolveCmid(cmid);
                    const postsSet = postCmidsByChannel.get(channelId);
                    if (postsSet) {
                        postsSet.add(postCmid);
                    }
                    else {
                        postCmidsByChannel.set(channelId, new Set([postCmid]));
                    }
                    break;
                }
                // Пост содержит в себе репост
                if (apiPost.attachments?.[0]?.wall?.copy_history?.[0]?.from_id) {
                    const authorId = Peer.resolveId(apiPost.attachments[0].wall.copy_history[0].from_id);
                    if (Peer.isUserPeerId(authorId)) {
                        userIds.add(authorId);
                        break;
                    }
                    if (Peer.isGroupPeerId(authorId)) {
                        channelIds.add(Channel.resolveId(authorId));
                        break;
                    }
                }
                break;
            }
            case 70002: {
                const [, rawChannelId, cmid, apiPost] = update;
                const channelId = Channel.resolveId(rawChannelId);
                if (!draft.channels.has(channelId)) {
                    break;
                }
                if (!apiPost) {
                    const postCmid = Post.resolveCmid(cmid);
                    const postsSet = postCmidsByChannel.get(channelId);
                    if (postsSet) {
                        postsSet.add(postCmid);
                    }
                    else {
                        postCmidsByChannel.set(channelId, new Set([postCmid]));
                    }
                    break;
                }
                break;
            }
            case 70010: {
                const [, rawChannelId, cmid, , apiPost] = update;
                const channelId = Channel.resolveId(rawChannelId);
                if (!draft.channels.has(channelId)) {
                    break;
                }
                if (!apiPost) {
                    const postCmid = Post.resolveCmid(cmid);
                    const postsSet = postCmidsByChannel.get(channelId);
                    if (postsSet) {
                        postsSet.add(postCmid);
                    }
                    else {
                        postCmidsByChannel.set(channelId, new Set([postCmid]));
                    }
                    break;
                }
                break;
            }
            case 70003:
            case 70004:
                /**
                 * Эти события будем просто игнорировать при отсутствии
                 * канала в кэше
                 */
                break;
            case 70005: {
                const [, rawChannelId, isUnarchived] = update;
                /**
                 * Пока канал в архиве, для него не приходят риал-тайм апдейты.
                 * Таким образом на момент разархивации его состояние в кэше
                 * может отстать от реального на сервере.
                 * Поэтому перезагузим его.
                 */
                if (isUnarchived) {
                    const channelId = Channel.resolveId(rawChannelId);
                    channelIds.add(channelId);
                }
                break;
            }
            case 70006: {
                /**
                 * Игнорируем, так как это изменение прав в группе (канале) для текущего юзера
                 */
                break;
            }
            case 70007: {
                /**
                 * Игнорируем, так как просто меняется флаг мьюта
                 */
                break;
            }
            case 70008: {
                /**
                 *  Игнорируем так как это просто кол-во непрочитанных
                 */
                break;
            }
            case 70009: {
                const [, rawChannelId, isMember] = update;
                const channelId = Channel.resolveId(rawChannelId);
                const channel = draft.channels.get(channelId);
                /**
                 * Если мы приняли инвайт в канал и он у нас есть в кэше,
                 * то дозапрашивать его не будем, модифицируем локально,
                 * тем самым не потеряв важный признак (признак инвайта) в обработчике 70009 события
                 * и правильно обновив счётчик инвайтов.
                 */
                if (channel &&
                    channel.kind === 'Channel' &&
                    ChannelFilters.isInboundRequest(channel, draft.organisers.channelFilters)) {
                    break;
                }
                if (isMember) {
                    channelIds.add(channelId);
                }
                break;
            }
            case 70011: {
                for (const batchUpdate of update[1]) {
                    handleUpdate(batchUpdate);
                }
                break;
            }
            case 70012: {
                const [, events] = update;
                events.forEach(([rawChannelId]) => {
                    const channelId = Channel.resolveId(rawChannelId);
                    if (!draft.channels.has(channelId)) {
                        channelIds.add(channelId);
                    }
                });
                break;
            }
            case 70013:
            case 70014: {
                break;
            }
            case 70015: {
                const [, rawChannelId] = update;
                const channelId = Channel.resolveId(rawChannelId);
                channelIds.add(channelId);
                break;
            }
            case 70017:
            case 70018: {
                const [, rawChannelId] = update;
                const channelId = Channel.resolveId(rawChannelId);
                if (!draft.channels.has(channelId)) {
                    channelIds.add(channelId);
                }
                break;
            }
            case 70019:
            case 70020: {
                break;
            }
            case 70021: {
                const [, rawChannelId] = update;
                const channelId = Channel.resolveId(rawChannelId);
                if (!draft.channels.has(channelId)) {
                    void channelIds.add(channelId);
                }
                break;
            }
            case 70022:
                break;
            default:
                /**
                 * Ничего не делаем, просто игнорируем апдейты, которых не знаем.
                 * При этом добавляем тайпгарды, чтобы быть уверенными, что мы точно обработали все,
                 * что знаем.
                 */
                const _typeguard = update;
                break;
        }
    }
    for (const update of next.updates) {
        handleUpdate(update);
    }
    return {
        channelIds,
        userIds,
        postCmidsByChannel,
    };
}
function handleRuntimeErrors(draft, next) {
    return [
        async function ({ api, channelWSEngine }) {
            if (!channelWSEngine) {
                return {
                    type: 'Noop',
                };
            }
            const { code } = next.error;
            switch (code) {
                case 2001: {
                    // Пока не обрабатываем для очередей каналов
                    if (next.queueLabel !== 'big_channel_user') {
                        break;
                    }
                    // Хотя количество ретраев у этого вызова бесконечное, он может сфейлится при аборте.
                    // Такой аборт случается при рефреше страницы в браузере и спамит в Сентри.
                    // Поэтому хендлим этот кейс, чтобы их избежать.
                    try {
                        const responseChannels = await api.fetch('channels.get', {
                            count: CHANNELS_PER_PAGE,
                            extended: 1,
                        }, { retries: Infinity });
                        // Пока шел запрос выше, channelWSEngine мог успеть разорвать соединение
                        if (channelWSEngine.isConnected()) {
                            const newOffset = next.error.data['new offset'];
                            channelWSEngine.subscribe({
                                // offsetMap пустой, потому что переподписываемся только на пользовательскую очередь
                                offsetMap: new Map(),
                                userOffset: newOffset,
                            });
                        }
                        return {
                            type: 'ChannelEngineBatchReceived',
                            variant: {
                                kind: 'FromChannelEngineApiChannels',
                                apiChannels: responseChannels.items || [],
                                apiGroups: responseChannels.groups || [],
                                apiProfiles: responseChannels.profiles || [],
                            },
                        };
                    }
                    catch {
                        return {
                            type: 'Noop',
                        };
                    }
                }
                case 1100:
                case 1200:
                case 1201:
                case 1202:
                case 1203:
                case 1204:
                case 2000: {
                    break;
                }
                default:
                    return exhaustivenessCheck(code);
            }
            return {
                type: 'ChannelEngineBatchReceived',
                variant: {
                    kind: 'FromChannelEngine',
                    next: await channelWSEngine.poll(),
                },
            };
        },
    ];
}
function update70001(draft, update, apiExtended) {
    const [, rawChannelId, rawCmid, minorSortId, lpPost] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    Channel.setSortId(channel, { minorSortId });
    const apiPost = apiExtended?.channelsMessagesById.get(channelId)?.get(rawCmid) || lpPost;
    // Невозвожный случай, так как если в лп нет поста, значит мы сходили за ним в апи
    if (!apiPost) {
        return [];
    }
    const { post, reactions } = fromApiPost(apiPost);
    for (const reaction of reactions) {
        draft.reactionsOld.set(reaction.id, reaction);
    }
    Channel.appendPost(channel, post);
    Organisers.refreshChannels(draft.organisers, channel);
    if (!draft.locks.channelsCleanup.has(channelId)) {
        Channel.cleanup(channel);
    }
    return [];
}
function update70002(draft, update, apiExtended) {
    const [, rawChannelId, rawCmid, lpPost] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    const apiPost = apiExtended?.channelsMessagesById.get(channelId)?.get(rawCmid) || lpPost;
    // Невозвожный случай, так как если в лп нет поста, значит мы сходили за ним в апи
    if (!apiPost) {
        return [];
    }
    const { post: newPost, reactions } = fromApiPost(apiPost);
    const prevPostNode = Channel.findPostByCmid(channel, newPost.cmid);
    const post = Post.merge(newPost, prevPostNode?.kind === 'Node' ? prevPostNode.item : undefined);
    for (const reaction of reactions) {
        draft.reactionsOld.set(reaction.id, reaction);
    }
    Channel.replacePost(channel, post);
    return [
        async () => ({
            type: 'ComposerDraftsUpdateNeeded',
            foreignKind: "post" /* ComposerDraft.ForwardKind.Post */,
            itemsToReplace: [post],
        }),
    ];
}
function update70003(draft, update) {
    const [, rawChannelId, rawCmid, minorSortId] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const cmid = Post.resolveCmid(rawCmid);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    Channel.setSortId(channel, { minorSortId });
    Channel.deletePost(channel, cmid, { isRestorable: false });
    return [
        async () => ({
            type: 'ComposerDraftsUpdateNeeded',
            foreignKind: "post" /* ComposerDraft.ForwardKind.Post */,
            itemsToDelete: [{ channelId, cmid }],
        }),
    ];
}
function update70004(draft, update) {
    const [, rawChannelId, rawCmid, unreadCount] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const inReadCmid = Post.resolveCmid(rawCmid);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    Channel.readUntil(channel, inReadCmid, unreadCount);
    Organisers.refreshChannels(draft.organisers, channel);
    return [];
}
function update70005(draft, update) {
    const [, rawChannelId, isUnarchived, archiveTotal] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    Channel.setArchived(channel, !isUnarchived);
    ChannelFilters.updateCounters(draft.organisers.channelFilters, {
        archiveTotal,
    });
    Organisers.refreshChannels(draft.organisers, channel);
    return [
        async function updateCounters() {
            return { type: 'CountersUpdate' };
        },
    ];
}
function update70006(draft, update) {
    const [, rawChannelId, adminLevel, canPost] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    Channel.setRights(channel, { canPost: !!canPost });
    Channel.setAdminLevel(channel, adminLevel);
    return [];
}
function update70007(draft, update) {
    const [, rawChannelId, mutedUntil] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    /**
     * Сейчас приходит значение 0(уведомления включены) или -1(уведомления выключены).
     * В будущем значение > 0 будет timestamp, когда надо включить уведомления.
     */
    Channel.setMuted(channel, mutedUntil !== 0);
    return [];
}
function update70008(draft, update) {
    const [, all, unMuted] = update;
    ChannelFilters.updateCounters(draft.organisers.channelFilters, {
        unread: all,
        unreadUnmuted: unMuted,
    });
    return [
        async function updateCounters() {
            return { type: 'CountersUpdate' };
        },
    ];
}
function update70009(draft, update, isUserQueue) {
    const [, rawChannelId, isMember] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel || channel.kind === 'ChannelRestricted') {
        return [];
    }
    if (isUserQueue) {
        isMember
            ? draft.channelConn.channelOffsetMap.set(channel.id, channel.version ?? 0)
            : draft.channelConn.channelOffsetMap.delete(channel.id);
    }
    Channel.setMembership(channel, !!isMember);
    // Осуществляем подписку на предложенный канал / скрытие предложенного канала.
    if (ChannelFilters.isInboundRequest(channel, draft.organisers.channelFilters)) {
        if (Boolean(isMember)) {
            Channel.acceptInboundRequest(channel, false);
        }
        else {
            Channel.rejectInboundRequest(channel, false);
        }
        const curInboundRequestsTotal = draft.organisers.channelFilters.inboundRequest.totalCount;
        if (curInboundRequestsTotal > 0) {
            ChannelFilters.updateCounters(draft.organisers.channelFilters, {
                inboundRequestsTotal: curInboundRequestsTotal - 1,
            });
        }
        Organisers.refreshChannels(draft.organisers, channel);
    }
    /**
     * Если пришло событие с isMember = true, мы можем быть уверены,
     * что пользователь точно является членом родительского соо.
     * Обратное не гарантировано и надо перезапросить канал.
     */
    if (isMember) {
        channel.isParentGroupMember = !!isMember;
        Organisers.refreshChannels(draft.organisers, channel);
        return [];
    }
    else {
        /**
         * Если канал был удален из драфтов (по причине отписки),
         * тогда надо перезапросить данные о канале для актуализации св-ва isParentGroupMember
         */
        return [
            async function () {
                return {
                    type: 'UserLeftChannel',
                    channelId,
                };
            },
        ];
    }
}
function update70010(draft, update, apiExtended) {
    const [, rawChannelId, rawCmid, , rawPost] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    const apiPost = apiExtended?.channelsMessagesById.get(channelId)?.get(rawCmid) || rawPost;
    // Невозвожный случай, так как если в лп нет поста, значит мы сходили за ним в апи
    if (!apiPost) {
        return [];
    }
    const { post } = fromApiPost(apiPost);
    if (post.kind === 'Normal') {
        Channel.restorePost(channel, post.cmid, post);
    }
    return [];
}
function update70012(draft, update) {
    const [, events] = update;
    events.forEach(([rawChannelId, majorSortId]) => {
        const channelId = Channel.resolveId(rawChannelId);
        const channel = draft.channels.get(channelId);
        if (!channel || channel.kind === 'ChannelRestricted') {
            return;
        }
        Channel.setSortId(channel, { majorSortId: majorSortId });
        Organisers.refreshChannels(draft.organisers, channel);
    });
    return [];
}
function update70013(draft, update) {
    const [, rawChannelId] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    Channel.setMembership(channel, false);
    Channel.setDeletionMark(channel, true);
    Organisers.refreshChannels(draft.organisers, channel);
    const peerId = Peer.resolveId(rawChannelId);
    if (!Peer.isGroupPeerId(peerId)) {
        return [];
    }
    // тк после удаления канала писать в него мы уже не можем, то
    // обновляем пира, чтобы он пропал из бургер меню
    const peer = draft.peers.get(peerId);
    if (peer?.kind === 'Group') {
        peer.canMessage = false;
    }
    return [];
}
function update70014(draft, update) {
    const [, rawChannelId, userId, , reason, endDate, comment] = update;
    const viewerId = draft.viewer.id;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel || channel.kind !== 'Channel') {
        return [];
    }
    if (userId === viewerId) {
        Channel.setBanInfo(channel, { reason, endDate: endDate * 1000, comment });
    }
    return [];
}
function update70015(draft, update) {
    const [, rawChannelId, userId] = update;
    const viewerId = draft.viewer.id;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel || channel.kind !== 'Channel') {
        return [];
    }
    if (userId === viewerId) {
        Channel.setBanInfo(channel, undefined);
    }
    return [];
}
function update70017(draft, update) {
    const [, rawChannelId, , rawPost] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    const { post } = fromApiPostonedPost(rawPost);
    Channel.insertPostponedPosts(channel, [{ id: post.cmid, content: post }]);
    return [];
}
function update70018(draft, update) {
    const [, rawChannelId, , rawPost] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    const { post } = fromApiPostonedPost(rawPost);
    const element = Chain.getElementById(channel.postponed.history, post.cmid);
    if (!element) {
        return [];
    }
    const isTimeChanged = post.sentAt !== element.content.sentAt;
    if (isTimeChanged) {
        Chain.removeElement(channel.postponed.history, post.cmid);
        Channel.insertPostponedPosts(channel, [{ id: post.cmid, content: post }]);
    }
    else {
        element.content = post;
    }
    return [
        async () => ({
            type: 'ComposerDraftsUpdateNeeded',
            foreignKind: "post" /* ComposerDraft.ForwardKind.Post */,
            itemsToReplace: [post],
        }),
    ];
}
function update70019(draft, update) {
    const [, rawChannelId, rawCmid] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const cmid = Post.resolveCmid(rawCmid);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    Channel.isCommunityChannel(channel)
        ? Channel.deleteCommunityChannelsPostponedPost(channel, cmid)
        : Channel.deletePostponedPost(channel, cmid);
    return [];
}
function update70020(draft, update) {
    const [, rawChannelId, count] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel) {
        return [];
    }
    if (channel.kind === 'ChannelRestricted') {
        return [];
    }
    channel.postponed.count = count;
    return [];
}
function update70021(draft, update) {
    const [, rawChannelId] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel || channel.kind !== 'Channel') {
        return [];
    }
    Channel.setIsInboundRequest(channel, true);
    ChannelFilters.push(draft.organisers.channelFilters, 'inboundRequest', [channel], draft.organisers.channelFilters.inboundRequest.hasMore);
    ChannelFilters.updateCounters(draft.organisers.channelFilters, {
        inboundRequestsTotal: draft.organisers.channelFilters.inboundRequest.totalCount + 1,
    });
    return [];
}
function update70022(draft, update) {
    const [, rawChannelId, counter] = update;
    const channelId = Channel.resolveId(rawChannelId);
    const channel = draft.channels.get(channelId);
    if (!channel || channel.kind !== 'Channel') {
        return [];
    }
    if (!Channel.isCommunityChannel(channel)) {
        return [];
    }
    channel.subscribersCount = counter.members_count;
    return [];
}
//# sourceMappingURL=ChannelEngineBatchReceived.js.map