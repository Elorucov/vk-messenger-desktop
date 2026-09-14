import { exhaustivenessCheck } from '../../core/utils/misc';
import { current } from 'immer';
import * as Message from '../../core/model/Message';
import * as Convo from '../../core/model/Convo';
import * as Attach from '../../core/model/Attach';
import { getOwnerGroupId } from '../store/State';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'UserHitEditPostponed':
        case 'UserHitEdit': {
            const { cmid, text, attaches, peerId, keepForwarded, isResendingFailedEditedMessage, formatData, } = action;
            const convo = draft.convos.get(peerId);
            const ownerId = draft.ownerId;
            const isPostponed = action.type === 'UserHitEditPostponed';
            if (!convo) {
                return [];
            }
            const message = Convo.findMessageByCmid(convo, cmid, isPostponed);
            if (!message) {
                return [];
            }
            const editedPostponedTime = isPostponed
                ? action.postponedTime
                : message.sentAt;
            // нажали "редактировать", но сообщение не поменялось
            // ВНИМАНИЕ!!! если пользователь переотправляет зафэйлившееся message.edit, то эту проверку опускаем
            if (!isResendingFailedEditedMessage &&
                message.kind === 'Normal' &&
                !Message.checkMessageHasChanged({
                    draft: {
                        text,
                        attaches,
                        keepForwarded,
                        formatData,
                        editedPostponedTime,
                    },
                    message,
                })) {
                return [];
            }
            if (message.kind === 'Normal') {
                Message.edit(message, {
                    text,
                    attaches,
                    keepForwarded,
                    formatData,
                    editedPostponedTime,
                });
            }
            draft.locks.edit.add(peerId);
            const attachment = Attach.ids(attaches, featureFlags.vkm_forward_clean_attachment).join(',');
            const messagesEditParams = {
                cmid,
                peer_id: peerId,
                message: text,
                attachment: attachment.length === 0 ? undefined : attachment,
                group_id: getOwnerGroupId(ownerId),
                keep_forward_messages: keepForwarded ? 1 : 0,
                keep_snippets: attaches.link ||
                    attaches.inviteLink ||
                    attaches.donutLink ||
                    attaches.stickerPack ||
                    attaches.miniApps
                    ? 1
                    : 0,
                lat: attaches.geo?.coordinates.latitude,
                long: attaches.geo?.coordinates.longitude,
                format_data: formatData?.items?.length
                    ? JSON.stringify(formatData)
                    : undefined,
            };
            const messagesEditPostponedParams = {
                ...messagesEditParams,
                postponed: JSON.stringify({
                    type: 1,
                    timestamp: Math.floor(editedPostponedTime / 1000),
                }),
            };
            const isMessagePostponed = message.kind === 'Normal' && message.isPostponed;
            return [
                async function editMessage({ api }) {
                    let hasFailed = false;
                    let newPostponedCmid;
                    try {
                        if (isMessagePostponed) {
                            const response = await api.fetch('messages.editPostponed', messagesEditPostponedParams);
                            newPostponedCmid = Message.resolveCmid(response.cmid);
                        }
                        else {
                            await api.fetch('messages.edit', messagesEditParams);
                        }
                    }
                    catch (err) {
                        hasFailed = true;
                    }
                    return isMessagePostponed
                        ? {
                            type: 'UserHitEditPostponed_RequestCompleted',
                            peerId,
                            cmid,
                            newPostponedCmid,
                            hasFailed,
                        }
                        : {
                            type: 'UserHitEdit_RequestCompleted',
                            peerId,
                            cmid,
                            hasFailed,
                        };
                },
            ];
        }
        case 'UserHitEditPostponed_Resend':
        case 'UserHitEdit_Resend': {
            const { cmid, peerId } = action;
            const isPostponed = action.type === 'UserHitEditPostponed_Resend';
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const message = Convo.findMessageByCmid(convo, cmid, isPostponed);
            if (!message) {
                return [];
            }
            if (message.kind === 'Normal' && message.editing?.status === 'failed') {
                const undraftedMessage = current(message);
                const { cmid, peerId, attaches, replyMessage: reply, forwardedMessages, } = undraftedMessage;
                const keepForwarded = Boolean(reply || forwardedMessages?.length);
                const text = Message.toRawText(message);
                const isPostponedMessage = message.kind === 'Normal' && message.isPostponed;
                const postponedTime = message.sentAt;
                return [
                    async function resendFailedEditedMessage() {
                        return isPostponedMessage
                            ? {
                                type: 'UserHitEditPostponed',
                                cmid,
                                text,
                                attaches,
                                peerId,
                                keepForwarded,
                                postponedTime,
                                isResendingFailedEditedMessage: true,
                            }
                            : {
                                type: 'UserHitEdit',
                                cmid,
                                text,
                                attaches,
                                peerId,
                                keepForwarded,
                                isResendingFailedEditedMessage: true,
                            };
                    },
                ];
            }
            return [];
        }
        case 'UserHitEditPostponed_RequestCompleted':
        case 'UserHitEdit_RequestCompleted': {
            const { peerId, hasFailed, cmid } = action;
            const isPostponed = action.type === 'UserHitEditPostponed_RequestCompleted';
            draft.locks.edit.delete(peerId);
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const message = Convo.findMessageByCmid(convo, cmid, isPostponed);
            if (!message) {
                return [];
            }
            if (hasFailed) {
                if (message.kind === 'Normal') {
                    Message.editFailed(message);
                }
            }
            return [];
        }
        case 'UserHitEditPostponed_CancelFailedEditing':
        case 'UserHitEdit_CancelFailedEditing': {
            const { peerId, cmid } = action;
            const convo = draft.convos.get(peerId);
            const isPostponed = action.type === 'UserHitEditPostponed_CancelFailedEditing';
            if (!convo) {
                return [];
            }
            const message = Convo.findMessageByCmid(convo, cmid, isPostponed);
            if (!message) {
                return [];
            }
            if (message.kind === 'Normal' &&
                message.editing?.status &&
                message.editing?.originalEditedMessage) {
                Convo.replaceMessage(convo, message.editing.originalEditedMessage, false);
            }
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserHitEdit.js.map