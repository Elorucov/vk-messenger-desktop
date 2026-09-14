import { exhaustivenessCheck, isDev } from '../../core/utils/misc';
import * as Convo from '../../core/model/Convo';
import * as RemindAnswerToMessage from '../../core/model/RemindAnswerToMessage';
import { current } from 'immer';
import { getOwnerGroupId } from './State';
import { IApi } from '../env/IApi';
import { updateRemindAnswerStorageOnChange } from '../env/RemindAnswerManager';
const MAX_REACTIONS_COUNT_ERROR_CODE = 1011;
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'UserSetMessageReaction': {
            const { peerId, cmid, reactionId, analyticsAppName, source, onFail } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const message = Convo.findMessageByCmid(convo, cmid);
            if (!message || message.kind !== 'Normal') {
                return [];
            }
            const prevReactionId = message.reactionId;
            const ownerId = draft.ownerId;
            setReaction(message, reactionId, draft.ownerId);
            return [
                async function setMessageReaction({ api }) {
                    try {
                        const response = await api.fetch('messages.sendReaction', {
                            cmid: cmid,
                            peer_id: peerId,
                            reaction_id: reactionId,
                            group_id: getOwnerGroupId(ownerId),
                            from: analyticsAppName,
                            source,
                        });
                        return {
                            type: 'UserSetMessageReaction_RequestCompleted',
                            hasFailed: response !== 1,
                            cmid,
                            peerId,
                            reactionId,
                            prevReactionId,
                            onFail,
                        };
                    }
                    catch (error) {
                        let errorCode;
                        if (error instanceof IApi.RequestError) {
                            errorCode = error.code;
                        }
                        return {
                            type: 'UserSetMessageReaction_RequestCompleted',
                            hasFailed: true,
                            cmid,
                            error: errorCode,
                            peerId,
                            reactionId,
                            prevReactionId,
                            onFail,
                        };
                    }
                },
            ];
        }
        case 'UserSetMessageReaction_RequestCompleted': {
            const { hasFailed, peerId, cmid, prevReactionId, onFail } = action;
            //Если что-то пошло не так, то надо бы откатить изменения
            //О том, что если реакция с count===1 поменяет порядок, пока не беспокоимся
            //Это должен быть редкий кейс
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            if (!hasFailed) {
                RemindAnswerToMessage.updateMarkOnUserAction(draft.remindAnswerToMessage, convo.history, peerId, true, featureFlags.vkm_wall_reply_required);
                const remindAnswerToMessage = current(draft.remindAnswerToMessage);
                return [
                    async function storeRemindAnswerToMessage({ storage }) {
                        updateRemindAnswerStorageOnChange(storage, remindAnswerToMessage, action.peerId);
                        return { type: 'Noop' };
                    },
                ];
            }
            if (action.error === MAX_REACTIONS_COUNT_ERROR_CODE) {
                onFail();
            }
            const message = Convo.findMessageByCmid(convo, cmid);
            if (!message || message.kind !== 'Normal') {
                return [];
            }
            setReaction(message, prevReactionId, draft.ownerId);
            return [];
        }
        case 'UserUnsetMessageReaction': {
            const { peerId, cmid } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const message = Convo.findMessageByCmid(convo, cmid);
            if (!message || message.kind !== 'Normal' || !message.reactionId) {
                return [];
            }
            const reactionId = message.reactionId;
            const ownerId = draft.ownerId;
            setReaction(message, undefined, draft.ownerId);
            return [
                async function unsetMessageReaction({ api }) {
                    try {
                        const response = await api.fetch('messages.deleteReaction', {
                            cmid: cmid,
                            peer_id: peerId,
                            group_id: getOwnerGroupId(ownerId),
                        });
                        return {
                            type: 'UserUnsetMessageReaction_RequestCompleted',
                            hasFailed: response !== 1,
                            cmid,
                            peerId,
                            reactionId,
                        };
                    }
                    catch {
                        return {
                            type: 'UserUnsetMessageReaction_RequestCompleted',
                            hasFailed: true,
                            cmid,
                            peerId,
                            reactionId,
                        };
                    }
                },
            ];
        }
        case 'UserUnsetMessageReaction_RequestCompleted': {
            const { hasFailed, peerId, cmid, reactionId } = action;
            if (!hasFailed) {
                return [];
            }
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const message = Convo.findMessageByCmid(convo, cmid);
            if (!message || message.kind !== 'Normal') {
                return [];
            }
            setReaction(message, reactionId, draft.ownerId);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
function setReaction(message, reactionId, userId) {
    const prevReactionId = message.reactionId;
    message.reactionId = reactionId;
    //Если до этого была установлена реакция, то её надо убрать
    if (prevReactionId) {
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
                prevReaction.peerIds.delete(userId);
            }
        }
    }
    if (reactionId) {
        const currentReaction = message.reactions.get(reactionId);
        if (currentReaction) {
            currentReaction.count += 1;
            currentReaction.peerIds = new Set([userId, ...currentReaction.peerIds].sort((a, b) => a - b));
        }
        else {
            message.reactions.set(reactionId, {
                reactionId,
                count: 1,
                peerIds: new Set([userId]),
            });
        }
    }
}
//# sourceMappingURL=UserSetMessageReaction.js.map