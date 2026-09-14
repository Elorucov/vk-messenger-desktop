import { current } from 'immer';
import { insertPeers, insertConvos, getOwnerGroupId } from '../store/State';
import * as Peer from '../../core/model/Peer';
import * as Convo from '../../core/model/Convo';
import * as Organisers from '../../core/model/Organisers';
import * as RemindAnswerToMessage from '../../core/model/RemindAnswerToMessage';
import { exhaustivenessCheck, isDev } from '../../core/utils/misc';
import { fromApiStickersKeywords } from '../converter/StickerConverter';
import { getIsAnimationAutoplay } from '@vkontakte-internal/stickers-kit';
import { IPerfStats } from '../env/IPerfStats';
import { updateRemindAnswerStorageOnChange } from '../env/RemindAnswerManager';
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'LoadChatMembers':
        case 'ActualizeComposerDraft':
        case 'VKCOMRightColumnConvosUpdated': {
            return [];
        }
        case 'UserOpenedConvo': {
            draft.convoLoadingFailed = undefined;
            const { peerId } = action;
            const convo = draft.convos.get(peerId);
            /**
             * Блокируем очистку неоткрытой беседы,
             * потому что в открытой беседе скролл пользователя может быть
             * в любом месте.
             * В таком случае мы не хотим чистить сообщения прямо перед глазами.
             */
            const count = draft.locks.convosCleanup.get(peerId) || 0;
            draft.locks.convosCleanup.set(peerId, count + 1);
            const groupId = getOwnerGroupId(draft.ownerId);
            /**
             * 1) Если диалог не был найден в кэше, загружаем его
             * 2) Если даже диалог есть в кэше, но при этом он является пришел с бэка как "мертвый/неактуальный"
             */
            if (!convo || !convo?.isAlive) {
                return [
                    async function ({ api, perfStats }) {
                        try {
                            perfStats?.addEventData(IPerfStats.EventType.openChat, {
                                loadConvoStart: perfStats.getCurrentTime(),
                            });
                            const response = await api.fetch('messages.getConversationsById', {
                                peer_ids: peerId.toString(),
                                group_id: groupId,
                                extended: 1,
                            }, {
                                retries: 3,
                            });
                            perfStats?.addEventData(IPerfStats.EventType.openChat, {
                                loadConvoEnd: perfStats.getCurrentTime(),
                            });
                            return {
                                type: 'UserOpenedConvo_ConvoRequestCompleted',
                                peerId,
                                hasFailed: false,
                                profiles: response.profiles,
                                groups: response.groups,
                                conversations: response.items,
                                contacts: response.contacts,
                            };
                        }
                        catch (err) {
                            return {
                                type: 'UserOpenedConvo_ConvoRequestCompleted',
                                peerId,
                                hasFailed: true,
                            };
                        }
                    },
                ];
            }
            return handler(draft, {
                type: 'UserOpenedConvo_ConvoRequestCompleted',
                peerId,
                hasFailed: false,
            }, featureFlags, envFeatureFlags);
        }
        case 'UserOpenedConvo_ConvoRequestCompleted': {
            const { peerId, conversations, profiles, groups, contacts, hasFailed } = action;
            if (hasFailed) {
                if (isDev) {
                    throw new Error('Не удалось загрузить диалог');
                }
                draft.convoLoadingFailed = peerId;
                return [];
            }
            /**
             * Если такие параметры есть, значит экшен был вызван после дозагрузки данных о диалогах
             */
            insertConvos(draft, conversations || [], featureFlags);
            const isStickersAnimationEnabled = getIsAnimationAutoplay();
            if (isStickersAnimationEnabled !== null) {
                draft.viewer.settings.isStickersAnimationEnabled =
                    isStickersAnimationEnabled;
            }
            insertPeers(draft, {
                apiUsers: profiles || [],
                apiGroups: groups || [],
                apiContacts: contacts || [],
            });
            const convo = draft.convos.get(peerId);
            /**
             * Данная ошибка не должна никогда срабатывать, так как экшин вызывается только при наличии convo
             */
            if (!convo) {
                if (isDev) {
                    throw new Error('Диалог не был найден');
                }
                return [];
            }
            const shouldMarkRead = Convo.hasPeerFlag(convo, Convo.PEER_FLAGS.isMarkedUnread) &&
                convo.unreadCount === 0;
            if (shouldMarkRead) {
                Convo.markRead(convo);
            }
            if (conversations || shouldMarkRead) {
                Organisers.refresh(draft.organisers, convo);
            }
            const shouldLoadMembers = convo.kind === 'ChatConvo' &&
                convo.members.memberIds.size === 0 &&
                Convo.canReadMembers(convo) &&
                !draft.locks.getConversationMembers.has(peerId);
            if (shouldLoadMembers) {
                draft.locks.getConversationMembers.add(peerId);
            }
            const groupId = getOwnerGroupId(draft.ownerId);
            RemindAnswerToMessage.updateMarkOnOpen(draft.remindAnswerToMessage, convo.history, peerId, featureFlags.vkm_wall_reply_required);
            const remindAnswerToMessage = current(draft.remindAnswerToMessage);
            const shouldReturnStickersKeywordsIfNotExpired = draft.stickersKeywords.size === 0;
            return [
                async function updateVKCOMRightColumnConvos() {
                    return {
                        type: 'VKCOMRightColumnConvosUpdated',
                        change: 'add',
                        peerId,
                        reason: 'opened',
                    };
                },
                shouldLoadMembers &&
                    Peer.isChatPeerId(peerId) &&
                    async function loadChatMembers() {
                        return {
                            type: 'LoadChatMembers',
                            peerId,
                        };
                    },
                async function loadKeywords({ api, storage }) {
                    try {
                        const response = await loadStickersKeywords({
                            api,
                            storage,
                            featureFlags,
                            shouldReturnStickersKeywordsIfNotExpired,
                        });
                        return {
                            type: 'UserOpenedConvo_StickersKeywordsRequestCompleted',
                            response,
                        };
                    }
                    catch {
                        return {
                            type: 'UserOpenedConvo_StickersKeywordsRequestCompleted',
                        };
                    }
                },
                shouldMarkRead &&
                    async function markConvoRead({ api }) {
                        try {
                            await api.fetch('messages.markAsRead', {
                                peer_id: peerId,
                                mark_conversation_as_read: 0,
                                group_id: groupId,
                            });
                        }
                        catch { }
                        return { type: 'Noop' };
                    },
                async function ActualizeComposerDraft() {
                    return { type: 'ActualizeComposerDraft', peerId };
                },
                async function storeRemindAnswerToMessage({ storage }) {
                    updateRemindAnswerStorageOnChange(storage, remindAnswerToMessage, action.peerId);
                    return { type: 'Noop' };
                },
            ];
        }
        case 'UserClosedConvo': {
            const count = draft.locks.convosCleanup.get(action.peerId);
            if (count && count > 1) {
                draft.locks.convosCleanup.set(action.peerId, count - 1);
                return [];
            }
            draft.locks.convosCleanup.delete(action.peerId);
            const convo = draft.convos.get(action.peerId);
            if (!convo) {
                return [];
            }
            RemindAnswerToMessage.updateMarkOnClose(draft.remindAnswerToMessage, convo.history, action.peerId, convo.inReadBy, featureFlags.vkm_wall_reply_required);
            const remindAnswerToMessage = current(draft.remindAnswerToMessage);
            Convo.cleanup(convo);
            return [
                async function storeRemindAnswerToMessage({ storage }) {
                    updateRemindAnswerStorageOnChange(storage, remindAnswerToMessage, action.peerId);
                    return { type: 'Noop' };
                },
            ];
        }
        case 'UserOpenedConvo_StickersKeywordsRequestCompleted': {
            const { response } = action;
            if (response) {
                draft.stickersKeywords = fromApiStickersKeywords(response);
            }
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
async function loadStickersKeywords({ api, storage, shouldReturnStickersKeywordsIfNotExpired, featureFlags, }) {
    const stickersKeywordsMeta = storage.get('stickers-keywords-meta');
    const NOW_TIMESTAMP = Math.round(new Date().getTime() / 1000);
    const DAY_IN_SEC = 60 * 60 * 24;
    const isStorageStickersKeywordsNotExpired = stickersKeywordsMeta &&
        stickersKeywordsMeta.expiresAt > NOW_TIMESTAMP &&
        !stickersKeywordsMeta.incomplete;
    if (isStorageStickersKeywordsNotExpired) {
        if (!shouldReturnStickersKeywordsIfNotExpired) {
            return;
        }
        const stickersKeywords = await storage.getIDB('stickers-keywords');
        return stickersKeywords?.dictionary;
    }
    const dictionary = [];
    let chunk = 0;
    let chunksHash;
    let incomplete = false;
    while (true) {
        try {
            const { dictionary: part, chunks_hash, chunks_count, } = await api.fetch('store.getStickersKeywords', {
                need_stickers: 0,
                all_products: featureFlags.vas_promoted_stickers ? 1 : 0,
                chunk,
                chunks_hash: chunksHash,
            }, {
                retries: 2,
            });
            dictionary.push(...part);
            chunksHash = chunks_hash;
            chunk++;
            if (!chunks_count || chunks_count === chunk) {
                break;
            }
        }
        catch {
            incomplete = true;
            break;
        }
    }
    try {
        await storage.setIDB('stickers-keywords', {
            dictionary,
        });
        storage.set('stickers-keywords-meta', {
            expiresAt: NOW_TIMESTAMP + DAY_IN_SEC,
            incomplete,
        });
    }
    catch {
        // ну не сохранили и не сохранили
    }
    return dictionary;
}
//# sourceMappingURL=UserOpenedConvo.js.map