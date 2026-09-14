import { current } from 'immer';
import * as Message from '../../core/model/Message';
import * as Convo from '../../core/model/Convo';
import * as History from '../../core/model/History';
import * as RemindAnswerToMessage from '../../core/model/RemindAnswerToMessage';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { getImportantMessageKey } from './LoadImportantMessages';
import { getOwnerGroupId } from '../store/State';
import { castDraft } from 'immer';
import { saveConvosFailedMessagesInStorage } from '../env/FailedMessagesManager';
import * as Organizers from '../../core/model/Organisers';
import { updateRemindAnswerStorageOnChange } from '../env/RemindAnswerManager';
const userUndoActions = {
    mark_important: 'unmark_important',
    unmark_important: 'mark_important',
};
const userActionLockKeysMap = {
    delete: 'delete',
    deletePostponed: 'deletePostponed',
    restore: 'restore',
    mark_important: 'mark_important',
    unmark_important: 'mark_important',
};
const MAX_RESTORABLE_MESSAGES_COUNT = 5;
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    const { type } = action;
    switch (type) {
        case 'UserChangedMessage': {
            const { peerId, userAction, cmids } = action;
            for (let i = 0; i < cmids.length; i += 1) {
                const cmid = cmids[i];
                if (!cmid) {
                    return [];
                }
                const lockKey = getUserActionLockKey(userAction, peerId, cmid);
                if (draft.locks.messageActions.has(lockKey)) {
                    return [];
                }
                draft.locks.messageActions.add(lockKey);
            }
            const convo = draft.convos.get(peerId);
            let fetchUserAction;
            switch (userAction) {
                case 'mark_important':
                case 'unmark_important': {
                    cmids.forEach((cmid) => {
                        if (convo) {
                            const message = castDraft(Convo.findMessageByCmid(convo, cmid));
                            if (message?.kind === 'Normal') {
                                message.isImportant = userAction === 'mark_important';
                            }
                        }
                        const importantMessage = draft.importantMessages.messages.get(getImportantMessageKey(peerId, cmid));
                        if (importantMessage) {
                            importantMessage.isImportant = userAction === 'mark_important';
                        }
                    });
                    fetchUserAction = (api) => api
                        .fetch('messages.markAsImportant', {
                        peer_id: peerId,
                        cmids: cmids.join(','),
                        important: userAction === 'mark_important' ? 1 : 0,
                    })
                        .then((response) => Boolean(response.marked.length));
                    break;
                }
                default:
                    exhaustivenessCheck(userAction);
            }
            return [
                async function applyAction({ api }) {
                    try {
                        let hasFailed = false;
                        if (fetchUserAction) {
                            hasFailed = !(await fetchUserAction(api));
                        }
                        return {
                            type: 'UserChangedMessage_RequestCompleted',
                            hasFailed,
                            userAction,
                            cmids,
                            peerId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedMessage_RequestCompleted',
                            hasFailed: true,
                            userAction,
                            cmids,
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'UserChangedMessage_RequestCompleted': {
            const { peerId, userAction, hasFailed, cmids } = action;
            cmids.forEach((cmid) => {
                const lockKey = getUserActionLockKey(userAction, peerId, cmid);
                draft.locks.messageActions.delete(lockKey);
            });
            const undoAction = userUndoActions[userAction];
            if (hasFailed && undoAction) {
                handler(draft, {
                    type: 'UserChangedMessage',
                    userAction: undoAction,
                    peerId,
                    cmids,
                }, featureFlags, envFeatureFlags);
            }
            return [];
        }
        case 'UserDeleteMessage': {
            const { deleteType, peerId, userAction, messages } = action;
            const ownerId = draft.ownerId;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const deletedMessages = new Map();
            const reason = deleteType === 'spam' ? action.reason : undefined;
            const isRestoreLimitExceeded = messages.length > MAX_RESTORABLE_MESSAGES_COUNT;
            for (let i = 0; i < messages.length; i += 1) {
                const message = messages[i];
                if (!message || message.kind !== 'Normal') {
                    return [];
                }
                const lockKey = getUserActionLockKey(userAction, peerId, message.cmid);
                if (draft.locks.messageActions.has(lockKey)) {
                    return [];
                }
                draft.locks.messageActions.add(lockKey);
                deletedMessages.set(message.cmid, message);
                const canNotRestore = Convo.isCasper(convo) ||
                    Message.isCall(message) ||
                    isRestoreLimitExceeded;
                switch (deleteType) {
                    case 'local':
                    case 'spam':
                        if (canNotRestore) {
                            Convo.deleteMessage(convo, message, { isRestorable: false });
                            break;
                        }
                        Convo.deleteMessage(convo, message, {
                            isRestorable: true,
                            isSpam: deleteType === 'spam',
                        });
                        break;
                    case 'for_all':
                        Convo.deleteMessage(convo, message, { isRestorable: false });
                        break;
                    default:
                        exhaustivenessCheck(deleteType);
                }
            }
            return [
                async function applyAction({ api }) {
                    try {
                        const chunkSize = 100;
                        const cmidChunks = messages.reduce((acc, cur, ind) => {
                            const chunkIndex = Math.floor(ind / chunkSize);
                            if (!acc[chunkIndex]) {
                                acc[chunkIndex] = [];
                            }
                            acc[chunkIndex]?.push(cur.cmid);
                            return acc;
                        }, new Array());
                        // Так как на бэкенде лимит на число удаляемых сообщений - поддерживаем разделение на несколько запросов
                        const responses = await api.fetchMany(cmidChunks.map((cmidChunk) => {
                            return {
                                method: 'messages.delete',
                                params: {
                                    peer_id: peerId,
                                    cmids: cmidChunk.join(','),
                                    delete_for_all: deleteType === 'for_all' ? 1 : 0,
                                    spam: deleteType === 'spam' ? 1 : 0,
                                    group_id: getOwnerGroupId(ownerId),
                                    reason: reason,
                                },
                            };
                        }));
                        const failedCmids = [];
                        responses.forEach((deleteResponse, ind) => {
                            if (deleteResponse === false) {
                                const failedChunk = cmidChunks[ind];
                                if (failedChunk) {
                                    failedCmids.push(...failedChunk);
                                }
                            }
                            else {
                                deleteResponse.forEach((deleteFullResponse) => {
                                    if (deleteFullResponse.response !== 1) {
                                        const failedCmid = Message.resolveCmid(deleteFullResponse.conversation_message_id);
                                        if (failedCmid !== 0) {
                                            failedCmids.push(failedCmid);
                                        }
                                    }
                                });
                            }
                        });
                        return {
                            type: 'UserDeleteMessage_RequestCompleted',
                            hasFailed: false,
                            failedCmids,
                            userAction,
                            deleteType,
                            peerId,
                            messages,
                            deletedMessages,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserDeleteMessage_RequestCompleted',
                            hasFailed: true,
                            failedCmids: [],
                            userAction,
                            deleteType,
                            peerId,
                            messages,
                            deletedMessages,
                        };
                    }
                },
            ];
        }
        case 'UserDeleteFailedMessage': {
            const { peerId, randomId, isPostponed } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            if (isPostponed) {
                Convo.removePostponedPending(convo, randomId);
            }
            else {
                Convo.removePending(convo, randomId);
            }
            Organizers.refresh(draft.organisers, convo);
            const undraftedConvo = current(convo);
            const saveConvosFailedMessagesInStorageFx = async ({ storage, }) => {
                saveConvosFailedMessagesInStorage(undraftedConvo, storage);
                return { type: 'Noop' };
            };
            return [saveConvosFailedMessagesInStorageFx];
        }
        case 'UserDeleteAllFailedMessages': {
            const { peerId, isPostponed } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            if (isPostponed) {
                const allPostponedFailedMessages = Convo.getPostponedFailedMessages(convo);
                allPostponedFailedMessages.forEach((failedMsg) => {
                    Convo.removePostponedPending(convo, failedMsg.randomId);
                });
            }
            else {
                const allFailedMessages = Convo.getFailedMessages(convo);
                allFailedMessages.forEach((failedMsg) => {
                    Convo.removePending(convo, failedMsg.randomId);
                });
            }
            const undraftedConvo = current(convo);
            const saveConvosFailedMessagesInStorageFx = async ({ storage, }) => {
                saveConvosFailedMessagesInStorage(undraftedConvo, storage);
                return { type: 'Noop' };
            };
            return [saveConvosFailedMessagesInStorageFx];
        }
        case 'UserDeleteMessage_RequestCompleted': {
            const { peerId, userAction, messages, failedCmids, hasFailed, deletedMessages, } = action;
            const convo = draft.convos.get(peerId);
            if (convo) {
                if (hasFailed) {
                    deletedMessages.forEach((message) => {
                        Convo.restoreMessage(convo, message, false);
                    });
                }
                else {
                    failedCmids.forEach((cmid) => {
                        const deletedMessage = deletedMessages.get(cmid);
                        if (deletedMessage) {
                            Convo.restoreMessage(convo, deletedMessage, false);
                        }
                    });
                }
                RemindAnswerToMessage.updateMarkOnUserAction(draft.remindAnswerToMessage, convo.history, peerId, false, featureFlags.vkm_wall_reply_required);
            }
            messages.forEach(({ cmid }) => {
                const lockKey = getUserActionLockKey(userAction, peerId, cmid);
                draft.locks.messageActions.delete(lockKey);
            });
            const remindAnswerToMessage = current(draft.remindAnswerToMessage);
            return [
                convo &&
                    async function storeRemindAnswerToMessage({ storage }) {
                        updateRemindAnswerStorageOnChange(storage, remindAnswerToMessage, action.peerId);
                        return {
                            type: 'Noop',
                        };
                    },
            ];
        }
        case 'UserRestoreMessage': {
            const { peerId, userAction, cmid } = action;
            const lockKey = getUserActionLockKey(userAction, peerId, cmid);
            if (draft.locks.messageActions.has(lockKey)) {
                return [];
            }
            draft.locks.messageActions.add(lockKey);
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const ownerId = draft.ownerId;
            /**
             * Если сообщение было в беседе и было удаленно локально,
             * выполним позитивный апдейт. Если нет, то сообщение востановится после получение 10003 ивента.
             * */
            const node = History.findNodeByCmid(convo.history, cmid).node;
            if (node?.kind === 'DeletedNode') {
                Convo.restoreMessage(convo, node.restorable, false);
            }
            return [
                async function applyAction({ api }) {
                    try {
                        const response = await api.fetch('messages.restore', {
                            peer_id: peerId,
                            cmid: cmid,
                            group_id: getOwnerGroupId(ownerId),
                        });
                        return {
                            type: 'UserRestoreMessage_RequestCompleted',
                            hasFailed: !Boolean(response),
                            userAction,
                            peerId,
                            cmid,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserRestoreMessage_RequestCompleted',
                            hasFailed: true,
                            userAction,
                            peerId,
                            cmid,
                        };
                    }
                },
            ];
        }
        case 'UserRestoreMessage_RequestCompleted': {
            const { peerId, userAction, cmid, hasFailed } = action;
            const lockKey = getUserActionLockKey(userAction, peerId, cmid);
            draft.locks.messageActions.delete(lockKey);
            const convo = draft.convos.get(peerId);
            if (convo === undefined) {
                return [];
            }
            const message = Convo.findMessageByCmid(convo, cmid);
            if (hasFailed && message?.kind === 'Normal') {
                handler(draft, {
                    type: 'UserDeleteMessage',
                    messages: [message],
                    deleteType: 'local',
                    peerId,
                    userAction: 'delete',
                }, featureFlags, envFeatureFlags);
            }
            return [];
        }
        case 'UserDeletedPostponedMessage': {
            const { peerId, messages, userAction } = action;
            const convo = draft.convos.get(peerId);
            const groupId = getOwnerGroupId(draft.ownerId);
            if (!convo) {
                return [];
            }
            const cmids = [];
            messages.forEach((message) => {
                const lockKey = getUserActionLockKey(userAction, peerId, message.cmid);
                if (draft.locks.messageActions.has(lockKey)) {
                    return;
                }
                draft.locks.messageActions.add(lockKey);
                cmids.push(message.cmid);
                Convo.deleteMessage(convo, message, { isRestorable: false });
            });
            return [
                async function applyAction({ api }) {
                    try {
                        const response = await api.fetch('messages.deletePostponed', {
                            peer_id: peerId,
                            group_id: groupId,
                            cmids: cmids.join(','),
                        });
                        const deletedCmids = response
                            .filter((item) => item.response)
                            .map((successedDeletedItem) => Message.resolveCmid(successedDeletedItem.conversation_message_id));
                        return {
                            type: 'UserDeletedPostponedMessage_RequestCompleted',
                            peerId,
                            messages,
                            deletedCmids,
                            userAction,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserDeletedPostponedMessage_RequestCompleted',
                            peerId,
                            messages,
                            userAction,
                            deletedCmids: [],
                        };
                    }
                },
            ];
        }
        case 'UserDeletedPostponedMessage_RequestCompleted': {
            const { peerId, messages, deletedCmids, userAction } = action;
            const convo = draft.convos.get(peerId);
            messages.forEach((message) => {
                const lockKey = getUserActionLockKey(userAction, peerId, message.cmid);
                draft.locks.messageActions.delete(lockKey);
            });
            if (!convo) {
                return [];
            }
            messages.forEach((message) => {
                if (!deletedCmids.some((cmid) => cmid === message.cmid)) {
                    Convo.appendMessage(convo, message, 0, false);
                }
            });
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
const getUserActionLockKey = (userAction, peerId, cmid) => `${userActionLockKeysMap[userAction]}-${peerId.toString()}-${cmid.toString()}`;
//# sourceMappingURL=UserChangedMessage.js.map