import * as ComposerDraft from '../../core/model/ComposerDraft';
import * as Message from '../../core/model/Message';
import * as Convo from '../../core/model/Convo';
import * as Organisers from '../../core/model/Organisers';
import * as Channel from '../../core/model/Channel';
import * as Attach from '../../core/model/Attach';
import * as Post from '../../core/model/Post';
import * as TextChunk from '../../core/model/TextChunk';
import { exhaustivenessCheck, isDev } from '../../core/utils/misc';
import { castDraft, current, isDraft, produce } from 'immer';
import { toNonEmpty } from '../../core/utils/misc';
import { getOwnerGroupId, insertPeers } from '../store/State';
import { fromApiMessage } from '../converter/MessageConverter';
import * as Comment from '../../core/model/Comment';
import { fromApiPost } from '../converter/PostConverter';
import { fromApiComment } from '../converter/CommentConverter';
import { formattedMessageToComposerHtml } from '../utils/formatData/edit';
import { getLogEventLabel } from '../utils/typeMessagingActionItem';
export const handler = (draft, action, featureFlags) => {
    const { peerId } = action;
    const isPostponed = 'isPostponed' in action && action.isPostponed;
    let peerDrafts = [];
    /**
     * У беседы есть 2 драфта (один относится к обычной беседе, другой к отложенным сообщениям)
     */
    const currentDrafts = isPostponed
        ? draft.composerPostponedDrafts
        : draft.composerDrafts;
    if (peerId !== undefined) {
        peerDrafts = currentDrafts[peerId] || [];
    }
    const oldDraft = peerDrafts[peerDrafts.length - 1] ??
        castDraft(ComposerDraft.empty());
    let newPeerDraft = castDraft(peerDrafts.slice(0, -1));
    switch (action.type) {
        case 'UserChangedComposerDraft': {
            switch (action.kind) {
                case 'text': {
                    const { text, html } = action;
                    newPeerDraft.push({
                        ...oldDraft,
                        text: text ?? oldDraft.text,
                        html: html ?? oldDraft.html,
                    });
                    break;
                }
                case 'addAttaches':
                case 'removeAttach':
                case 'removeVoice':
                case 'startUploading':
                case 'removeUploads':
                case 'rearrangeAttaches':
                    const change = applyAttachmentActions(oldDraft, action);
                    newPeerDraft.push({
                        ...oldDraft,
                        ...change,
                    });
                    break;
                // При редактировании добавляем в драфты конвы новый драфт вместе со старым.
                case 'editing': {
                    const { editing } = action;
                    newPeerDraft.push(oldDraft, {
                        editing,
                        text: Message.toRawText(editing),
                        html: editing.formatData
                            ? formattedMessageToComposerHtml(
                            /** Разбиваем именно клиентским парсером, чтобы даже потенциально невалидные меншены были выделены в соответствующие чанки */
                            TextChunk.fromClientText(Message.toRawText(editing)), editing.formatData.items, featureFlags.vkm_fix_formatted_link_offset)
                            : '',
                        attaches: editing.attaches,
                        uploadsTrackIds: oldDraft.uploadsTrackIds,
                        forward: editing.forwardedMessages && {
                            kind: "message" /* ComposerDraft.ForwardKind.Message */,
                            items: editing.forwardedMessages,
                        },
                        reply: editing.replyMessage,
                        linkedCmid: editing.linkedCmid,
                    });
                    break;
                }
                // Полностью затираем драфт только, если были в процессе редактирования
                case 'forward': {
                    const { forward, isForwardAuthorHidden } = action;
                    const forwardLenght = forward?.items.length;
                    const message = forward && forward.kind === 'message' && forward?.items[0];
                    const shouldExtractAttachFromForward = featureFlags.vkm_forward_clean_attachment &&
                        forwardLenght === 1 &&
                        message &&
                        message.kind === 'Normal' &&
                        !Message.hasText(message) &&
                        Message.shouldSendAttachesSeparatelyFromTheText(message);
                    if (shouldExtractAttachFromForward) {
                        const payload = {
                            kind: 'addAttaches',
                            attaches: message?.attaches,
                        };
                        const change = applyAttachmentActions(oldDraft, payload);
                        newPeerDraft.push({
                            ...oldDraft,
                            ...change,
                        });
                        break;
                    }
                    if (!featureFlags.vkm_channels_new_forwards) {
                        if (forward?.kind === "post" /* ComposerDraft.ForwardKind.Post */) {
                            const post = forward.items[0];
                            const channel = Channel.safeGet(draft.channels, post.channelId);
                            if (channel.kind !== 'ChannelRestricted' &&
                                Channel.isCommunityChannel(channel) &&
                                featureFlags.vkm_channels_forward_as_text) {
                                /**
                                 * Генерим ссылку на пост
                                 */
                                const linkForPost = Post.toPostChannelUrl(post);
                                newPeerDraft.push({
                                    ...oldDraft,
                                    html: oldDraft.html.length
                                        ? oldDraft.html + ' ' + linkForPost
                                        : linkForPost,
                                    text: oldDraft.text.length
                                        ? oldDraft.text + ' ' + linkForPost
                                        : linkForPost,
                                });
                                break;
                            }
                        }
                        if (forward?.kind === "comment" /* ComposerDraft.ForwardKind.Comment */) {
                            const comment = forward.items[0];
                            const channel = Channel.safeGet(draft.channels, comment.channelId);
                            if (channel.kind !== 'ChannelRestricted' &&
                                Channel.isCommunityChannel(channel) &&
                                featureFlags.vkm_channels_forward_as_text) {
                                const linkForPost = Comment.toCommentChannelUrl(comment);
                                newPeerDraft.push({
                                    ...oldDraft,
                                    html: oldDraft.html.length
                                        ? oldDraft.html + ' ' + linkForPost
                                        : linkForPost,
                                    text: oldDraft.text.length
                                        ? oldDraft.text + ' ' + linkForPost
                                        : linkForPost,
                                });
                                break;
                            }
                        }
                    }
                    newPeerDraft.push({
                        ...(forward && oldDraft.editing
                            ? ComposerDraft.empty()
                            : oldDraft),
                        reply: undefined,
                        forward,
                        isForwardAuthorHidden: isForwardAuthorHidden ??
                            ComposerDraft.DEFAULT_FORWARD_AUTHOR_HIDDEN,
                    });
                    break;
                }
                // Полностью затираем драфт только, если были в процессе редактирования
                case 'reply': {
                    const { reply } = action;
                    newPeerDraft.push({
                        ...(reply && oldDraft.editing
                            ? ComposerDraft.empty()
                            : oldDraft),
                        forward: undefined,
                        reply,
                    });
                    break;
                }
                default:
                    exhaustivenessCheck(action);
            }
            break;
        }
        // Ничего не делаем, так как выше newPeerDraft не содержит активный драфт,
        // следовательно, если мы не добавим его в newPeerDraft, то он будет удален.
        case 'UserClearedComposerDraft': {
            break;
        }
        /**
         * Экшен отвечает за вычищение удаленных и исчезнувших сообщений из черновиков.
         * Сообщение не получится отправить, если этого не сделать.
         */
        case 'ComposerDraftsUpdateNeeded': {
            const { itemsToDelete, itemsToReplace, foreignKind } = action;
            newPeerDraft.push(oldDraft);
            newPeerDraft = newPeerDraft.reduce((result, composerDraft) => {
                const { editing, reply } = composerDraft;
                /**
                 * Обновляем драфты конвы с редактированием и реплаями.
                 */
                if (foreignKind === "message" /* ComposerDraft.ForwardKind.Message */) {
                    if (editing !== undefined && findMessage(itemsToDelete, editing)) {
                        return result;
                    }
                    /**
                     * Чистим реплай, только если не редактируем сообщение с реплаем,
                     * так как в таком случае сообщение можно будет успешно отредактировать.
                     */
                    if (editing === undefined && reply !== undefined) {
                        if (findMessage(itemsToDelete, reply)) {
                            composerDraft.reply = undefined;
                        }
                        else {
                            const replacingMessage = findMessage(itemsToReplace, reply);
                            if (replacingMessage !== undefined) {
                                composerDraft.reply = replacingMessage;
                            }
                        }
                    }
                }
                result.push(composerDraft);
                return result;
            }, []);
            /**
             * Обновляем все драфты с форвардами.
             */
            const drafts = Object.values(draft.composerDrafts).reduce((result, peerDrafts) => {
                peerDrafts.forEach((draft) => result.push(draft));
                return result;
            }, 
            // Хоть oldDraft и должен быть среди composerDrafts,
            // указываем его тут для надежности при будущих доработках.
            [oldDraft]);
            drafts.forEach((composerDraft) => {
                const { forward, editing } = composerDraft;
                /**
                 * Чистим форвард, только если не редактируем сообщение с форвардом,
                 * так как сообщение можно будет успешно отредактировать.
                 */
                if (editing !== undefined || forward === undefined) {
                    return;
                }
                if (foreignKind === "message" /* ComposerDraft.ForwardKind.Message */ &&
                    forward.kind === "message" /* ComposerDraft.ForwardKind.Message */) {
                    const newForwardItems = toNonEmpty([...forward.items].reduce((result, item) => {
                        const replacingMessage = findMessage(itemsToReplace, item);
                        if (replacingMessage !== undefined) {
                            result.push(replacingMessage);
                            return result;
                        }
                        if (!findMessage(itemsToDelete, item)) {
                            result.push(item);
                        }
                        return result;
                    }, []));
                    // Выше смешали сообщения в массив Message.Normal | Message.Foreign
                    //@ts-expect-error
                    composerDraft.forward =
                        newForwardItems !== null
                            ? {
                                kind: "message" /* ComposerDraft.ForwardKind.Message */,
                                items: newForwardItems,
                            }
                            : undefined;
                }
                if (foreignKind === "post" /* ComposerDraft.ForwardKind.Post */ &&
                    forward.kind === "post" /* ComposerDraft.ForwardKind.Post */) {
                    const newForwardItems = toNonEmpty([...forward.items].reduce((result, item) => {
                        const replacingPost = findPost(itemsToReplace, item);
                        if (replacingPost !== undefined &&
                            replacingPost.kind !== 'Postponed') {
                            result.push(replacingPost);
                            return result;
                        }
                        if (!findPost(itemsToDelete, item)) {
                            result.push(item);
                        }
                        return result;
                    }, []));
                    composerDraft.forward =
                        newForwardItems !== null
                            ? {
                                kind: "post" /* ComposerDraft.ForwardKind.Post */,
                                items: newForwardItems,
                            }
                            : undefined;
                }
                if (forward.kind === "comment" /* ComposerDraft.ForwardKind.Comment */ &&
                    foreignKind === "comment" /* ComposerDraft.ForwardKind.Comment */) {
                    const newForwardItems = toNonEmpty([...forward.items].reduce((result, item) => {
                        const replacingComment = findComment(itemsToReplace, item);
                        if (replacingComment !== undefined) {
                            result.push(replacingComment);
                            return result;
                        }
                        if (!findComment(itemsToDelete, item)) {
                            result.push(item);
                        }
                        return result;
                    }, []));
                    composerDraft.forward =
                        newForwardItems !== null
                            ? {
                                kind: "comment" /* ComposerDraft.ForwardKind.Comment */,
                                items: newForwardItems,
                            }
                            : undefined;
                }
            });
            break;
        }
        /**
         * Экшен отвечает за вычищение удаленных и исчезнувших сообщений из черновиков.
         * Сообщение не получится отправить, если этого не сделать.
         * И также в рамках этого экшена загружаем данные пиров в форвардах черновиков, которых
         * может не быть в кэше.
         */
        case 'ActualizeComposerDraft': {
            const ownerId = draft.ownerId;
            newPeerDraft.push(oldDraft);
            return newPeerDraft.map((draft) => {
                const currentDraft = isDraft(draft) ? current(draft) : draft;
                return async ({ api }) => {
                    const { reply, forward, editing } = currentDraft;
                    const foreignMessages = [
                        ...(editing ? [editing] : []),
                        ...(reply ? [reply] : []),
                        ...(forward?.kind === "message" /* ComposerDraft.ForwardKind.Message */
                            ? forward.items
                            : []),
                    ]
                        /**
                         * Только Normal сообщения проверяем на существование, так как остальные виды
                         * сообщений могут быть в реплае или форварде только при редактировании и в
                         * этом случае удаленные сообщения можно не чистить.
                         */
                        .reduce((result, message) => {
                        if (message.kind !== 'Foreign' &&
                            message.kind !== 'ForeignExpired') {
                            result.push(message);
                        }
                        return result;
                    }, []);
                    // Дублирующие проверки, нужны для Typescript
                    if (foreignMessages.length > 0 && foreignMessages[0]) {
                        const peerId = foreignMessages[0].peerId;
                        const foreignMessagesCmids = foreignMessages.reduce((result, message) => {
                            /**
                             * Завязка на то, что у нас есть либо реплай, либо форвард
                             * и все сообщения в них из одного чата.
                             */
                            if (message.peerId !== peerId) {
                                if (isDev) {
                                    throw new Error('Перессылаемые сообщения не из одного чата');
                                }
                                return result;
                            }
                            result.push(message.cmid);
                            return result;
                        }, []);
                        try {
                            const response = await api.fetch('messages.getByConversationMessageId', {
                                peer_id: peerId,
                                conversation_message_ids: foreignMessagesCmids.join(','),
                                extended: 1,
                                group_id: getOwnerGroupId(ownerId),
                            });
                            return {
                                type: 'ActualizeComposerDraft_RequestCompleted',
                                peerId,
                                foreignKind: "message" /* ComposerDraft.ForwardKind.Message */,
                                foreignItems: foreignMessages,
                                response,
                            };
                        }
                        catch { }
                    }
                    if (forward?.kind === "post" /* ComposerDraft.ForwardKind.Post */) {
                        const { channelId } = forward.items[0];
                        const foreignPostsCmids = forward.items.reduce((result, post) => {
                            /**
                             * Завязка на то, что все посты при пересслыке из одного канала.
                             */
                            if (post.channelId !== channelId) {
                                if (isDev) {
                                    throw new Error('Перессылаемые посты не из одного канала');
                                }
                                return result;
                            }
                            result.push(post.cmid);
                            return result;
                        }, []);
                        try {
                            const response = await api.fetch('channels.getMessagesById', {
                                channel_id: channelId,
                                cmids: foreignPostsCmids.join(','),
                                extended: 1,
                            });
                            return {
                                type: 'ActualizeComposerDraft_RequestCompleted',
                                peerId,
                                foreignKind: "post" /* ComposerDraft.ForwardKind.Post */,
                                foreignItems: forward.items,
                                response,
                            };
                        }
                        catch { }
                    }
                    if (forward?.kind === "comment" /* ComposerDraft.ForwardKind.Comment */) {
                        const { channelId, postCmid } = forward.items[0];
                        const isCommentFromCommunityChannel = Comment.isFromCommunityChannel(forward.items[0]);
                        const commentsCmids = [...forward.items].reduce((result, comment) => {
                            if (comment.channelId !== channelId ||
                                comment.postCmid !== postCmid) {
                                if (isDev) {
                                    throw new Error('Пересылаемые комменты не из одного поста или даже не из одного канала');
                                }
                                return result;
                            }
                            result.push(comment.cmid);
                            return result;
                        }, []);
                        try {
                            const responses = await api.fetchMany(commentsCmids.map((cmid) => 
                            //TODO: comments: подумать над тем, чтобы запрашивать getComment вместо getComments
                            isCommentFromCommunityChannel
                                ? {
                                    method: 'channels.getComments',
                                    params: {
                                        channel_id: channelId,
                                        cmid: postCmid,
                                        start_comment_id: cmid,
                                        count: 1,
                                        offset: 0,
                                        extended: 1,
                                    },
                                }
                                : {
                                    method: 'wall.getComments',
                                    params: {
                                        owner_id: channelId,
                                        post_id: postCmid,
                                        start_comment_id: cmid,
                                        count: 1,
                                        offset: 0,
                                        extended: 1,
                                    },
                                }));
                            return {
                                type: 'ActualizeComposerDraft_RequestCompleted',
                                peerId,
                                foreignKind: "comment" /* ComposerDraft.ForwardKind.Comment */,
                                foreignItems: forward.items,
                                response: commentsCmids.reduce((result, cmid, index) => {
                                    const response = responses[index];
                                    if (!response) {
                                        return result;
                                    }
                                    result[cmid] = response;
                                    return result;
                                }, {}),
                            };
                        }
                        catch { }
                    }
                    return { type: 'Noop' };
                };
            });
        }
        case 'ActualizeComposerDraft_RequestCompleted': {
            const { response, foreignKind, foreignItems } = action;
            switch (foreignKind) {
                case "message" /* ComposerDraft.ForwardKind.Message */: {
                    const { profiles, groups, contacts, items } = response;
                    insertPeers(draft, {
                        apiUsers: profiles || [],
                        apiGroups: groups || [],
                        apiContacts: contacts || [],
                    });
                    const messages = items.reduce((result, apiMessage) => {
                        if (apiMessage.deleted) {
                            return result;
                        }
                        const message = fromApiMessage(featureFlags, apiMessage).message;
                        if (message.kind === 'Normal') {
                            result.push(message);
                        }
                        return result;
                    }, []);
                    const itemsToDelete = foreignItems.filter((item) => !findMessage(messages, item));
                    if (itemsToDelete.length > 0 || messages.length > 0) {
                        return [
                            async () => ({
                                type: 'ComposerDraftsUpdateNeeded',
                                foreignKind: "message" /* ComposerDraft.ForwardKind.Message */,
                                itemsToDelete,
                                itemsToReplace: messages,
                                peerId,
                            }),
                        ];
                    }
                    return [];
                }
                case "post" /* ComposerDraft.ForwardKind.Post */: {
                    const { profiles, groups, items } = response;
                    insertPeers(draft, {
                        apiUsers: profiles || [],
                        apiGroups: groups || [],
                        apiContacts: [],
                    });
                    const posts = items?.map((post) => fromApiPost(post).post) ?? [];
                    const itemsToDelete = foreignItems.filter((item) => !findPost(posts, item));
                    if (itemsToDelete.length > 0 || posts.length > 0) {
                        return [
                            async () => ({
                                type: 'ComposerDraftsUpdateNeeded',
                                foreignKind: "post" /* ComposerDraft.ForwardKind.Post */,
                                itemsToDelete,
                                itemsToReplace: posts,
                                peerId,
                            }),
                        ];
                    }
                    return [];
                }
                case "comment" /* ComposerDraft.ForwardKind.Comment */: {
                    const { comments, itemsToDelete } = foreignItems.reduce((result, comment) => {
                        const responseItem = response[comment.cmid];
                        if (!responseItem) {
                            result.itemsToDelete.push(comment);
                            return result;
                        }
                        //TODO: comments: расскоментировать и удалить "as WallGetCommentsExtendedResponse"
                        // после того как бек доделает extended для channels.getComments
                        //const { profiles, groups, items } = responseItem
                        insertPeers(draft, {
                            apiUsers: responseItem.profiles ||
                                [],
                            apiGroups: responseItem.groups ||
                                [],
                            apiContacts: [],
                        });
                        if (responseItem.items.length === 0) {
                            result.itemsToDelete.push(comment);
                            return result;
                        }
                        responseItem.items.forEach((apiComment) => {
                            const updatedComment = fromApiComment(apiComment);
                            /**
                             * Для комментариев второго уровня и больше wall.getComments
                             * возвращает ближайщий коммент первого уровня.
                             * Починится в https://jira.mvk.com/browse/LENTACH-4123 .
                             */
                            if (updatedComment.kind === 'Normal' &&
                                updatedComment.cmid === comment.cmid) {
                                result.comments.push(updatedComment);
                            }
                            else {
                                result.comments.push(comment);
                            }
                        });
                        return result;
                    }, { comments: [], itemsToDelete: [] });
                    if (itemsToDelete.length > 0 || comments.length > 0) {
                        return [
                            async () => ({
                                type: 'ComposerDraftsUpdateNeeded',
                                foreignKind: "comment" /* ComposerDraft.ForwardKind.Comment */,
                                itemsToDelete,
                                itemsToReplace: comments,
                                peerId,
                            }),
                        ];
                    }
                    return [];
                }
                default:
                    return exhaustivenessCheck(foreignKind);
            }
        }
        default:
            exhaustivenessCheck(action);
    }
    const isDraftEmpty = (newPeerDraft) => !newPeerDraft.text.trim() &&
        !newPeerDraft.forward &&
        !newPeerDraft.reply &&
        !newPeerDraft.editing &&
        Object.keys(newPeerDraft.attaches).length === 0 &&
        newPeerDraft.uploadsTrackIds.size === 0;
    newPeerDraft = newPeerDraft.filter((draft) => !isDraftEmpty(draft));
    const isNewPeerDraftEmpty = newPeerDraft.length === 0;
    const convo = peerId !== undefined ? draft.convos.get(peerId) : undefined;
    const newIsDrafted = !isNewPeerDraftEmpty && !!convo?.canWrite.allowed;
    let shouldLogIsDraftedChange = false;
    if (peerId !== undefined) {
        if (isNewPeerDraftEmpty) {
            delete currentDrafts[peerId];
        }
        else {
            currentDrafts[peerId] = newPeerDraft;
        }
        let canUpdateIsDrafted;
        if (newIsDrafted) {
            canUpdateIsDrafted =
                action.type === 'UserChangedComposerDraft' &&
                    !!action.updateIsDraftedFlag;
        }
        else {
            canUpdateIsDrafted =
                action.type === 'UserChangedComposerDraft'
                    ? !!action.updateIsDraftedFlag
                    : true;
        }
        const shouldUpdateIsDraftedFlag = canUpdateIsDrafted &&
            convo &&
            convo.isDrafted !== newIsDrafted &&
            !isPostponed;
        if (shouldUpdateIsDraftedFlag) {
            Convo.updateIsDrafted(convo, newIsDrafted);
            Organisers.refresh(draft.organisers, convo);
            if (newIsDrafted) {
                shouldLogIsDraftedChange = true;
            }
            else {
                shouldLogIsDraftedChange =
                    (action.type === 'UserClearedComposerDraft' && !action.withoutLog) ||
                        action.type === 'UserChangedComposerDraft';
            }
        }
    }
    const undraftedComposerDrafts = current(draft.composerDrafts);
    const undraftedComposerPostponedDrafts = current(draft.composerPostponedDrafts);
    return [
        shouldLogIsDraftedChange &&
            (async ({ stats }) => {
                stats.logEvent({
                    type: 'type_action',
                    type_action: {
                        type: 'type_messaging_action_item',
                        type_messaging_action_item: {
                            action_type: newIsDrafted
                                ? 'create_draft_message'
                                : 'delete_draft_message',
                            peer_id: peerId,
                            label: getLogEventLabel(),
                        },
                    },
                });
                return {
                    type: 'Noop',
                };
            }),
        async ({ storage }) => {
            storage.set('drafts', undraftedComposerDrafts);
            storage.set('postponedDrafts', undraftedComposerPostponedDrafts);
            return {
                type: 'Noop',
            };
        },
    ];
};
/**
 * Принимает относящиеся к аттачам свойства из драфта композера и экшена
 *
 * Возвращает изменение, которое должен содержать новый драфт
 */
export function applyAttachmentActions(oldDraft, action) {
    switch (action.kind) {
        case 'addAttaches': {
            const { attaches, trackIds } = action;
            let draftAttaches = oldDraft.attaches;
            if (attaches) {
                draftAttaches = produce(draftAttaches, (draft) => {
                    Attach.addAttach(draft, attaches);
                });
            }
            let draftUploadsTrackIds = oldDraft.uploadsTrackIds;
            if (trackIds?.length) {
                draftUploadsTrackIds = produce(draftUploadsTrackIds, (draft) => {
                    trackIds.forEach((trackId) => {
                        draft.delete(trackId);
                    });
                });
            }
            return {
                attaches: draftAttaches,
                uploadsTrackIds: draftUploadsTrackIds,
            };
        }
        case 'removeAttach': {
            const { attach, index } = action;
            let attaches = oldDraft.attaches;
            if (attach) {
                attaches = produce(attaches, (draft) => {
                    Attach.removeAttach(draft, attach, index);
                });
            }
            return {
                attaches,
            };
        }
        case 'removeVoice': {
            const attaches = produce(oldDraft.attaches, (draft) => {
                if (draft.voice) {
                    delete draft.voice;
                }
            });
            return {
                attaches,
            };
        }
        case 'startUploading': {
            const { trackIds } = action;
            const uploadsTrackIds = new Set([
                ...oldDraft.uploadsTrackIds,
                ...trackIds,
            ]);
            return {
                uploadsTrackIds,
            };
        }
        case 'removeUploads': {
            const { trackIds } = action;
            const uploadsTrackIds = produce(oldDraft.uploadsTrackIds, (draft) => {
                trackIds.forEach((trackId) => {
                    draft.delete(trackId);
                });
            });
            return {
                uploadsTrackIds,
            };
        }
        case 'rearrangeAttaches': {
            const { key, currentPosition, newPosition } = action;
            let attaches = oldDraft.attaches;
            if (newPosition !== -1 && newPosition !== currentPosition) {
                attaches = produce(attaches, (draft) => {
                    Attach.rearrangeAttaches(draft, { currentPosition, newPosition }, key);
                });
            }
            return {
                attaches,
            };
        }
        default:
            exhaustivenessCheck(action);
    }
}
function findMessage(items = [], message) {
    return items.find((item) => message.peerId === item.peerId && message.cmid === item.cmid);
}
function findPost(items = [], post) {
    return items.find((item) => post.channelId === item.channelId && post.cmid === item.cmid);
}
function findComment(items = [], comment) {
    return items.find((item) => comment.channelId === item.channelId &&
        comment.postCmid === item.postCmid &&
        comment.cmid === item.cmid);
}
//# sourceMappingURL=UserChangedComposerDraft.js.map