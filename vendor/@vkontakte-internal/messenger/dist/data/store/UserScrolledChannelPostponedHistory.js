import { exhaustivenessCheck } from '../../core/utils/misc';
import { POSTS_PER_PAGE } from '../../core/config/config';
import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import { fromApiPostonedPost } from '../converter/PostConverter';
import { insertPeers } from './State';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserScrolledChannelPostponedHistory': {
            const { channelId, startCmid, direction } = action;
            const channel = draft.channels.get(channelId);
            if (!channel) {
                return [];
            }
            if (channel.kind === 'ChannelRestricted') {
                return [];
            }
            if (draft.locks.getChannelPostponedHistory.has(getLockId(channelId, startCmid || Post.resolveCmid(0)))) {
                return [];
            }
            draft.locks.getChannelPostponedHistory.add(getLockId(channelId, startCmid || Post.resolveCmid(0)));
            // Добавляем +1, чтобы компенсировать startCmid, поскольку он инклюзивный
            // Добавляем еще +1, чтобы не делать лишний запрос, когда мы загружаем последние
            // соообщения сверху (иначе нам придет ровно сколько надо и придется делать
            // еще один запрос по hasMore)
            let count = Math.min(POSTS_PER_PAGE, POSTS_PER_PAGE) + 2;
            let offset;
            switch (direction) {
                case 'backward':
                    /**
                     * Грузим внахлест с загруженными постами, на случай,
                     * если пост со startCmid удален.
                     */
                    offset = -count + 1;
                    break;
                case 'forward':
                    /**
                     * Компенсируем только один раз +1 из count, чтобы грузить внахлест
                     * с загруженными постами, на случай, если пост со startCmid удален.
                     */
                    offset = -1;
                    break;
                case 'around':
                    count = POSTS_PER_PAGE;
                    offset = -Math.floor(count * 0.8);
                    break;
                default:
                    exhaustivenessCheck(direction);
            }
            return [
                async function loadChannelHistory({ api }) {
                    try {
                        const response = await api.fetch('channels.getHistory', {
                            channel_id: channelId,
                            start_cmid: startCmid || -1,
                            count: count,
                            offset: offset,
                            filter: 'postponed',
                            extended: 1,
                        }, { retries: 5 });
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
                                const responseBackwardCount = response.items.filter(({ cmid }) => cmid <= Infinity).length;
                                const requestBackwardCount = count;
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
                            type: 'UserScrolledChannelPostponedHistory_RequestSucceed',
                            channelId,
                            startCmid,
                            response,
                            hasMoreBackward,
                            hasMoreForward,
                            hasMore: hasMoreForward,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserScrolledChannelPostponedHistory_RequestFailed',
                            channelId,
                            startCmid,
                        };
                    }
                },
            ];
        }
        case 'UserScrolledChannelPostponedHistory_RequestSucceed': {
            const { channelId, startCmid, response, hasMore } = action;
            draft.locks.getChannelPostponedHistory.delete(getLockId(channelId, startCmid || Post.resolveCmid(0)));
            const channel = draft.channels.get(channelId);
            /**
             * Такое, например, может случиться, если запрос с сервера шел долго
             * и пользователь за это время удалил беседу.
             */
            if (!channel) {
                return [];
            }
            if (channel.kind === 'ChannelRestricted') {
                return [];
            }
            const posts = [];
            response.items.forEach((apiPost) => {
                const { post } = fromApiPostonedPost(apiPost);
                posts.push({
                    id: post.cmid,
                    content: post,
                });
            });
            channel.postponed.hasMore = hasMore;
            channel.postponed.loaded = true;
            Channel.insertPostponedPosts(channel, posts);
            insertPeers(draft, {
                apiUsers: response.profiles || [],
                apiGroups: response.groups || [],
                apiContacts: [],
            });
            return [];
        }
        case 'UserScrolledChannelPostponedHistory_RequestFailed': {
            const { channelId, startCmid } = action;
            draft.locks.getChannelPostponedHistory.delete(getLockId(channelId, startCmid || Post.resolveCmid(0)));
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
function getLockId(channelId, startCmid) {
    return `${channelId}-${startCmid}`;
}
//# sourceMappingURL=UserScrolledChannelPostponedHistory.js.map