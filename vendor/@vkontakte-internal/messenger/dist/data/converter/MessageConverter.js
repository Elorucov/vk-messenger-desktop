import { IEngine } from '../env/IEngine';
import { fromApiAttach, fromApiPhoto } from '../converter/AttachConverter';
import * as Message from '../../core/model/Message';
import * as Peer from '../../core/model/Peer';
import * as Attach from '../../core/model/Attach';
import * as TextChunk from '../../core/model/TextChunk';
import * as MessageReaction from '../../core/model/Reaction';
import * as ThemeStyle from '../../core/model/ThemeStyle';
import { exhaustivenessCheck, isDev } from '../../core/utils/misc';
import { fromApiKeyboard, fromEngineKeyboard, } from '../converter/BotKeyboardConverter';
import { fromApiTemplate } from '../converter/BotTemplateConverter';
import { fromApiMessageReactions } from './MessageReactionConverter';
export function fromApiMessage(featureFlags, apiMessage) {
    if (apiMessage.action) {
        return {
            message: {
                kind: 'Service',
                action: fromApiAction({
                    apiAction: apiMessage.action,
                    apiAttaches: apiMessage.attachments,
                    featureFlags,
                    messageAccessKey: `mail${apiMessage.peer_id}-${apiMessage.conversation_message_id}`,
                    fromEngine: false,
                }),
                peerId: Peer.resolveId(apiMessage.peer_id),
                cmid: Message.resolveCmid(apiMessage.conversation_message_id),
                authorId: Peer.resolveId(apiMessage.from_id),
                sentAt: apiMessage.date * 1000,
                isOut: apiMessage.out === 1,
                isSilent: apiMessage.is_silent,
                deleteTTL: apiMessage.ttl !== undefined ? apiMessage.ttl * 1000 : undefined,
            },
            // В сервисном сообщении не бывает меншенов
            mentions: {
                hasDirect: false,
                hasMass: false,
            },
        };
    }
    const peerId = Peer.resolveId(apiMessage.peer_id);
    if (apiMessage.is_expired) {
        return {
            message: {
                kind: 'Expired',
                cmid: Message.resolveCmid(apiMessage.conversation_message_id),
                peerId: Peer.resolveId(apiMessage.peer_id),
                authorId: Peer.resolveId(apiMessage.from_id),
                isOut: apiMessage.out === 1,
                isSilent: apiMessage.is_silent,
                sentAt: apiMessage.date * 1000,
            },
            // В исчезнувшем сообщении не бывает меншенов
            mentions: {
                hasDirect: false,
                hasMass: false,
            },
        };
    }
    const keyboard = apiMessage.keyboard && fromApiKeyboard(apiMessage.keyboard);
    if (keyboard?.kind === 'InputKeyboard') {
        throw new Error('Кажется из апи пришла не инлайн клавиатура для сообщения');
    }
    const cmid = Message.resolveCmid(apiMessage.conversation_message_id);
    const attaches = fromApiAttach({
        apiAttaches: getAttachments(apiMessage),
        messageAccessKey: `mail${apiMessage.peer_id}-${apiMessage.conversation_message_id}`,
        attachPositionOffset: 0,
    });
    const attachPositionOffset = Attach.count(attaches);
    return {
        message: {
            kind: 'Normal',
            randomId: Message.resolveRandomId(apiMessage.random_id),
            cmid,
            peerId,
            authorId: Peer.resolveId(apiMessage.from_id),
            chunks: TextChunk.fromServerText(apiMessage.text),
            isOut: apiMessage.out === 1,
            isSilent: apiMessage.is_silent,
            isImportant: !!apiMessage.important,
            isUnavailable: !!apiMessage.is_unavailable,
            isPlayed: !!apiMessage.was_played,
            sentAt: apiMessage.date * 1000,
            updatedAt: apiMessage.update_time && apiMessage.update_time * 1000,
            attaches,
            keyboard,
            adminAuthorId: apiMessage.admin_author_id
                ? Peer.resolveRealId('User', apiMessage.admin_author_id)
                : undefined,
            forceAutoPlayMedia: apiMessage.force_autoplay_media,
            replyMessage: apiMessage.reply_message
                ? fromApiForeign(apiMessage.reply_message, peerId, cmid, attachPositionOffset)
                : undefined,
            forwardedMessages: fromApiForwardedMessages(apiMessage.fwd_messages, peerId, cmid, attachPositionOffset),
            nestedMsgsCount: apiMessage.nested_msgs_count,
            nestedMsgsHasMore: apiMessage.nested_msgs_has_more,
            expireTTL: apiMessage.expire_ttl
                ? apiMessage.expire_ttl * 1000
                : undefined,
            deleteTTL: apiMessage.ttl !== undefined ? apiMessage.ttl * 1000 : undefined,
            isPinned: Boolean(apiMessage.is_pinned),
            template: apiMessage.template
                ? fromApiTemplate(apiMessage.template, `mail${apiMessage.peer_id}-${apiMessage.conversation_message_id}`)
                : undefined,
            reactions: apiMessage.reactions
                ? fromApiMessageReactions(apiMessage.reactions)
                : new Map(),
            reactionId: apiMessage.reaction_id
                ? MessageReaction.resolveId(apiMessage.reaction_id)
                : undefined,
            formatData: apiMessage.format_data
                ? fromApiFormatData(apiMessage.format_data)
                : undefined,
            isPostponed: false,
            linkedCmid: apiMessage.linked_cmid
                ? Message.resolveCmid(+apiMessage.linked_cmid)
                : undefined,
        },
        mentions: {
            hasDirect: apiMessage.is_mentioned_user,
            // TODO: поддержать поле из апи https://jira.mvk.com/browse/ME-49216
            hasMass: false,
        },
    };
}
export function fromApiPostponedMessage(apiMessage) {
    const willBeSendAt = apiMessage.postponed_info?.settings.timestamp;
    const isPostponedFailed = !!apiMessage.postponed_info?.error;
    const peerId = Peer.resolveId(apiMessage.peer_id);
    const cmid = Message.resolveCmid(apiMessage.conversation_message_id);
    const attaches = fromApiAttach({
        apiAttaches: getAttachments(apiMessage),
        messageAccessKey: `mail${apiMessage.peer_id}-${apiMessage.conversation_message_id}`,
        attachPositionOffset: 0,
    });
    const attachPositionOffset = Attach.count(attaches);
    return {
        kind: 'Normal',
        randomId: Message.resolveRandomId(apiMessage.random_id),
        cmid,
        peerId,
        authorId: Peer.resolveId(apiMessage.from_id),
        chunks: TextChunk.fromServerText(apiMessage.text),
        isSilent: apiMessage.is_silent,
        sentAt: (willBeSendAt || 0) * 1000,
        updatedAt: apiMessage.update_time && apiMessage.update_time * 1000,
        attaches,
        forwardedMessages: fromApiForwardedMessages(apiMessage.fwd_messages, peerId, cmid, attachPositionOffset),
        formatData: apiMessage.format_data
            ? fromApiFormatData(apiMessage.format_data)
            : undefined,
        replyMessage: apiMessage.reply_message
            ? fromApiForeign(apiMessage.reply_message, peerId, cmid, attachPositionOffset)
            : undefined,
        nestedMsgsCount: apiMessage.nested_msgs_count,
        nestedMsgsHasMore: apiMessage.nested_msgs_has_more,
        isOut: true,
        isUnavailable: false,
        isImportant: false,
        isPinned: false,
        reactions: new Map(),
        isPostponed: true,
        isPostponedFailed,
    };
}
export function fromApiFormatData(apiFormatData) {
    return {
        version: apiFormatData.version,
        items: (apiFormatData.items || []).reduce((acc, apiItem) => {
            if (!apiItem) {
                return acc;
            }
            const kind = Message.resolveFormatKind(apiItem.type);
            if (!kind) {
                return acc;
            }
            const format = {
                length: apiItem.length,
                offset: apiItem.offset,
                type: kind,
            };
            if (kind === Message.FormatKind.URL) {
                format.url = apiItem.url;
            }
            return [...acc, format];
        }, []),
    };
}
export function fromEngineFormatData(jsonString) {
    try {
        return fromApiFormatData(JSON.parse(jsonString));
    }
    catch {
        return undefined;
    }
}
export function fromEngineMessage(featureFlags, update, ownerId, findReplyInCache) {
    let _messageId, flags, rawPeerId, timestampInSeconds, text, additional, attachments, randomId, updateTimestampInSeconds, cmid;
    switch (update[0]) {
        case 10004:
            ;
            [
                ,
                cmid,
                flags,
                ,
                rawPeerId,
                timestampInSeconds,
                text,
                additional,
                attachments,
                randomId,
                _messageId,
            ] = update;
            break;
        case 10005:
            ;
            [
                ,
                cmid,
                flags,
                rawPeerId,
                timestampInSeconds,
                text,
                additional,
                attachments,
                randomId,
                _messageId,
                updateTimestampInSeconds,
            ] = update;
            break;
        case 10018:
            ;
            [
                ,
                cmid,
                flags,
                rawPeerId,
                timestampInSeconds,
                text,
                additional,
                attachments,
                randomId,
                _messageId,
                updateTimestampInSeconds,
            ] = update;
            break;
        default:
            exhaustivenessCheck(update);
    }
    const peerId = Peer.resolveId(rawPeerId);
    const { isOut: isOutFlag, isImportant, noPush, isPlayed, } = Message.convertFlags(flags);
    // Лонгполл не возвращает флаг исходящего сообщения,
    // если писать самому себе в лс (т.е. в избранное)
    const isOut = isOutFlag || Peer.isFavorites(peerId, ownerId);
    const isSilent = additional.is_silent === '1';
    let authorId;
    if (additional.from !== undefined) {
        authorId = Peer.resolveId(Number(additional.from));
    }
    else {
        authorId = isOut ? ownerId : peerId;
    }
    // Сервисное сообщение
    if (additional.source_act) {
        return {
            message: {
                kind: 'Service',
                cmid: Message.resolveCmid(cmid),
                peerId,
                authorId,
                action: fromApiAction({
                    messageAccessKey: `mail${peerId}-${Message.resolveCmid(cmid)}`,
                    apiAction: {
                        conversation_message_id: additional.source_chat_local_id
                            ? Number(additional.source_chat_local_id)
                            : undefined,
                        message: additional.source_message,
                        type: additional.source_subact || additional.source_act,
                        member_id: !additional.source_mid
                            ? undefined
                            : Number(additional.source_mid),
                        text: additional.source_text,
                        old_text: additional.source_old_text,
                        style: additional.source_style,
                    },
                    featureFlags,
                    fromEngine: true,
                }),
                deleteTTL: additional.ttl !== undefined
                    ? Number(additional.ttl) * 1000
                    : undefined,
                sentAt: timestampInSeconds * 1000,
                isOut,
                isSilent,
            },
            // В сервисном сообщении не бывает меншенов
            mentions: {
                hasDirect: false,
                hasMass: false,
            },
            noPush,
        };
    }
    // Исчезнувшее сообщение
    if (additional.is_expired === '1') {
        return {
            message: {
                kind: 'Expired',
                cmid: Message.resolveCmid(cmid),
                isOut,
                isSilent,
                peerId,
                authorId,
                sentAt: timestampInSeconds * 1000,
            },
            // В исчезнувшем сообщении не бывает меншенов
            mentions: {
                hasDirect: false,
                hasMass: false,
            },
            noPush: true,
        };
    }
    const mentions = {
        hasDirect: false,
        hasMass: false,
    };
    for (const mark of additional.marked_users || []) {
        if (mark[0] !== IEngine.MarkedType.Mention) {
            continue;
        }
        switch (mark[1]) {
            case 'all':
                mentions.hasMass = mentions.hasMass || authorId !== ownerId;
                break;
            case 'online':
                mentions.hasMass = mentions.hasMass || mark[2].includes(ownerId);
                break;
            default:
                mentions.hasDirect = mark[1].includes(ownerId);
        }
    }
    let attaches = {};
    let replyMessage;
    /**
     * Используем пришедшие вложения только если мы уверены,
     * что нам пришли все вложения
     *
     * Подробнее можно почитать в функции isAttachmentMissing
     */
    if (attachments.attachments &&
        attachments.attach1_type &&
        !attachments.attach2_type) {
        try {
            const parsed = JSON.parse(attachments.attachments);
            if (Array.isArray(parsed)) {
                attaches = fromApiAttach({
                    apiAttaches: parsed,
                    messageAccessKey: `mail${peerId}-${cmid}`,
                });
            }
        }
        catch {
            // Нас подставили
        }
    }
    if (!Attach.kindsCount(attaches) && attachments.attach1_type) {
        attaches = {
            unknown: [{ data: attachments, kind: 'Unknown' }],
        };
    }
    if (typeof attachments.reply !== 'undefined') {
        const parsed = JSON.parse(attachments.reply);
        const replyCmid = Message.resolveCmid(parsed.conversation_message_id);
        const message = findReplyInCache(replyCmid);
        if (message) {
            replyMessage = Message.toForeign({
                message,
                rootPeerId: peerId,
                rootCmid: Message.resolveCmid(cmid),
            });
        }
    }
    const keyboardOrEvent = additional.keyboard
        ? fromEngineKeyboard(additional.keyboard, authorId)
        : undefined;
    let inlineKeyboard, inputKeyboardEvent;
    if (keyboardOrEvent?.kind === 'InlineKeyboard') {
        inlineKeyboard = keyboardOrEvent;
    }
    else {
        inputKeyboardEvent = keyboardOrEvent;
    }
    return {
        message: {
            kind: 'Normal',
            cmid: Message.resolveCmid(cmid),
            randomId: Message.resolveRandomId(randomId),
            peerId,
            authorId,
            chunks: TextChunk.fromEngineText(text),
            isOut,
            isSilent,
            isImportant,
            isPlayed,
            isUnavailable: false,
            sentAt: timestampInSeconds * 1000,
            // Может принимать значение 0, что приводит к неправильному отображению в компоненте MessagePreview
            updatedAt: updateTimestampInSeconds
                ? updateTimestampInSeconds * 1000
                : undefined,
            isPinned: Boolean(additional.pinned_at),
            expireTTL: additional.expire_ttl
                ? Number(additional.expire_ttl) * 1000
                : undefined,
            deleteTTL: additional.ttl !== undefined
                ? Number(additional.ttl) * 1000
                : undefined,
            attaches,
            adminAuthorId: additional.from_admin !== undefined
                ? Peer.resolveRealId('User', Number(additional.from_admin))
                : undefined,
            replyMessage,
            keyboard: inlineKeyboard,
            reactions: new Map(),
            formatData: additional.format_data
                ? fromEngineFormatData(additional.format_data)
                : undefined,
            linkedCmid: additional.linked_cmid
                ? Message.resolveCmid(+additional.linked_cmid)
                : undefined,
        },
        mentions,
        noPush,
        keyboardEvent: inputKeyboardEvent,
    };
}
function fromApiForeign(apiForeignMessage, rootPeerId, rootCmid, attachPositionOffset) {
    let peerId;
    if (apiForeignMessage.peer_id) {
        peerId = Peer.resolveId(apiForeignMessage.peer_id);
    }
    if (apiForeignMessage.is_expired) {
        return {
            kind: 'ForeignExpired',
            peerId,
            rootPeerId,
            rootCmid,
            isUnavailable: !!apiForeignMessage.is_unavailable,
            cmid: Message.resolveCmid(apiForeignMessage.conversation_message_id),
            authorId: Peer.resolveId(apiForeignMessage.from_id),
            sentAt: apiForeignMessage.date * 1000,
        };
    }
    const attaches = fromApiAttach({
        apiAttaches: getAttachments(apiForeignMessage),
        messageAccessKey: apiForeignMessage.peer_id
            ? `mail${apiForeignMessage.peer_id}-${apiForeignMessage.conversation_message_id}`
            : undefined,
        attachPositionOffset,
    });
    const nextAttachPositionOffset = attachPositionOffset + Attach.count(attaches);
    return {
        kind: 'Foreign',
        peerId,
        rootPeerId,
        rootCmid,
        isUnavailable: !!apiForeignMessage.is_unavailable,
        cmid: Message.resolveCmid(apiForeignMessage.conversation_message_id),
        authorId: Peer.resolveId(apiForeignMessage.from_id),
        chunks: TextChunk.fromServerText(apiForeignMessage.text),
        sentAt: apiForeignMessage.date * 1000,
        updatedAt: apiForeignMessage.update_time && apiForeignMessage.update_time * 1000,
        attaches,
        formatData: apiForeignMessage.format_data
            ? fromApiFormatData(apiForeignMessage.format_data)
            : undefined,
        replyMessage: apiForeignMessage.reply_message
            ? fromApiForeign(apiForeignMessage.reply_message, rootPeerId, rootCmid, nextAttachPositionOffset)
            : undefined,
        forwardedMessages: fromApiForwardedMessages(apiForeignMessage.fwd_messages, rootPeerId, rootCmid, nextAttachPositionOffset),
    };
}
function fromApiForwardedMessages(forwardedMessages, rootPeerId, rootCmid, attachPositionOffset) {
    if (!forwardedMessages || forwardedMessages.length === 0) {
        return undefined;
    }
    let result;
    let nextAttachPositionOffset = attachPositionOffset;
    for (const forwardedMessage of forwardedMessages) {
        const foreign = fromApiForeign(forwardedMessage, rootPeerId, rootCmid, nextAttachPositionOffset);
        if (foreign.kind !== 'ForeignExpired') {
            nextAttachPositionOffset += Message.getMessageAttachmentsCount(foreign);
        }
        if (foreign.kind === 'ForeignExpired') {
            if (isDev) {
                throw new Error('Исчезающих сообщений не может быть в пересланных.');
            }
            continue;
        }
        if (!result) {
            result = [foreign];
        }
        else {
            result.push(foreign);
        }
    }
    return result;
}
function fromApiAction({ apiAction, apiAttaches, featureFlags, messageAccessKey, fromEngine, }) {
    const UNKNOWN = {
        type: 'unknown',
    };
    switch (apiAction.type) {
        case 'chat_create':
            if (!apiAction.text) {
                return UNKNOWN;
            }
            return {
                type: apiAction.type,
                title: apiAction.text,
            };
        case 'chat_title_update':
            if (!apiAction.text || !apiAction.old_text) {
                return UNKNOWN;
            }
            return {
                type: apiAction.type,
                title: apiAction.text,
                oldTitle: apiAction.old_text,
            };
        case 'cannot_call_privacy_settings': {
            if (!featureFlags.vkm_convert_cannot_call_privac) {
                if (!apiAction.message) {
                    return UNKNOWN;
                }
                return {
                    chunks: fromEngine
                        ? TextChunk.fromEngineText(apiAction.message)
                        : TextChunk.fromServerText(apiAction.message),
                    type: 'custom',
                };
            }
            return {
                type: apiAction.type,
            };
        }
        case 'chat_photo_remove':
        case 'chat_screenshot':
        case 'chat_group_call_started':
        case 'chat_invite_user_by_link':
        case 'chat_invite_user_by_call_join_link':
        case 'chat_kick_don':
        case 'call_transcription_failed':
        case 'chat_without_owner_admins':
        case 'chat_without_owner_all':
            return {
                type: apiAction.type,
            };
        case 'chat_pin_message':
        case 'chat_unpin_message':
            return {
                type: apiAction.type,
                cmid: Message.resolveCmid(apiAction.conversation_message_id),
                chunks: apiAction.message
                    ? fromEngine
                        ? TextChunk.fromEngineText(apiAction.message)
                        : TextChunk.fromServerText(apiAction.message)
                    : [],
            };
        case 'chat_photo_update':
            const attach = apiAttaches?.find((attach) => attach.type === 'photo');
            const apiPhoto = attach?.photo;
            let photo;
            if (apiPhoto) {
                photo = fromApiPhoto({ apiPhoto, messageAccessKey });
            }
            return {
                type: apiAction.type,
                photo,
            };
        case 'chat_invite_user':
        case 'chat_kick_user':
        case 'accepted_message_request':
        case 'chat_without_owner_admin':
        case 'chat_owner_changed': {
            if (!apiAction.member_id) {
                return UNKNOWN;
            }
            const peerId = Peer.resolveId(apiAction.member_id);
            if (!Peer.isUserPeerId(peerId) && !Peer.isGroupPeerId(peerId)) {
                return UNKNOWN;
            }
            return {
                type: apiAction.type,
                peerId,
            };
        }
        case 'chat_invite_user_by_message_request':
        case 'chat_invite_user_by_call':
        case 'chat_kick_user_call_block': {
            if (!apiAction.member_id) {
                return UNKNOWN;
            }
            const peerId = Peer.resolveId(apiAction.member_id);
            if (!Peer.isUserPeerId(peerId)) {
                return UNKNOWN;
            }
            return {
                type: apiAction.type,
                peerId,
            };
        }
        case 'conversation_style_update':
        case 'conversation_style_update_action':
            return {
                type: apiAction.type,
                styleId: apiAction.style
                    ? ThemeStyle.resolveStyleId(apiAction.style)
                    : undefined,
            };
        case 'custom':
            if (!apiAction.message) {
                return UNKNOWN;
            }
            return {
                type: apiAction.type,
                chunks: fromEngine
                    ? TextChunk.fromEngineText(apiAction.message)
                    : TextChunk.fromServerText(apiAction.message),
            };
        case 'sent_message_request':
            return {
                type: apiAction.type,
                from: Peer.resolveId(apiAction.member_id),
            };
        case 'rejected_message_request':
            return {
                type: apiAction.type,
            };
        default:
            /**
             * По дефолту будем возвращать unknown,
             * чтобы если вдруг список расширится,
             * для нас это не стало брейкинг чейнджем.
             *
             * Но все равно проверим на экзостивнесс, чтобы
             * получать ошибки компиляции.
             */
            const _typeguard = apiAction.type;
            return UNKNOWN;
    }
}
function getAttachments({ attachments = [], geo, }) {
    return geo ? [...attachments, { type: 'geo', geo }] : attachments;
}
export function fromApiPinnedMessage(apiPinnedMessage) {
    const peerId = Peer.resolveId(apiPinnedMessage.peer_id);
    const cmid = Message.resolveCmid(apiPinnedMessage.conversation_message_id);
    const authorId = Peer.resolveId(apiPinnedMessage.from_id);
    return {
        kind: 'Pinned',
        cmid,
        peerId,
        authorId,
        isUnavailable: !!apiPinnedMessage.is_unavailable,
        chunks: TextChunk.fromServerText(apiPinnedMessage.text),
        sentAt: apiPinnedMessage.date * 1000,
        forwardedMessages: apiPinnedMessage.fwd_messages
            ? fromApiForwardedMessages(apiPinnedMessage.fwd_messages, peerId, cmid, 0)
            : undefined,
        replyMessage: apiPinnedMessage.reply_message
            ? fromApiForeign(apiPinnedMessage.reply_message, peerId, cmid, 0)
            : undefined,
        attaches: fromApiAttach({
            apiAttaches: getAttachments(apiPinnedMessage) || [],
        }),
        formatData: apiPinnedMessage.format_data
            ? fromApiFormatData(apiPinnedMessage.format_data)
            : undefined,
    };
}
//# sourceMappingURL=MessageConverter.js.map