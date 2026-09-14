import { current } from 'immer';
import { API_ERROR_MESSAGES_WRITING_DISABLED_FOR_CHAT, } from '@vkontakte-internal/api-schema-typescript';
import { isPopupAutoplayOnSendOff } from '@vkontakte-internal/stickers-kit';
import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Message from '../../core/model/Message';
import * as Peer from '../../core/model/Peer';
import * as Convo from '../../core/model/Convo';
import * as History from '../../core/model/History';
import * as Organizers from '../../core/model/Organisers';
import * as Attach from '../../core/model/Attach';
import * as Sticker from '../../core/model/Sticker';
import { getOwnerGroupId } from '../store/State';
import { IApi } from '../env/IApi';
import { saveConvosFailedMessagesInStorage } from '../env/FailedMessagesManager';
import { IPerfStats } from '../env/IPerfStats';
import { splitMessageText } from '../utils/splitMessageText';
import { splitMessageAttaches } from '../utils/splitMessageAttaches';
import { getLogEventLabel } from '../utils/typeMessagingActionItem';
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'UserHitSend': {
            const { peerId, analyticsAppName, analyticsOrigin } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            let messages = splitMessage(action, draft.ownerId, featureFlags.vkm_forward_clean_attachment);
            let shouldSeparateAttaches = false;
            if (featureFlags.vkm_forward_clean_attachment &&
                (!Attach.isVideoOrAudioOnly(action.attaches) ||
                    featureFlags.vkm_split_messages_music_video)) {
                messages = messages.flatMap((msg, i) => {
                    if (i === 0) {
                        const result = applySendingAttachSeparately(msg);
                        if (result.length === 2) {
                            shouldSeparateAttaches = true;
                        }
                        return result;
                    }
                    return msg;
                });
            }
            return messages.flatMap((message) => {
                Convo.appendQueuedMessage(convo, featureFlags.vkm_new_remove_empty_forwards
                    ? Message.removeEmptyForwardsFromQueued(message)
                    : message);
                const queue = draft.locks.sendQueue.get(convo.peerId);
                if (queue) {
                    queue.add(message.randomId);
                    return [];
                }
                draft.locks.sendQueue.set(convo.peerId, new Set([message.randomId]));
                if (message.attaches.sticker &&
                    Sticker.isPopupSticker(message.attaches.sticker) &&
                    !isPopupAutoplayOnSendOff()) {
                    Attach.toggleStickerIsPopupAutoplayed(message, false);
                }
                const shouldLogDraftSent = convo.isDrafted;
                return [
                    shouldLogDraftSent
                        ? async ({ stats }) => {
                            stats.logEvent({
                                type: 'type_action',
                                type_action: {
                                    type: 'type_messaging_action_item',
                                    type_messaging_action_item: {
                                        label: getLogEventLabel(),
                                        action_type: 'send_draft_message',
                                        peer_id: peerId,
                                        is_formatted: message.formatData !== undefined &&
                                            message.formatData.items.length > 0,
                                        formatted_types: message.formatData
                                            ? message.formatData.items.reduce((acc, { type }) => (acc.includes(type) ? acc : [...acc, type]), [])
                                            : undefined,
                                    },
                                },
                            });
                            return {
                                type: 'Noop',
                            };
                        }
                        : undefined,
                    sendMessage(message.peerId, message.randomId, message.text, Attach.ids(message.attaches, featureFlags.vkm_forward_clean_attachment), message.extra, message.entrypoint, message.attaches.geo, getOwnerGroupId(draft.ownerId), prepareForeign(message), analyticsAppName, analyticsOrigin, undefined, shouldSeparateAttaches),
                    Peer.isMarusia(message.peerId) &&
                        async function notifyMarusia({ marusia }) {
                            marusia?.handleAction({
                                type: 'add_message',
                                payload: {
                                    randomId: Number(message.randomId),
                                    text: Message.toRawText(message),
                                    isOutbound: message.isOut,
                                    local: true,
                                    payload: message.extra.botPayload,
                                    attachIds: Attach.ids(message.attaches),
                                },
                            });
                            return { type: 'Noop' };
                        },
                ];
            });
        }
        case 'UserHitSend_RequestCompleted': {
            const { peerId, randomId, response, error, analyticsAppName, analyticsOrigin, isPostponed, shouldSeparateAttaches, } = action;
            const convo = draft.convos.get(peerId);
            const ownerId = draft.ownerId;
            const peer = Peer.safeGet(draft.peers, peerId);
            if (peer.kind === 'Group' && peer.isBlacklistedByMe) {
                Peer.updateIsPeerBlacklistedByMe(peer, false);
            }
            if (!convo) {
                draft.locks.sendQueue.delete(peerId);
                return [];
            }
            const currentHistory = isPostponed
                ? convo.postponed.history
                : convo.history;
            const pendingNode = History.findPendingNode(currentHistory, randomId);
            if (pendingNode) {
                if (!response) {
                    if (error && error instanceof IApi.RequestError) {
                        Message.updateFailedStatus(pendingNode.item, true, error.code);
                        if (error.code === API_ERROR_MESSAGES_WRITING_DISABLED_FOR_CHAT) {
                            Convo.forbidWritingForAll(convo, true);
                            Convo.restrictViewerToWrite(convo, 'forbid_writing_for_all');
                            Convo.updateIsDrafted(convo, false);
                        }
                    }
                    else {
                        Message.updateFailedStatus(pendingNode.item, true);
                    }
                    Organizers.refresh(draft.organisers, convo);
                }
                else if (response.cmid && !pendingNode.item.isPostponed) {
                    /**
                     * Это оптимизация ускорения отображения доставки для обычных сообщений, для отложек не используем.
                     */
                    Message.updateCmid(pendingNode.item, Message.resolveCmid(response.cmid));
                }
            }
            const undraftedConvo = current(convo);
            const saveConvosFailedMessagesInStorageFx = async ({ storage, }) => {
                saveConvosFailedMessagesInStorage(undraftedConvo, storage);
                return { type: 'Noop' };
            };
            const queue = draft.locks.sendQueue.get(convo.peerId);
            if (!queue) {
                return [saveConvosFailedMessagesInStorageFx];
            }
            queue.delete(randomId);
            const nextRandomId = [...queue][0];
            if (!nextRandomId) {
                draft.locks.sendQueue.delete(peerId);
                return [saveConvosFailedMessagesInStorageFx];
            }
            const message = History.findPendingNode(currentHistory, nextRandomId)?.item;
            if (!message) {
                return [saveConvosFailedMessagesInStorageFx];
            }
            const undraftedMessage = current(message);
            const linkedCmids = shouldSeparateAttaches && response && message.text
                ? Message.createLinkedCmids(response, peerId)
                : null;
            return [
                sendMessage(peerId, undraftedMessage.randomId, undraftedMessage.text, Attach.ids(undraftedMessage.attaches, featureFlags.vkm_forward_clean_attachment), undraftedMessage.extra, undraftedMessage.entrypoint, undraftedMessage.attaches.geo, getOwnerGroupId(ownerId), prepareForeign(undraftedMessage), analyticsAppName, analyticsOrigin, linkedCmids, shouldSeparateAttaches),
                saveConvosFailedMessagesInStorageFx,
            ];
        }
        case 'UserHitResendFailedMessage': {
            const { randomId, peerId, analyticsAppName, analyticsOrigin, isPostponed, } = action;
            const convo = draft.convos.get(peerId);
            const ownerId = draft.ownerId;
            if (!convo) {
                return [];
            }
            const failedMessage = isPostponed
                ? History.findPendingNode(convo.postponed.history, randomId)?.item
                : History.findPendingNode(convo.history, randomId)?.item;
            if (!failedMessage) {
                return [];
            }
            Convo.updateSendingFail(convo, randomId, false, isPostponed);
            if (action.updatedPostponedTime) {
                Message.updateQueuedPostponedTime(failedMessage, action.updatedPostponedTime);
            }
            const queue = draft.locks.sendQueue.get(convo.peerId);
            if (queue) {
                queue.add(failedMessage.randomId);
                return [];
            }
            draft.locks.sendQueue.set(convo.peerId, new Set([failedMessage.randomId]));
            const undraftedMessage = current(failedMessage);
            return [
                sendMessage(peerId, undraftedMessage.randomId, undraftedMessage.text, Attach.ids(undraftedMessage.attaches, featureFlags.vkm_forward_clean_attachment), undraftedMessage.extra, undraftedMessage.entrypoint, undraftedMessage.attaches.geo, getOwnerGroupId(ownerId), prepareForeign(undraftedMessage), analyticsAppName, analyticsOrigin),
            ];
        }
        case 'UserHitResendAllFailedMessages': {
            const { peerId, analyticsAppName, analyticsOrigin, isPostponed } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const convoFailedMsgs = isPostponed
                ? Convo.getPostponedFailedMessages(convo)
                : Convo.getFailedMessages(convo);
            return convoFailedMsgs.flatMap((msg) => handler(draft, {
                type: 'UserHitResendFailedMessage',
                peerId,
                randomId: msg.randomId,
                analyticsAppName,
                analyticsOrigin,
                isPostponed,
            }, featureFlags, envFeatureFlags));
        }
        case 'UserHitSendWidget': {
            const { peerId, text, timestamp, entrypoint, extra, analyticsAppName } = action;
            const convo = draft.convos.get(peerId);
            if (convo) {
                return handler(draft, {
                    type: 'UserHitSend',
                    attaches: {},
                    extra,
                    entrypoint,
                    text,
                    peerId,
                    timestamp,
                    analyticsAppName,
                }, featureFlags, envFeatureFlags);
            }
            const message = Message.newQueued({
                peerId,
                text,
                isOut: true,
                sentAt: timestamp,
                authorId: draft.ownerId,
                attaches: {},
                extra,
                entrypoint,
            });
            return [
                sendMessage(message.peerId, message.randomId, message.text, Attach.ids(message.attaches, featureFlags.vkm_forward_clean_attachment), message.extra, message.entrypoint, message.attaches.geo, getOwnerGroupId(draft.ownerId), null, analyticsAppName),
            ];
        }
        case 'UserHitSend_ErrorSnackbarShown': {
            const { peerId, randomId } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            // TODO: здесь достаются все pending сообщения, включая отложенные,
            //  поэтому экшен надо вынести куда-то отдельно, чтобы не путаться
            const queued = Convo.getAllQueuedMessages(convo).find((message) => message.randomId === randomId);
            if (!queued) {
                return [];
            }
            Message.updateFailedStatus(queued, true, undefined);
            const undraftedConvo = current(convo);
            const saveConvosFailedMessagesInStorageFx = async ({ storage, }) => {
                saveConvosFailedMessagesInStorage(undraftedConvo, storage);
                return { type: 'Noop' };
            };
            return [saveConvosFailedMessagesInStorageFx];
        }
        case 'UserHitSendPostponedRightNow': {
            const { peerId, cmid, onErrorUICallback } = action;
            const convo = draft.convos.get(peerId);
            const groupId = getOwnerGroupId(draft.ownerId);
            if (!convo) {
                return [];
            }
            return [
                async function applyAction({ api }) {
                    try {
                        const response = await api.fetch('messages.sendPostponed', {
                            peer_id: peerId,
                            group_id: groupId,
                            cmids: `${cmid}`,
                        });
                        /**
                         * Отложенные "отправляются сейчас" по-одному
                         */
                        const error = response[0]?.error;
                        if (error) {
                            onErrorUICallback(error?.description || error?.code || 'Api error');
                        }
                    }
                    catch (err) {
                        onErrorUICallback(err instanceof Error ? err.message : 'Fetch error');
                    }
                    finally {
                        return {
                            type: 'Noop',
                        };
                    }
                },
            ];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
export function prepareMessageFields(peerId, randomId, text, attaches, extra, entrypoint, geo, groupId, foreign, analyticsAppName, analyticsOrigin, linkedCmids) {
    const fields = {};
    if (extra.sticker) {
        fields.sticker_id = extra.sticker.id;
        fields.sticker_referrer = extra.sticker.referrer;
    }
    if (extra.botPayload) {
        fields.payload = extra.botPayload;
    }
    if (extra.silent) {
        fields.silent = 1;
    }
    if (extra.expiresIn) {
        fields.expire_ttl = extra.expiresIn;
    }
    if (extra.ref) {
        fields.ref = extra.ref;
    }
    if (extra.refSource) {
        fields.ref_source = extra.refSource;
    }
    if (extra.formatData && extra.formatData.items?.length) {
        fields.format_data = JSON.stringify(extra.formatData);
    }
    if (extra.delayedUntil) {
        fields.postponed = JSON.stringify({
            type: 1,
            timestamp: Math.floor(extra.delayedUntil / 1000),
        });
    }
    if (geo) {
        fields.lat = geo.coordinates.latitude;
        fields.long = geo.coordinates.longitude;
    }
    if (linkedCmids) {
        fields.linked_cmids = linkedCmids;
    }
    return {
        ...fields,
        peer_id: peerId,
        random_id: randomId,
        message: text,
        forward: foreign ? JSON.stringify(foreign) : undefined,
        attachment: attaches.length === 0 ? undefined : attaches.join(','),
        entrypoint,
        group_id: groupId,
        from: analyticsAppName,
        fromOrigin: analyticsOrigin,
    };
}
function sendMessage(peerId, randomId, text, attaches, extra, entrypoint, geo, groupId, 
// Поля ниже сделаны не опциональными, чтобы про них не забывали.
foreign, analyticsAppName, analyticsOrigin, linkedCmids, shouldSeparateAttaches) {
    return async function sendMessage({ api, perfStats, stats }) {
        const params = prepareMessageFields(peerId, randomId, text, attaches, extra, entrypoint, geo, groupId, foreign, analyticsAppName, analyticsOrigin, linkedCmids);
        const isPostponed = !!params.postponed;
        try {
            perfStats?.addEventData(IPerfStats.EventType.receiveMessage, {
                sendStart: perfStats.getCurrentTime(),
            });
            const response = await api.fetch('messages.send', params);
            perfStats?.addEventData(IPerfStats.EventType.receiveMessage, {
                sendEnd: perfStats.getCurrentTime(),
            });
            stats.trackExternalEvent({ type: 'message_sent' });
            return {
                type: 'UserHitSend_RequestCompleted',
                peerId,
                randomId,
                response,
                analyticsAppName,
                analyticsOrigin,
                isPostponed,
                shouldSeparateAttaches,
            };
        }
        catch (err) {
            return {
                type: 'UserHitSend_RequestCompleted',
                peerId,
                randomId,
                analyticsAppName,
                analyticsOrigin,
                isPostponed,
                shouldSeparateAttaches,
                error: err instanceof Error ? err : undefined,
            };
        }
    };
}
/**
 * Разбиение текста и аттачей сообщения на несоклько сообщений
 */
export function splitMessage(action, authorId, featureFlagCleanAttachment) {
    const { text, attaches, peerId, timestamp, expireTTL, deleteTTL, entrypoint, communityAdminId: adminAuthorId, extra, reply, forwarded, } = action;
    const textParts = splitMessageText(text, extra.formatData?.items);
    const attachesParts = splitMessageAttaches(attaches);
    const messagesCount = featureFlagCleanAttachment
        ? Math.max(textParts.length, attachesParts.length)
        : textParts.length + attachesParts.length - 1;
    const result = [];
    for (let i = 0; i < messagesCount; i++) {
        const textPart = textParts[i];
        const attaches = featureFlagCleanAttachment
            ? attachesParts[i] || {}
            : attachesParts[i - textParts.length + 1] || {};
        const formatData = textPart && textPart.formatItems && textPart.formatItems.length > 0
            ? {
                version: '1',
                items: textPart.formatItems,
            }
            : undefined;
        // каждый раз, когда отправка сообщения инициализирована пользователем => мы точно знаем откуда из ui было отправлено это сообщение (записываем entrypoint)
        // чтобы при автоматической отправке иметь возможность знать откуда было отправлено сообщение прежде
        const message = Message.newQueued({
            peerId,
            text: textPart?.text || '',
            isOut: true,
            adminAuthorId,
            sentAt: timestamp + i,
            authorId,
            attaches,
            expireTTL,
            deleteTTL,
            extra: {
                ...extra,
                formatData,
            },
            entrypoint,
            formatData: extra.formatData,
        }, i === 0 ? reply : undefined, i === messagesCount - 1 ? forwarded : undefined);
        result.push(message);
    }
    return result;
}
export function prepareForeign(message) {
    let foreign = null;
    if (message.replyMessage) {
        foreign = {
            peer_id: message.replyMessage.peerId,
            conversation_message_ids: [message.replyMessage.cmid],
            is_reply: true,
        };
    }
    if (message.forwardedMessages) {
        foreign = {
            peer_id: message.forwardedMessages[0].peerId,
            conversation_message_ids: message.forwardedMessages.map((message) => message.cmid),
        };
    }
    return foreign;
}
function applySendingAttachSeparately(message) {
    const shouldSplit = Message.hasText(message) &&
        Message.shouldSendAttachesSeparatelyFromTheText(message);
    if (shouldSplit) {
        const extra = message.extra.delayedUntil
            ? { delayedUntil: message.extra.delayedUntil }
            : {};
        return [
            Message.newQueued({
                peerId: message.peerId,
                text: '',
                isOut: true,
                adminAuthorId: message.adminAuthorId,
                sentAt: message.sentAt - 1,
                authorId: message.authorId,
                attaches: message.attaches,
                expireTTL: message.expireTTL,
                deleteTTL: message.deleteTTL,
                entrypoint: message.entrypoint,
                extra,
            }),
            Message.newQueued({
                peerId: message.peerId,
                text: message.text,
                isOut: true,
                adminAuthorId: message.adminAuthorId,
                sentAt: message.sentAt,
                authorId: message.authorId,
                attaches: {},
                expireTTL: message.expireTTL,
                deleteTTL: message.deleteTTL,
                entrypoint: message.entrypoint,
                extra: message.extra,
                formatData: message.extra.formatData,
            }),
        ];
    }
    return [message];
}
//# sourceMappingURL=UserHitSend.js.map