import { exhaustivenessCheck } from '../../core/utils/misc';
import { POSTS_PER_PAGE } from '../../core/config/config';
import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import * as History from '../../core/model/History';
import { fromApiPost } from '../converter/PostConverter';
import { insertPeers } from './State';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserScrolledChannelHistory': {
            const { channelId, direction, startCmid, possibleSkipped } = action;
            const channel = draft.channels.get(channelId);
            if (!channel) {
                return [];
            }
            if (channel.kind === 'ChannelRestricted') {
                return [];
            }
            if (draft.locks.getChannelHistory.has(getLockId(channelId, startCmid))) {
                return [];
            }
            draft.locks.getChannelHistory.add(getLockId(channelId, startCmid));
            // Добавляем +1, чтобы компенсировать startCmid, поскольку он инклюзивный
            // Добавляем еще +1, чтобы не делать лишний запрос, когда мы загружаем последние
            // соообщения сверху (иначе нам придет ровно сколько надо и придется делать
            // еще один запрос по hasMore)
            let count = Math.min(POSTS_PER_PAGE, possibleSkipped || POSTS_PER_PAGE) + 2;
            let offset;
            switch (direction) {
                case 'backward':
                    /**
                     * Грузим внахлест с загруженными постами, на случай,
                     * если пост со startCmid удален.
                     */
                    offset = -1;
                    break;
                case 'forward':
                    /**
                     * Компенсируем только один раз +1 из count, чтобы грузить внахлест
                     * с загруженными постами, на случай, если пост со startCmid удален.
                     */
                    offset = -count + 1;
                    break;
                case 'around':
                    count = POSTS_PER_PAGE;
                    offset = -Math.floor(count * 0.8);
                    /**
                     * Меняем offset для случая когда грузим вокруг (с around), последнего
                     * прочитанного так как для direction равного around possibleSkipped мы не знаем.
                     */
                    if (channel.inReadCmid === startCmid) {
                        offset = Math.max(-channel.unreadCount, offset);
                    }
                    break;
                default:
                    exhaustivenessCheck(direction);
            }
            return [
                async function loadChannelHistory({ api }) {
                    try {
                        const response = await api.fetch('channels.getHistory', {
                            channel_id: channelId,
                            start_cmid: Math.max(startCmid, 1),
                            count,
                            offset,
                            extended: 1,
                        }, { retries: 5 });
                        //hasMoreBackward обозначает есть ли в истории еще более ранние посты.
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
                                const responseBackwardCount = response.items.filter(({ cmid }) => cmid <= startCmid).length;
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
                            type: 'UserScrolledChannelHistory_RequestSucceed',
                            channelId,
                            startCmid,
                            response,
                            hasMoreBackward,
                            hasMoreForward,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserScrolledChannelHistory_RequestFailed',
                            channelId,
                            startCmid,
                        };
                    }
                },
            ];
        }
        case 'UserScrolledChannelHistory_RequestSucceed': {
            const { channelId, startCmid, response, hasMoreBackward, hasMoreForward, } = action;
            draft.locks.getChannelHistory.delete(getLockId(channelId, startCmid));
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
            response.items.reverse().forEach((apiPost, index, self) => {
                const { post: newPost, reactions } = fromApiPost(apiPost);
                const prevPostNode = Channel.findPostByCmid(channel, newPost.cmid);
                const post = Post.merge(newPost, prevPostNode?.kind === 'Node' ? prevPostNode.item : undefined);
                reactions.forEach((reaction) => {
                    draft.reactionsOld.set(reaction.id, reaction);
                });
                if (index === 0 && post.cmid > 1 && hasMoreBackward) {
                    posts.push({
                        kind: 'GapNode',
                        fromCmid: Post.resolveCmid(1),
                        toCmid: Post.resolveCmid(post.cmid - 1),
                    });
                }
                posts.push({
                    kind: 'Node',
                    item: post,
                });
                const lastHistoryCmid = History.lastCmid(channel.history);
                if (index === self.length - 1 &&
                    lastHistoryCmid !== undefined &&
                    hasMoreForward) {
                    if (post.cmid < lastHistoryCmid) {
                        posts.push({
                            kind: 'GapNode',
                            fromCmid: Post.resolveCmid(post.cmid + 1),
                            toCmid: Post.resolveCmid(lastHistoryCmid),
                        });
                    }
                }
            });
            Channel.insertPosts(channel, posts);
            insertPeers(draft, {
                apiUsers: response.profiles || [],
                apiGroups: response.groups || [],
                apiContacts: [],
            });
            return [];
        }
        case 'UserScrolledChannelHistory_RequestFailed': {
            const { channelId, startCmid } = action;
            draft.locks.getChannelHistory.delete(getLockId(channelId, startCmid));
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
function getLockId(channelId, startCmid) {
    return `${channelId}-${startCmid}`;
}
//# sourceMappingURL=UserScrolledChannelHistory.js.map