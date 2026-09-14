import { getOwnerGroupId, insertConvos, insertPeers } from '../store/State';
import { CONVOS_PER_PAGE } from '../../core/config/config';
import * as Filters from '../../core/model/Filters';
import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Folder from '../../core/model/Folder';
import * as Tag from '../../core/model/Tag';
import { updateRemindAnswerStorageOnConvoLoad } from '../env/RemindAnswerManager';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'MoreConvosNeeded': {
            const { organiser } = action;
            const ownerId = draft.ownerId;
            let requestParams;
            let lockId = '';
            switch (organiser.kind) {
                case 'filters': {
                    const { filter } = organiser;
                    lockId = Filters.getLockId(filter);
                    if (draft.locks.getConversations[lockId] ||
                        !draft.organisers.filters[filter].hasMore) {
                        return [];
                    }
                    requestParams = {
                        start_from_minor_sort_id: draft.organisers.filters[filter].boundaries.convos?.minorSortId,
                        filter: Filters.snakeCaseId(filter),
                        extended: 1,
                        group_id: getOwnerGroupId(ownerId),
                    };
                    break;
                }
                case 'folders': {
                    const { id, filter } = organiser;
                    lockId = Folder.getLockId(id, filter);
                    const folder = draft.organisers.folders.find((folder) => folder.id === id);
                    // Такого быть не должно
                    if (!folder) {
                        throw new Error('Не найдена папка');
                    }
                    if (draft.locks.getConversations[lockId] ||
                        (Folder.isLoaded(folder, filter) && !folder[filter].hasMore)) {
                        return [];
                    }
                    requestParams = {
                        start_from_minor_sort_id: Folder.isLoaded(folder, filter)
                            ? folder[filter].boundaryMinorId
                            : undefined,
                        folder_id: folder.id,
                        filter: filter,
                        extended: 1,
                        group_id: getOwnerGroupId(ownerId),
                    };
                    break;
                }
                case 'tags': {
                    const { mask } = organiser;
                    lockId = Tag.getLockId(mask);
                    const tags = Tag.getSelectedTags(draft.organisers.tags.items, mask);
                    // Такого быть не должно
                    if (!tags.length) {
                        throw new Error('Не найдены метки');
                    }
                    if (draft.locks.getConversations[lockId] ||
                        (Tag.isLoaded(draft.organisers.tags, mask) &&
                            !Tag.hasMore(draft.organisers.tags, mask))) {
                        return [];
                    }
                    requestParams = {
                        extended: 1,
                        filter: 'all',
                        group_id: getOwnerGroupId(ownerId),
                        start_from_minor_sort_id: Tag.isLoaded(draft.organisers.tags, mask)
                            ? Tag.getBoundaryMinorId(draft.organisers.tags, mask)
                            : undefined,
                        tags: tags.map((tag) => tag.id).join(','),
                    };
                    break;
                }
                default:
                    exhaustivenessCheck(organiser);
            }
            draft.locks.getConversations[lockId] = true;
            return [
                async function loadMoreConvos({ api }) {
                    try {
                        // Такого быть не может
                        if (!requestParams) {
                            throw new Error('Нет параметров запроса');
                        }
                        const count = CONVOS_PER_PAGE;
                        const response = await api.fetch('messages.getConversations', { ...requestParams, count }, { retries: Infinity });
                        return {
                            ...action,
                            type: 'MoreConvosNeeded_RequestCompleted',
                            hasFailed: false,
                            requestedCount: count,
                            hasMore: response.items.length >= count,
                            response,
                        };
                    }
                    catch (err) {
                        return {
                            ...action,
                            type: 'MoreConvosNeeded_RequestCompleted',
                            hasMore: false,
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'MoreConvosNeeded_RequestCompleted': {
            const { hasFailed, organiser, hasMore } = action;
            let lockId = '';
            switch (organiser.kind) {
                case 'filters': {
                    lockId = Filters.getLockId(organiser.filter);
                    break;
                }
                case 'folders': {
                    lockId = Folder.getLockId(organiser.id, organiser.filter);
                    break;
                }
                case 'tags': {
                    lockId = Tag.getLockId(organiser.mask);
                    break;
                }
                default:
                    exhaustivenessCheck(organiser);
            }
            draft.locks.getConversations[lockId] = false;
            if (hasFailed) {
                return [];
            }
            const { response } = action;
            if (!response) {
                return [];
            }
            const convos = insertConvos(draft, response.items, featureFlags, {
                dangerouslyMerge: true,
            });
            insertPeers(draft, {
                apiUsers: response.profiles || [],
                apiGroups: response.groups || [],
                apiContacts: response.contacts || [],
            });
            switch (organiser.kind) {
                case 'filters':
                    Filters.push(draft.organisers.filters, organiser.filter, convos, hasMore, featureFlags);
                    break;
                case 'folders':
                    const folder = draft.organisers.folders.find((folder) => folder.id === organiser.id);
                    // Такого быть не должно
                    if (!folder) {
                        return [];
                    }
                    Folder.push(draft.organisers.folders, organiser.id, organiser.filter, convos, hasMore);
                    break;
                case 'tags': {
                    const { mask } = organiser;
                    const tags = Tag.getSelectedTags(draft.organisers.tags.items, mask);
                    // Такого быть не должно
                    if (!tags.length) {
                        return [];
                    }
                    Tag.push(draft.organisers.tags, mask, convos, hasMore);
                    break;
                }
                default:
                    exhaustivenessCheck(organiser);
            }
            const allFilterPeerIds = organiser.kind === 'filters' && organiser.filter === 'all'
                ? convos.map((convo) => convo.peerId)
                : undefined;
            return [
                allFilterPeerIds &&
                    async function addConvosToSearchIndex() {
                        return {
                            type: 'AddConvosToSearchIndex',
                            peerIds: allFilterPeerIds,
                        };
                    },
                async function updateStoredRemindAnswerToMessage({ storage }) {
                    if (convos) {
                        const peersToCheck = new Map(convos.map((convo) => [convo.peerId, convo.inReadBy]));
                        updateRemindAnswerStorageOnConvoLoad(storage, peersToCheck);
                    }
                    return { type: 'Noop' };
                },
            ];
        }
        case 'AddConvosToSearchIndex': {
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=MoreConvosNeeded.js.map