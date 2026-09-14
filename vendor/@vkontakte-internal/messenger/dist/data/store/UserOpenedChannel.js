import { API_ERROR_ACCESS, API_ERROR_MESSAGES_SHOULD_BE_EDU, API_ERROR_MESSAGES_SHOULD_NOT_BE_EDU, API_ERROR_NOT_FOUND, } from '@vkontakte-internal/api-schema-typescript';
import * as TextChunk from '../../core/model/TextChunk';
import * as Channel from '../../core/model/Channel';
import * as Organisers from '../../core/model/Organisers';
import * as History from '../../core/model/History';
import { exhaustivenessCheck, isDev } from '../../core/utils/misc';
import { IApi } from '../env/IApi';
import { insertChannels, insertPeers, insertMissingChannelInfo } from './State';
import { MAX_POLL_CMIDS } from '../store/PollChannelPosts';
const ACCESS_ERROR_SUBCODE_GEOBLOCKED = 1173;
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'UserOpenedChannel': {
            const { channelId } = action;
            const count = draft.locks.channelsCleanup.get(channelId) || 0;
            draft.locks.channelsCleanup.set(channelId, count + 1);
            const channel = draft.channels.get(channelId);
            if (channel) {
                /**
                 * Если канал уже есть в кэше, то сходим (шортполл) за свежими комментариями и реакциями.
                 * Нас интересует самый базовый кейс: пользователь зашёл в канал и просматривает самые свежие посты.
                 * Именно там мы ожидаем "живые" посты, с которыми взаимодействуют пользователи и вероятность изменения
                 * кол-ва реакций и комментариев в которых больше всего.
                 *
                 * Нет смысла "прыгать" по всем гэпам в истории и собирать cmid, чем выше гэп, тем "холоднее" пост
                 * и меньше активности, а следовательно и матожидание изменений стремится к нулю. Их можно дозагрузить уже во время
                 * просмотра пользователем истории (где будет доступ к вьюпорту).
                 *
                 * Одновременно с этим сходим за недостающей информацией по каналу при необходимости, т.к. не все поля могут
                 * приходить при инициализации каналов.
                 */
                if (channel.kind === 'Channel') {
                    /**
                     * По аналогии с iOS, ходим при каждом открытии канала за нужной информацией, даже если канал есть в кэше.
                     *
                     * Мы это делаем для того, чтобы получить данные, которые до этого не пришли по ряду причин (например, если
                     * в `channels.get` в объект группы невозможно впихнуть определённое поле ввиду нагрузки на движки / сложности
                     * или скорости похода за нужными данными, то за этим полем мы пойдём уже отсюда). После чего мы точечно
                     * обновяем / заполняем поля для нужного канала.
                     */
                    const missingInfoFx = 
                    // Дозагружаем данные только для новых каналов.
                    Channel.isCommunityChannel(channel) &&
                        // Для модерационных меток нам недостаёт поля `warning_notification` в `channels.get`.
                        // TODO: Если для какой-то фичи не хватает данных тоже, то все тогглы нужно перенести в обработку
                        // `UserOpenedChannel_ChannelMissingInfoRequestCompleted`, где формируются поля для обновления в
                        // `insertMissingChannelInfo`. А пока располагаем тоггл здесь, чтобы не ходить бесполезно в API.
                        featureFlags.vkm_channel_warning_modals
                        ? [
                            async function ({ api }) {
                                try {
                                    const response = await api.fetch('channels.getById', {
                                        channel_ids: channelId.toString(),
                                        extended: 1,
                                    }, {
                                        retries: 2,
                                    });
                                    return {
                                        type: 'UserOpenedChannel_ChannelMissingInfoRequestCompleted',
                                        channelId,
                                        response,
                                        hasFailed: false,
                                    };
                                }
                                catch (err) {
                                    if (err instanceof IApi.RequestError) {
                                        return {
                                            type: 'UserOpenedChannel_ChannelMissingInfoRequestCompleted',
                                            channelId,
                                            hasFailed: true,
                                            errCode: err.code,
                                            errSubcode: err.subcode,
                                            errText: err.text,
                                        };
                                    }
                                    return {
                                        type: 'UserOpenedChannel_ChannelMissingInfoRequestCompleted',
                                        channelId,
                                        hasFailed: true,
                                    };
                                }
                            },
                        ]
                        : [];
                    const confirmedHistory = channel.history.confirmed;
                    const hasOnlyLastPost = confirmedHistory.length === 2 &&
                        confirmedHistory[0]?.kind === 'GapNode' &&
                        confirmedHistory[1]?.kind === 'Node';
                    if (hasOnlyLastPost) {
                        /**
                         * Небольшая оптимизация: если мы переходим из списка каналов (то есть у нас есть только последнее сообщение)
                         * то не будем запрашивать комментарии и реакции, они придут с подгрузкой истории в том числе и для самого последнего сообщения.
                         */
                        return missingInfoFx;
                    }
                    const lastCmid = History.lastCmid(channel.history);
                    if (!lastCmid) {
                        return missingInfoFx;
                    }
                    const slice = History.around(channel.history, lastCmid);
                    if (slice === undefined) {
                        return missingInfoFx;
                    }
                    const cmids = slice.nodes
                        .map((node) => {
                        const cmid = History.nodeCmid(node);
                        return cmid;
                    })
                        .filter(Boolean)
                        .slice(-MAX_POLL_CMIDS);
                    const fromCmid = cmids[0];
                    const toCmid = cmids[cmids.length - 1];
                    if (fromCmid && toCmid) {
                        return [
                            ...missingInfoFx,
                            async () => {
                                return {
                                    type: 'PollChannelPosts',
                                    channelId,
                                    fromCmid,
                                    toCmid,
                                };
                            },
                        ];
                    }
                    return missingInfoFx;
                }
                return [];
            }
            /**
             * Если канал не был найден в кэше, загружаем его
             */
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('channels.getById', {
                            channel_ids: channelId.toString(),
                            extended: 1,
                        }, {
                            retries: 2,
                        });
                        return {
                            type: 'UserOpenedChannel_ChannelRequestCompleted',
                            channelId,
                            response,
                            hasFailed: false,
                        };
                    }
                    catch (err) {
                        if (err instanceof IApi.RequestError) {
                            return {
                                type: 'UserOpenedChannel_ChannelRequestCompleted',
                                channelId,
                                hasFailed: true,
                                errCode: err.code,
                                errSubcode: err.subcode,
                                errText: err.text,
                            };
                        }
                        else {
                            return {
                                type: 'UserOpenedChannel_ChannelRequestCompleted',
                                channelId,
                                hasFailed: true,
                            };
                        }
                    }
                },
            ];
        }
        case 'UserOpenedChannel_ChannelRequestCompleted': {
            const { hasFailed, channelId, response, errCode, errSubcode, errText } = action;
            if (hasFailed &&
                (errCode === API_ERROR_MESSAGES_SHOULD_BE_EDU ||
                    errCode === API_ERROR_MESSAGES_SHOULD_NOT_BE_EDU)) {
                draft.channels.set(channelId, {
                    id: channelId,
                    kind: 'ChannelRestricted',
                    needSwitchAccount: true,
                });
                return [];
            }
            if (hasFailed && errCode === API_ERROR_ACCESS) {
                draft.channels.set(channelId, {
                    id: channelId,
                    kind: 'ChannelRestricted',
                    type: errSubcode === ACCESS_ERROR_SUBCODE_GEOBLOCKED
                        ? 'geo_blocked'
                        : 'banned',
                    message: errText ? TextChunk.fromServerText(errText) : undefined,
                });
                return [];
            }
            /**
             * Ошибка 104 говорит, что канал не найден, но так же это может значить, что канал заблокировали по какой-то причине
             * Надо получить группу и посмотреть на поле deactivated, чтобы точно понять
             */
            if (hasFailed && errCode === API_ERROR_NOT_FOUND) {
                draft.channels.set(channelId, {
                    id: channelId,
                    kind: 'ChannelRestricted',
                });
                return [];
            }
            if (!response) {
                return [];
            }
            insertPeers(draft, {
                apiUsers: response.profiles || [],
                apiGroups: response.groups || [],
                apiContacts: [],
            });
            insertChannels(draft, {
                apiChannels: response.items || [],
                apiGroups: response.groups || [],
                featureFlags,
            });
            const channel = draft.channels.get(channelId);
            /**
             * Данная ошибка не должна никогда срабатывать, так как экшин вызывается только при наличии channel
             */
            if (!channel) {
                if (isDev) {
                    throw new Error('Диалог не был найден');
                }
                return [];
            }
            if (channel.kind === 'ChannelRestricted') {
                return [];
            }
            if (channel.isMember) {
                Organisers.refreshChannels(draft.organisers, channel);
            }
            return [];
        }
        case 'UserOpenedChannel_NotFoundChannelRequestCompleted': {
            const { channelId, response } = action;
            insertPeers(draft, {
                apiUsers: [],
                apiGroups: response?.groups || [],
                apiContacts: [],
            });
            const group = response?.groups?.[0];
            if (group && group.deactivated) {
                draft.channels.set(channelId, {
                    id: channelId,
                    kind: 'ChannelRestricted',
                    type: group.deactivated_type,
                    message: group.deactivated_message
                        ? TextChunk.fromTrustedServerText(group.deactivated_message)
                        : undefined,
                });
            }
            return [];
        }
        case 'UserOpenedChannel_ChannelMissingInfoRequestCompleted': {
            const { hasFailed, response } = action;
            if (hasFailed || !response) {
                return [];
            }
            const [group] = response.groups || [];
            if (!group) {
                if (isDev) {
                    throw new Error('С бэка не приходит нужная группа для канала для обновления данных');
                }
                return [];
            }
            const [apiChannel] = response.items || [];
            if (!apiChannel) {
                if (isDev) {
                    throw new Error('С бэка не приходит нужный канал для обновления данных');
                }
                return [];
            }
            void insertMissingChannelInfo(draft, apiChannel, group, ['warningNotification'], featureFlags);
            return [];
        }
        case 'UserClosedChannel': {
            const { channelId } = action;
            const count = draft.locks.channelsCleanup.get(channelId);
            if (count && count > 1) {
                draft.locks.channelsCleanup.set(channelId, count - 1);
                return [];
            }
            draft.locks.channelsCleanup.delete(channelId);
            const channel = draft.channels.get(channelId);
            if (!channel) {
                return [];
            }
            if (channel.kind === 'ChannelRestricted') {
                return [];
            }
            Channel.cleanup(channel);
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserOpenedChannel.js.map