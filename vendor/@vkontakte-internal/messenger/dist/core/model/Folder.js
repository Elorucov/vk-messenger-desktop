import * as History from '../model/History';
import { exhaustivenessCheck } from '../utils/misc';
export const FOLDER_NAME_LIMIT = 16;
export function resolveId(rawId) {
    return rawId;
}
// #region GETTERS
function canUseRecommended(featureFlags, envFeatureFlags) {
    /**
     * В API_GET_FOLDERS_TYPES должны быть перечислены
     * все значения из MessagesRecommendedFolderType.
     * Подробнее в комменте к ней.
     * Для этого ниже объявляем тип именно так.
     */
    const canUse = {
        business: featureFlags.vkm_business_folder,
        channels: !!envFeatureFlags.isChannelsFolderAvailable ||
            !featureFlags.vkm_disable_channels_folder,
        managed_groups: !!envFeatureFlags.isManagedGroupsFolderAvailable &&
            featureFlags.vkm_managed_groups_folder,
        personal: featureFlags.vkm_personal_folder,
        unread: featureFlags.vkm_unread_folder,
    };
    return canUse;
}
// это будет просто селектор
export function getSupportedTypes(featureFlags, envFeatureFlags) {
    const canUse = canUseRecommended(featureFlags, envFeatureFlags);
    const supportedTypes = Object.keys(canUse).filter((type) => {
        return canUse[type];
    });
    return supportedTypes.join(',');
}
export function getSublistsPeerIds(folder, sublists) {
    return sublists.reduce((acc, sublist) => {
        if (folder.sublists.has(sublist.type)) {
            acc.push(...Array.from(sublist.peerIds));
        }
        return acc;
    }, []);
}
export function canAdd(folder, featureFlags, envFeatureFlags) {
    const { type } = folder;
    const canUse = {
        ...canUseRecommended(featureFlags, envFeatureFlags),
        unknown: false,
        default: true,
    };
    return canUse[type];
}
export function isLoaded(folder, kind) {
    return folder[kind].boundaryMinorId !== Infinity;
}
export function empty() {
    return [];
}
export function getLockId(id, filter) {
    return `folder_${id}_${filter}`;
}
export function isConvoInSublist(folder, sublists, convo) {
    for (const sublist of sublists) {
        if (folder.sublists.has(sublist.type) &&
            sublist.peerIds.has(convo.peerId)) {
            return true;
        }
    }
    return false;
}
/**
 * Сортировка диалогов по убыванию с учетом правил платформы.
 */
export function sorter(aConvo, bConvo) {
    if (aConvo.isDrafted !== bConvo.isDrafted) {
        return Number(bConvo.isDrafted) - Number(aConvo.isDrafted);
    }
    const aLast = History.lastNode({
        history: aConvo.history,
        withDeleted: false,
        withPending: true,
        withFailed: false,
    })?.item;
    const bLast = History.lastNode({
        history: bConvo.history,
        withDeleted: false,
        withPending: true,
        withFailed: false,
    })?.item;
    if (aLast?.kind === 'Queued' || bLast?.kind === 'Queued') {
        return (bLast?.sentAt ?? 0) - (aLast?.sentAt ?? 0);
    }
    if (bConvo.minorSortId !== aConvo.minorSortId) {
        return bConvo.minorSortId - aConvo.minorSortId;
    }
    /**
     * Если беседы совсем идентичные по ID сортировки, то сортируем по Peer.Id чтобы чаты не прыгали при повторной
     * сортировке. Кейс валидный для нескольких чатов в которые ушло первое сообщение, и отправка зафейлилась.
     */
    return bConvo.peerId - aConvo.peerId;
}
export function isChannelFolder(folderType) {
    return folderType === 'channels';
}
export function isManagedGroupFolder(folderType) {
    return folderType === 'managed_groups';
}
export function hasChannelsFolder(folders) {
    return !!folders.findLast((folder) => folder.type === 'channels');
}
// #endregion
// #region SETTERS
/**
 * Добавляет список диалогов в конец папки
 */
export function push(folders, id, kind, convos, hasMore) {
    const folder = folders.find((f) => f.id === id);
    if (!folder) {
        return;
    }
    for (const convo of convos) {
        updateBoundaries(folder, kind, convo);
    }
    folder[kind].hasMore = hasMore;
    if (!folder[kind].hasMore) {
        folder[kind].boundaryMinorId = 1;
    }
}
export function deleteFolder(folders, folderId) {
    const index = folders.findIndex((folder) => folder.id === folderId);
    if (index === -1) {
        return;
    }
    folders.splice(index, 1);
}
export function setUnreadCounters(folders, folderId, unreadCount, unreadUnmutedCount) {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) {
        return;
    }
    folder.unreadCount = unreadCount;
    folder.unreadUnmutedCount = unreadUnmutedCount;
}
export function setManagedGroupsFolderCounter(folders, unreadCount, unreadUnmutedCount) {
    const folder = folders.find((f) => f.type === 'managed_groups');
    if (folder) {
        setUnreadCounters(folders, folder.id, unreadCount, unreadUnmutedCount);
    }
}
/**
 * Удалить после того, как раскатится на 100% новая реализация папок
 * Таска: https://jira.mvk.com/browse/ME-56596
 */
export function setHasMore(folder, kind, hasMore) {
    folder[kind].hasMore = hasMore;
}
export function setSublists(folder, sublists) {
    folder.sublists = new Set(sublists);
}
export function setName(folder, name) {
    folder.name = name;
}
export function replaceFolder(folders, newFolder) {
    const index = folders.findIndex((f) => f.id === newFolder.id);
    if (index === -1) {
        return;
    }
    folders.splice(index, 1, newFolder);
}
export function reorderFolders(folders, order) {
    folders.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}
const typeIdByName = {
    unknown: -1,
    default: 0,
    business: 1,
    channels: 2,
    unread: 3,
    personal: 4,
    managed_groups: 5,
};
const mapping = {
    hasSublist: 0,
};
export function convertFlags(flags) {
    if (typeof flags === 'number') {
        const empty = {};
        for (const name of Object.keys(mapping)) {
            empty[name] = (flags & (1 << mapping[name])) > 0;
        }
        const typeId = (flags & 0b1110) >> 1;
        let folderType = 'unknown';
        for (const name of Object.keys(typeIdByName)) {
            switch (name) {
                case 'default':
                case 'channels':
                case 'business':
                case 'unread':
                case 'personal':
                case 'managed_groups': {
                    if (typeIdByName[name] === typeId) {
                        folderType = name;
                    }
                    break;
                }
                default:
                    folderType = 'unknown';
            }
        }
        return {
            ...empty,
            type: folderType,
        };
    }
    let result = 0;
    for (const name of Object.keys(flags)) {
        switch (name) {
            case 'type':
                result |= typeIdByName[flags.type] << 1;
                break;
            default:
                if (flags[name]) {
                    result |= 1 << mapping[name];
                }
        }
    }
    return result;
}
export function updateFlags(folder, flags) {
    const flagsConverted = convertFlags(flags);
    for (const key of Object.keys(flagsConverted)) {
        switch (key) {
            case 'type':
                folder[key] = flagsConverted[key];
                break;
            case 'hasSublist':
                folder[key] = flagsConverted[key];
                break;
            default:
                exhaustivenessCheck(key);
        }
    }
}
// #endregion
function updateBoundaries(folder, kind, convo) {
    if (folder[kind].boundaryMinorId > convo.minorSortId) {
        folder[kind].boundaryMinorId = convo.minorSortId;
    }
    if (kind === 'all') {
        updateBoundaries(folder, 'unread', convo);
    }
}
//# sourceMappingURL=Folder.js.map