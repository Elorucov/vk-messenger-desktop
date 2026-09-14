import { exhaustivenessCheck, isDev } from '../../core/utils/misc';
import * as Channel from '../../core/model/Channel';
import { IApi } from '../env/IApi';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserSetChannelReaction': {
            const { channelId, cmid, reactionId } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            const post = Channel.findPostByCmid(channel, cmid);
            if (!post || post.kind !== 'Node') {
                return [];
            }
            const prevReactionId = post.item.reactionId;
            const ownerId = channel.id;
            const postCmid = post.item.cmid;
            const isCommunityChannel = Channel.isCommunityChannel(channel);
            setReaction(post.item, reactionId);
            return [
                async function setChannelReaction({ api }) {
                    try {
                        // Используем новый API для Новых каналов
                        if (isCommunityChannel) {
                            await api.fetch('channels.sendReaction', {
                                channel_id: channelId,
                                item_type: 'message',
                                item_id: postCmid,
                                reaction_id: reactionId,
                            });
                        }
                        else {
                            await api.fetch('likes.add', {
                                type: 'post',
                                owner_id: ownerId,
                                item_id: postCmid,
                                reaction_id: reactionId,
                            });
                        }
                        return {
                            type: 'UserSetChannelReaction_RequestCompleted',
                            hasFailed: false,
                            cmid,
                            channelId,
                            reactionId,
                            prevReactionId,
                            isCommunityChannel,
                        };
                    }
                    catch (error) {
                        let errorCode;
                        if (error instanceof IApi.RequestError) {
                            errorCode = error.code;
                        }
                        return {
                            type: 'UserSetChannelReaction_RequestCompleted',
                            hasFailed: true,
                            cmid,
                            error: errorCode,
                            channelId,
                            reactionId,
                            prevReactionId,
                        };
                    }
                },
            ];
        }
        case 'UserSetChannelReaction_RequestCompleted': {
            const { hasFailed, channelId, cmid, prevReactionId } = action;
            if (!hasFailed) {
                return [];
            }
            //Если что-то пошло не так, то надо бы откатить изменения
            //О том, что если реакция с count===1 поменяет порядок, пока не беспокоимся
            //Это должен быть редкий кейс
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            const post = Channel.findPostByCmid(channel, cmid);
            if (!post || post.kind !== 'Node') {
                return [];
            }
            setReaction(post.item, prevReactionId);
            return [];
        }
        case 'UserUnsetChannelReaction': {
            const { channelId, cmid } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            const post = Channel.findPostByCmid(channel, cmid);
            if (!post ||
                post.kind !== 'Node' ||
                typeof post.item.reactionId === 'undefined') {
                return [];
            }
            const reactionId = post.item.reactionId;
            const ownerId = channel.id;
            const postCmid = post.item.cmid;
            const isCommunityChannel = Channel.isCommunityChannel(channel);
            setReaction(post.item, undefined);
            return [
                async function unsetMessageReaction({ api }) {
                    try {
                        // Используем новый API для Новых каналов
                        if (isCommunityChannel) {
                            await api.fetch('channels.deleteReaction', {
                                channel_id: channelId,
                                item_type: 'message',
                                item_id: postCmid,
                            });
                        }
                        else {
                            await api.fetch('likes.delete', {
                                type: 'post',
                                owner_id: ownerId,
                                item_id: postCmid,
                            });
                        }
                        return {
                            type: 'UserUnsetChannelReaction_RequestCompleted',
                            hasFailed: false,
                            cmid,
                            channelId,
                            reactionId,
                        };
                    }
                    catch {
                        return {
                            type: 'UserUnsetChannelReaction_RequestCompleted',
                            hasFailed: true,
                            cmid,
                            channelId,
                            reactionId,
                        };
                    }
                },
            ];
        }
        case 'UserUnsetChannelReaction_RequestCompleted': {
            const { hasFailed, channelId, cmid, reactionId } = action;
            if (!hasFailed) {
                return [];
            }
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            const post = Channel.findPostByCmid(channel, cmid);
            if (!post || post.kind !== 'Node') {
                return [];
            }
            setReaction(post.item, reactionId);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
// @TODO объеденить две функции
function setReaction(message, reactionId) {
    const prevReactionId = message.reactionId;
    message.reactionId = reactionId;
    //Если до этого была установлена реакция, то её надо убрать
    if (typeof prevReactionId !== 'undefined') {
        const prevReaction = message.reactions.get(prevReactionId);
        if (!prevReaction && isDev) {
            throw new Error('Реакция не найдена в списке реакций сообщения');
        }
        if (prevReaction) {
            // Наша реакция единственная - удаляем реакцию
            if (prevReaction.count <= 1) {
                message.reactions.delete(prevReactionId);
            }
            else {
                prevReaction.count -= 1;
            }
        }
    }
    if (typeof reactionId !== 'undefined') {
        const currentReaction = message.reactions.get(reactionId);
        if (currentReaction) {
            currentReaction.count += 1;
        }
        else {
            message.reactions.set(reactionId, {
                reactionId,
                count: 1,
            });
        }
    }
}
//# sourceMappingURL=UserSetChannelReaction.js.map