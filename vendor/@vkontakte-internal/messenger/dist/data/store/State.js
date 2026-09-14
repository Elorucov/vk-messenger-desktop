import * as Organisers from '../../core/model/Organisers';
import * as Convo from '../../core/model/Convo';
import * as Peer from '../../core/model/Peer';
import * as Trie from '../../core/model/Trie';
import * as Channel from '../../core/model/Channel';
import * as Folder from '../../core/model/Folder';
import * as ChatMembers from '../../core/model/ChatMembers';
import * as Tag from '../../core/model/Tag';
import { fromApiConvo } from '../converter/ConvoConverter';
import { fromApiContact, fromApiGroup, fromApiUser, } from '../converter/PeerConverter';
import { fromApiFolderRecommended } from '../converter/FolderConverter';
import { fromApiChannel } from '../converter/ChannelConverter';
import { fromApiPost } from '../converter/PostConverter';
import { fromApiManagedGroup } from '../converter/ManagedGroupConverter';
import { fromApiIncognitoMember } from '../converter/ChatIncognitoMemberConverter';
import { fromApiSpace, fromApiSpaceCall, fromApiSpaceTribune, } from '../converter/SpaceConverter';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const TypingVariants = [
    'text',
    'voice',
    'photo',
    'video',
    'file',
    'videomessage',
];
/**
 * Добавление бесед в кэш.
 */
export function insertConvos(draft, apiConvos, featureFlags, { dangerouslyMerge, shouldUpdateSortId, invalidateHistory, } = {}) {
    const inserted = [];
    for (const apiConvo of apiConvos) {
        const result = 'conversation' in apiConvo
            ? fromApiConvo(featureFlags, apiConvo.conversation, apiConvo.last_message)
            : fromApiConvo(featureFlags, apiConvo);
        if (!result) {
            continue;
        }
        const { convo, peer } = result;
        /**
         * Если беседа уже есть, не будем ее перезатирать.
         * Пока шел запрос, мы могли получить апдейты из лонгполла,
         * таким образом наша беседа может быть в более актуальном состоянии.
         */
        const existing = draft.convos.get(convo.peerId);
        if (existing && !dangerouslyMerge && existing.isAlive) {
            inserted.push(existing);
            continue;
        }
        /**
         * Если беседа уже есть в кэше, то не нужно "прикручивать" к ней зафэйлившиеся сообщения из хранилища - они уже в беседе.
         * Сначала зафэйлившиеся сообщения попадают в существующую беседу, только потом дублируются в хранилище.
         */
        if (!existing) {
            const peerId = 'conversation' in apiConvo
                ? Peer.resolveId(apiConvo.conversation.peer.id)
                : Peer.resolveId(apiConvo.peer.id);
            const storedConvoFailedMessages = draft.convosFailedMessages[peerId] || [];
            storedConvoFailedMessages.forEach((msg) => Convo.appendQueuedMessage(convo, msg));
        }
        const majorSortId = convo.majorSortId;
        Convo.merge(convo, existing, {
            invalidateHistory,
        });
        /**
         * TODO: Избавиться от этого кода, когда в файле
         * src/core/model/Convo.ts:1052 не будет проверки
         * на majorSortId, пришедшее из методов апи со значением 0
         */
        if (shouldUpdateSortId) {
            Convo.updateSortId(convo, { majorSortId });
        }
        draft.convos.set(convo.peerId, convo);
        if (peer) {
            draft.peers.set(peer.id, peer);
        }
        const peerDrafts = draft.composerDrafts[convo.peerId];
        if (peerDrafts && peerDrafts[peerDrafts.length - 1]) {
            Convo.updateIsDrafted(convo, convo.canWrite.allowed);
        }
        Organisers.refresh(draft.organisers, convo);
        inserted.push(convo);
        /**
         * Если изменился локальный идентификатор закрепленного сообщения отсносительно беседы,
         * то сбрасываем факт скрытия закрепленного сообщения в беседе.
         */
        if (convo.kind === 'ChatConvo' &&
            draft.hiddenPinnedMessages.get(convo.peerId) !== convo.pinnedMessage?.cmid) {
            draft.hiddenPinnedMessages.delete(convo.peerId);
        }
    }
    if (!featureFlags.vkm_search_convos_new_sort) {
        // Добавляем беседы в индекс поиска бесед. Индекс используется в основном мессенджере, FC
        const searchableConvos = inserted.filter(Convo.isSearchableConvo);
        Trie.add(draft.convosSearchIndex, searchableConvos, (convo) => {
            const peer = draft.peers.get(convo.peerId);
            return {
                id: convo.peerId,
                strings: peer ? Trie.peerWords(peer) : [],
            };
        });
    }
    return inserted;
}
/**
 * Добавление бесед в кэш.
 * Обрати внимание, использовать параметр dangerouslyOverwrite нужно очень осторожно.
 * Его использование может вызвать массивные ререндеры приложения.
 */
export function insertPeers(draft, { apiUsers, apiGroups, apiContacts, }, { dangerouslyOverwrite } = {}) {
    const insertedUsers = [];
    for (const apiUser of apiUsers) {
        const { user, lastSeen } = fromApiUser(apiUser);
        /**
         * Информацию об онлайнах будем обновлять в любом случае,
         * чтобы снизить вероятность появления рассинхрона после разрывов очереди.
         */
        draft.lastSeens.set(user.id, lastSeen);
        const existing = draft.peers.get(user.id);
        /**
         * В качестве оптимизации не будем лишний раз обновлять
         * пиров, чтобы не было лишних ререндеров.
         *
         * TODO: надо придумать некую эвристику, чтобы на самом деле
         *  пиров обновлять, но не часто.
         *  Возможно можно вычислять по pts.
         */
        if (existing?.kind === 'User' && !dangerouslyOverwrite) {
            insertedUsers.push(existing);
            continue;
        }
        draft.peers.set(user.id, user);
        insertedUsers.push(user);
    }
    const insertedGroups = [];
    for (const apiGroup of apiGroups) {
        const group = fromApiGroup(apiGroup);
        /**
         * В качестве оптимизации не будем лишний раз обновлять
         * пиров, чтобы не было лишних ререндеров.
         *
         * TODO: надо придумать некую эвристику, чтобы на самом деле
         * пиров обновлять, но не часто.
         * Возможно можно вычислять по pts.
         */
        const existing = draft.peers.get(group.id);
        if (existing && existing.kind === 'Group' && !dangerouslyOverwrite) {
            insertedGroups.push(existing);
            continue;
        }
        draft.peers.set(group.id, group);
        insertedGroups.push(group);
    }
    const insertedContacts = [];
    for (const apiContact of apiContacts) {
        const contact = fromApiContact(apiContact);
        const existing = draft.peers.get(contact.id);
        if (existing && existing.kind === 'Contact' && !dangerouslyOverwrite) {
            insertedContacts.push(existing);
            continue;
        }
        draft.peers.set(contact.id, contact);
        insertedContacts.push(contact);
    }
    return { insertedUsers, insertedGroups, insertedContacts };
}
/**
 * Вставляет в кеш пиров и в поле `items` у контактов профили,
 * которые вернул метод `account.getContactList` (друзья + контакты)
 *
 * Порядок определяется бекендом, более важные собеседники находятся выше.
 */
export function insertContactItems(draft, apiItems, apiProfiles) {
    const insertedItems = [];
    // Вставляем профили в кеш пиров
    insertPeers(draft, {
        apiUsers: apiProfiles,
        apiGroups: [],
        apiContacts: [],
    }, 
    // Записываем свежую информацию, так как после закрытия контактов и так произойдет ререндер
    { dangerouslyOverwrite: true });
    apiItems.forEach((id) => {
        const resolvedId = Peer.resolveId(id);
        if (Peer.isUserPeerId(resolvedId)) {
            const user = draft.peers.get(resolvedId);
            if (user?.kind !== 'User') {
                return;
            }
            draft.contacts.items.set(resolvedId, user);
            insertedItems.push(resolvedId);
        }
    });
    return insertedItems;
}
export function insertContacts(draft, apiContacts) {
    const insertedContacts = [];
    apiContacts.sort((a, b) => a.name.localeCompare(b.name));
    for (const apiContact of apiContacts) {
        const contact = fromApiContact(apiContact);
        const id = contact.userId ? contact.userId : contact.id;
        draft.contacts.contacts.set(id, contact);
        insertedContacts.push(contact);
    }
    return insertedContacts;
}
export function insertFolders(draft, foldersList, featureFlags, envFeatureFlags, { dangerouslyOverwrite, } = {}) {
    // Исключаем неизвестные и вычключенные тоглом папки
    const folders = foldersList.filter((f) => Folder.canAdd(f, featureFlags, envFeatureFlags));
    if (dangerouslyOverwrite) {
        const newFolders = folders.map((folder) => {
            const currentFolder = draft.organisers.folders.find(({ id }) => folder.id === id);
            if (!currentFolder) {
                return folder;
            }
            return {
                ...folder,
                /**
                 * Не сбрасываем фильтры. Список чатов в папке, как и новые
                 * чаты (добавленные или удаленные) загрузятся вместе с getDiff.
                 * Из-за чего boundaryMinorId и hasMore останутся корректными.
                 */
                all: currentFolder.all,
                unread: currentFolder.unread,
            };
        });
        draft.organisers.folders = newFolders;
        return newFolders;
    }
    const insertedFolders = [];
    for (const folder of folders) {
        const existing = draft.organisers.folders.find((f) => f.id === folder.id);
        if (existing) {
            insertedFolders.push(folder);
            continue;
        }
        draft.organisers.folders.push(folder);
        insertedFolders.push(folder);
    }
    return insertedFolders;
}
export function setTags(draft, tags) {
    return tags.map((tag) => {
        const existing = draft.organisers.tags.items.some(({ id }) => tag.id === id);
        if (existing) {
            Tag.replaceTag(draft.organisers.tags, tag);
        }
        else {
            draft.organisers.tags.items.push(tag);
        }
        return tag;
    });
}
export function setTagsUnavailable(draft) {
    draft.organisers.tags.isUnavailable = true;
}
export function insertSublists(draft, sublists) {
    const insertedSublists = [];
    if (!sublists || sublists.length === 0) {
        return insertedSublists;
    }
    for (const sublist of sublists) {
        const existing = draft.organisers.sublists.find((s) => s.type === sublist.type);
        if (existing) {
            insertedSublists.push(sublist);
            continue;
        }
        draft.organisers.sublists.push(sublist);
        insertedSublists.push(sublist);
    }
    return insertedSublists;
}
export function insertRecommendedFolders(draft, apiFolders, featureFlags, envFeatureFlags) {
    const insertedFolders = [];
    for (const apiFolder of apiFolders) {
        const folder = fromApiFolderRecommended(apiFolder);
        if (!Folder.canAdd(folder, featureFlags, envFeatureFlags)) {
            continue;
        }
        const existing = draft.organisers.recommendedFolders.find((f) => f.type === folder.type);
        if (existing) {
            insertedFolders.push(folder);
            continue;
        }
        draft.organisers.recommendedFolders.push(folder);
        insertedFolders.push(folder);
    }
    return insertedFolders;
}
export function insertChannels(draft, { apiChannels, apiGroups, trackCodes: _trackCodes, dangerouslyMerge, featureFlags, }) {
    const inserted = [];
    /**
     * Треккоды приходят отдельным массивом и важный инвариант - это совпадение кол-ва треккодов и каналов
     */
    const trackCodes = _trackCodes?.length === apiChannels.length ? _trackCodes : [];
    for (const apiChannel of apiChannels) {
        let group;
        // в "старых" каналах айдишник группы и канала совпадал, в "новых"
        // каналах надо проверять айдишку группы с полем parent_id канала
        if (apiChannel.channel.channel_type === 'community_channel') {
            group = apiGroups.find((item) => {
                const channelId = Channel.fromApiGroupIdToGroupRangeId(item.id);
                return channelId === apiChannel.channel.parent_id;
            });
        }
        else {
            group = apiGroups.find((item) => {
                const channelId = Channel.fromApiGroupIdToGroupRangeId(item.id);
                return channelId === apiChannel.channel.channel_id;
            });
        }
        if (!group) {
            throw new Error('С бэка не приходит нужная группа для канала');
        }
        const isParentGroupDeactivated = group.deactivated === 'banned' || group.deactivated === 'blocked';
        if (isParentGroupDeactivated) {
            const id = Channel.resolveId(apiChannel.channel.channel_id);
            draft.channels.set(id, {
                id,
                kind: 'ChannelRestricted',
            });
            continue;
        }
        let channelTrackCode;
        if (trackCodes.length) {
            const channelIdx = apiChannels.findIndex((c) => c.channel.channel_id === apiChannel.channel.channel_id);
            if (channelIdx !== -1) {
                channelTrackCode = trackCodes[channelIdx];
            }
        }
        const channel = fromApiChannel(featureFlags, apiChannel, group, channelTrackCode);
        const reactions = (apiChannel.last_message &&
            fromApiPost(apiChannel.last_message).reactions) ||
            [];
        reactions.forEach((reaction) => {
            draft.reactionsOld.set(reaction.id, reaction);
        });
        let existing = draft.channels.get(channel.id);
        // сбрасываем existing если до этого у нас не было к нему доступа (то есть в кэше хранилась заглушка), чтобы записать актуальное значение
        if (existing?.kind === 'ChannelRestricted') {
            existing = undefined;
        }
        if (existing && !dangerouslyMerge) {
            inserted.push(existing);
            continue;
        }
        const result = existing ? Channel.merge(existing, channel) : channel;
        draft.channels.set(result.id, result);
        Organisers.refreshChannels(draft.organisers, channel);
        inserted.push(result);
    }
    return inserted;
}
export function insertMissingChannelInfo(draft, apiChannel, group, fields, featureFlags) {
    if (group.deactivated === 'banned' || group.deactivated === 'blocked') {
        return;
    }
    const info = fromApiChannel(featureFlags, apiChannel, group);
    const channel = draft.channels.get(info.id);
    if (!channel) {
        throw new Error('В кэше отсутствует канал, для которого обновляем данные');
    }
    if (channel.kind === 'ChannelRestricted') {
        return;
    }
    for (const field of fields) {
        channel[field] = info[field];
    }
    return channel;
}
export function insertManagedGroups(draft, apiManagedGroups, featureFlags, dangerouslyMerge) {
    const inserted = [];
    if (dangerouslyMerge) {
        draft.managedGroups.clear();
    }
    for (const apiManagedGroup of apiManagedGroups) {
        const managedGroup = fromApiManagedGroup(apiManagedGroup, featureFlags);
        const existing = draft.managedGroups.get(managedGroup.id);
        if (existing && !dangerouslyMerge) {
            inserted.push(existing);
            continue;
        }
        draft.managedGroups.set(managedGroup.id, managedGroup);
        inserted.push(managedGroup);
    }
    return inserted;
}
export function insertSpaces(draft, apiSpaces, { apiConvos, apiUsers, apiGroups, apiSpaceCalls, apiSpaceTribunes, }, featureFlags) {
    const result = [];
    for (const apiSpace of apiSpaces) {
        const space = fromApiSpace(apiSpace);
        const existing = draft.spaces.get(space.id);
        if (!existing) {
            draft.spaces.set(space.id, space);
            result.push(space);
            continue;
        }
        const pattern = `${existing.kind}_${space.kind}`;
        switch (pattern) {
            case 'Incomplete_Incomplete':
            case 'Space_Space':
                // Тут важно проверять строго на меньше, потому что нам нет смысла
                // заменять пространство одного и того же типа с одинаковыми версиями
                if (existing.version < space.version) {
                    draft.spaces.set(space.id, space);
                    result.push(space);
                }
                break;
            case 'Incomplete_Space':
                // А тут уже добавляем равно, поскольку пришедшее пространство "шире"
                // и нам имеет смысл его заменить
                if (existing.version <= space.version) {
                    draft.spaces.set(space.id, space);
                    result.push(space);
                }
                break;
            case 'Space_Incomplete':
                // Нам нет смысла заменять полное пространство на неполное,
                // поэтому просто пропустим этот шаг
                result.push(existing);
                break;
            default:
                exhaustivenessCheck(pattern);
        }
    }
    insertConvos(draft, apiConvos, featureFlags, {
        dangerouslyMerge: true,
    });
    insertPeers(draft, {
        apiUsers,
        apiGroups,
        apiContacts: [],
    });
    insertSpaceCalls(draft, apiSpaceCalls);
    insertSpaceTribunes(draft, apiSpaceTribunes);
    return result;
}
export function insertSpaceCalls(draft, apiSpaceCalls) {
    const inserted = [];
    for (const apiSpaceCall of apiSpaceCalls) {
        const spaceCall = fromApiSpaceCall(apiSpaceCall);
        draft.spacesCalls.set(spaceCall.id, spaceCall);
        inserted.push(spaceCall);
    }
    return inserted;
}
export function insertSpaceTribunes(draft, apiSpaceTribunes) {
    const inserted = [];
    for (const apiSpaceTribune of apiSpaceTribunes) {
        const spaceTribune = fromApiSpaceTribune(apiSpaceTribune);
        draft.spacesTribunes.set(spaceTribune.id, spaceTribune);
        inserted.push(spaceTribune);
    }
    return inserted;
}
export function insertIncognitoMembers(draft, apiIncognitoMembers) {
    for (const apiIncognitoMember of apiIncognitoMembers) {
        const incognitoMember = fromApiIncognitoMember(apiIncognitoMember);
        if (!incognitoMember) {
            continue;
        }
        const peerId = Peer.resolveId(apiIncognitoMember.peer_id);
        const convo = draft.convos.get(peerId);
        if (convo?.kind === 'ChatConvo') {
            ChatMembers.addIncognitoMembers(convo.members, [incognitoMember]);
        }
    }
}
/**
 * Выводит айдишник сообщества, которому принадлежат текущие данные.
 * Для лички выдаст 0
 */
export function getOwnerGroupId(ownerId) {
    return Peer.isGroupPeerId(ownerId) ? Peer.toRealId(ownerId) : 0;
}
export function removeConvosFromFolder(draft, folderId, convos) {
    const folder = draft.organisers.folders.find((f) => f.id === folderId);
    if (!folder) {
        return;
    }
    let unreadCounter = folder.unreadCount ?? 0;
    let unreadUnmutedCounter = folder.unreadUnmutedCount ?? 0;
    for (const convo of convos) {
        if (folder.peerIds.has(convo.peerId)) {
            folder.peerIds.delete(convo.peerId);
            if (convo.unreadCount) {
                Convo.isMuted(convo) ? unreadCounter-- : unreadUnmutedCounter--;
            }
        }
    }
    Folder.setUnreadCounters(draft.organisers.folders, folderId, unreadCounter, unreadUnmutedCounter);
}
export function addConvosToFolder(draft, folderId, convos) {
    const folder = draft.organisers.folders.find((f) => f.id === folderId);
    if (!folder) {
        return;
    }
    let unreadCounter = folder.unreadCount ?? 0;
    let unreadUnmutedCounter = folder.unreadUnmutedCount ?? 0;
    for (const convo of convos) {
        if (!folder.peerIds.has(convo.peerId)) {
            folder.peerIds.add(convo.peerId);
            if (convo.unreadCount) {
                Convo.isMuted(convo) ? unreadCounter++ : unreadUnmutedCounter++;
            }
        }
    }
    Folder.setUnreadCounters(draft.organisers.folders, folderId, unreadCounter, unreadUnmutedCounter);
}
/**
 * Возвращяет список диалогов по числовым id
 */
export function getConvosByIds(draft, ids) {
    return ids.reduce((result, id) => {
        const convo = draft.convos.get(Peer.resolveId(id));
        if (convo) {
            result.push(convo);
        }
        return result;
    }, []);
}
/**
 * Вставка новых участников беседы из апи
 */
export function insertChatMembers(chatMembers, apiChatMembers, apiIncognitoMembers = []) {
    const incognitoMembers = apiIncognitoMembers.reduce((acc, { id, name = '' }) => {
        return acc.set(id, { name });
    }, new Map());
    for (const item of apiChatMembers) {
        const resolvedPeerId = item.invited_by
            ? Peer.resolveId(item.invited_by)
            : undefined;
        // Приводим invited_by к корректному типу, исключая ChatPeerId
        const inviterPeerId = resolvedPeerId && !Peer.isChatPeerId(resolvedPeerId)
            ? resolvedPeerId
            : undefined;
        if (item.incognito_id) {
            const incognitoMember = incognitoMembers.get(item.incognito_id);
            if (!incognitoMember) {
                continue;
            }
            const incognitoMemberId = ChatMembers.resolveIncognitoMemberId(item.incognito_id);
            const incognitoChatMember = {
                ...incognitoMember,
                id: incognitoMemberId,
                inviterId: inviterPeerId,
                ...(item.join_date && { inviteDate: item.join_date * 1000 }),
            };
            if (item.member_id !== 0) {
                const memberId = Peer.resolveId(item.member_id);
                if (Peer.isUserPeerId(memberId) || Peer.isContactPeerId(memberId)) {
                    incognitoChatMember.memberId = memberId;
                }
            }
            chatMembers.incognitoMembers.set(incognitoMemberId, incognitoChatMember);
            if (item.member_id === 0) {
                continue;
            }
        }
        const peerId = Peer.resolveId(item.member_id);
        if (!Peer.isUserPeerId(peerId) &&
            !Peer.isGroupPeerId(peerId) &&
            !Peer.isContactPeerId(peerId)) {
            continue;
        }
        const member = {
            canKick: Boolean(item.can_kick),
            isMessageRequest: Boolean(item.is_message_request),
            isRestrictedToWrite: Boolean(item.is_restricted_to_write),
            inviterId: inviterPeerId,
            peerId,
        };
        if (item.is_message_request && item.request_date) {
            member.requestDate = item.request_date * 1000;
        }
        if (item.join_date) {
            member.joinDate = item.join_date * 1000;
        }
        chatMembers.members.set(peerId, member);
        chatMembers.memberIds.add(peerId);
        if (member.isMessageRequest) {
            chatMembers.invitedIds?.add(peerId);
        }
        if (Peer.isContactPeerId(peerId)) {
            continue;
        }
        if (item.is_admin) {
            chatMembers.adminIds.add(peerId);
        }
        else {
            chatMembers.adminIds.delete(peerId);
        }
    }
}
//# sourceMappingURL=State.js.map