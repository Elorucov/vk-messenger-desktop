import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Peer from '../../core/model/Peer';
import * as Queue from '../../core/model/Queue';
import * as Folder from '../../core/model/Folder';
import * as ManagedGroup from '../../core/model/ManagedGroup';
import { getOwnerGroupId, insertManagedGroups } from './State';
export const handler = (draft, action, featureFlags) => {
    const ownerId = draft.ownerId;
    switch (action.type) {
        case 'QueueBatchReceived__ManagedGroupsInfo': {
            const { viewerId, queueConfig, apiManagedGroups, groupsFolderCounters, groupsMessagesNotifySettings, } = action;
            insertManagedGroups(draft, apiManagedGroups, featureFlags, true);
            if (featureFlags.vkm_managed_groups_mute_unmute) {
                const groupsMessagesNotifySettingIsChecked = groupsMessagesNotifySettings?.sections?.find((s) => s.id === 'notify_group_messages')?.params?.[0]?.is_checked;
                draft.viewer.settings.groupsMessagesNotifySetting =
                    groupsMessagesNotifySettingIsChecked === undefined
                        ? true
                        : groupsMessagesNotifySettingIsChecked;
                Folder.setManagedGroupsFolderCounter(draft.organisers.folders, groupsFolderCounters?.dialogs_count || 0, groupsFolderCounters?.dialogs_count_unmuted || 0);
            }
            else {
                const totalManagedGroupsFolderUnreadCount = ManagedGroup.getUnreadTotalCount(draft.managedGroups);
                Folder.setManagedGroupsFolderCounter(draft.organisers.folders, totalManagedGroupsFolderUnreadCount, totalManagedGroupsFolderUnreadCount);
            }
            const queues = Array.from(draft.activeQueueIds);
            return [
                async function pollQueue({ queue }) {
                    queue.connect({
                        user_id: Peer.toRealId(viewerId),
                        ...queueConfig,
                        queueIds: queues,
                    });
                    try {
                        return {
                            type: 'QueueBatchReceived',
                            next: await queue.poll(),
                        };
                    }
                    catch {
                        return {
                            type: 'Noop',
                        };
                    }
                },
                async function updateCounters() {
                    return { type: 'CountersUpdate' };
                },
            ];
        }
        case 'QueueBatchReceived': {
            const { next } = action;
            if (next.kind === 'Reconnecting') {
                return [
                    async function pollQueue({ queue }) {
                        try {
                            return {
                                type: 'QueueBatchReceived',
                                next: await queue.poll(),
                            };
                        }
                        catch {
                            return {
                                type: 'Noop',
                            };
                        }
                    },
                ];
            }
            if (next.kind === 'Disconnected') {
                if (next.reason === 'manual') {
                    return [];
                }
                const viewerId = draft.viewer.id;
                const queues = Array.from(draft.activeQueueIds);
                const queueIds = queues.map((q) => `${q}_${viewerId}`).join(',');
                const hasManagedGroupsCountersQueue = draft.activeQueueIds.has(Queue.MANAGED_GROUPS_COUNTERS_QUEUE);
                if (hasManagedGroupsCountersQueue) {
                    return [
                        async function fetchManagedGroupsInfoAndQueueConfig({ api }) {
                            try {
                                const [queueConfig, managedGroupsResponse, groupsFolderCountersResponse, groupsMessagesNotifySettings,] = await api.fetchMany([
                                    {
                                        method: 'queue.subscribe',
                                        params: { queue_ids: queueIds },
                                    },
                                    {
                                        method: 'groups.get',
                                        params: {
                                            filter: 'admin,editor,with_messages',
                                            extended: 1,
                                        },
                                    },
                                    {
                                        method: 'messages.getCounters',
                                        params: {
                                            filter: 'groups_folder',
                                            group_id: getOwnerGroupId(ownerId),
                                        },
                                    },
                                    featureFlags.vkm_managed_groups_mute_unmute && {
                                        method: 'settingsGeneral.getNotifySettings',
                                        params: {
                                            page: 'group_messages',
                                            sections: 'notify_group_messages',
                                        },
                                    },
                                ], { retries: Infinity });
                                return {
                                    type: 'QueueBatchReceived__ManagedGroupsInfo',
                                    apiManagedGroups: managedGroupsResponse.items || [],
                                    groupsMessagesNotifySettings,
                                    groupsFolderCounters: groupsFolderCountersResponse?.groups_folder,
                                    viewerId,
                                    queueConfig,
                                };
                            }
                            catch (e) {
                                return {
                                    type: 'Noop',
                                };
                            }
                        },
                    ];
                }
                return [
                    async function pollQueue({ queue, api }) {
                        const queueConfig = await api.fetch('queue.subscribe', {
                            queue_ids: queueIds,
                        }, { retries: Infinity });
                        queue.connect({
                            user_id: Peer.toRealId(viewerId),
                            ...queueConfig,
                            queueIds: queues,
                        });
                        try {
                            return {
                                type: 'QueueBatchReceived',
                                next: await queue.poll(),
                            };
                        }
                        catch {
                            return {
                                type: 'Noop',
                            };
                        }
                    },
                ];
            }
            let needUpdateNotificationCounters = false;
            let shouldNotifySound = false;
            const soundNotifications = draft.viewer.settings.soundNotifications;
            for (const event of next.events) {
                switch (event.entity_type) {
                    case 'online':
                        const userId = Peer.resolveId(event.data.user_id);
                        if (!Peer.isUserPeerId(userId)) {
                            break;
                        }
                        draft.lastSeens.set(userId, {
                            isOnline: !!event.data.online,
                            at: event.data.last_seen * 1000,
                        });
                        break;
                    case 'accountcounters':
                        switch (event.data.type) {
                            case 'calls': {
                                draft.activeCallsCount = event.data.count;
                                break;
                            }
                            default:
                                const _typeguard = event.data.type;
                                break;
                        }
                        break;
                    case 'groupfoldercounter':
                        if (!featureFlags.vkm_managed_groups_mute_unmute) {
                            break;
                        }
                        const folderType = draft.organisers.folders.find((f) => f.id === event.data.folder_id)?.type;
                        if (folderType === 'managed_groups') {
                            needUpdateNotificationCounters = true;
                            Folder.setManagedGroupsFolderCounter(draft.organisers.folders, event.data.dialogs_count || 0, event.data.dialogs_count_unmuted || 0);
                        }
                        break;
                    case 'groupmessagecounter':
                        needUpdateNotificationCounters = true;
                        const id = ManagedGroup.resolveId(event.data.group_id);
                        const currentManagedGroup = ManagedGroup.getManagedGroupById(draft.managedGroups, id);
                        // Такого кейса не должго быть
                        if (!currentManagedGroup) {
                            break;
                        }
                        shouldNotifySound =
                            featureFlags.vkm_managed_groups_mute_unmute &&
                                soundNotifications &&
                                !currentManagedGroup.isMuted &&
                                event.data.unread_count > currentManagedGroup.unreadCount;
                        ManagedGroup.setUnreadCount(draft.managedGroups, id, event.data.unread_count);
                        if (!featureFlags.vkm_managed_groups_mute_unmute) {
                            const totalManagedGroupsFolderUnreadCount = ManagedGroup.getUnreadTotalCount(draft.managedGroups);
                            Folder.setManagedGroupsFolderCounter(draft.organisers.folders, totalManagedGroupsFolderUnreadCount, totalManagedGroupsFolderUnreadCount);
                        }
                        break;
                    case 'groupcounterssettings':
                        needUpdateNotificationCounters = true;
                        draft.viewer.settings.countGroupDialogs =
                            event.data.include_group_dialogs;
                        break;
                    case 'groupnotificationsetting':
                        if (!featureFlags.vkm_managed_groups_mute_unmute) {
                            break;
                        }
                        needUpdateNotificationCounters = true;
                        const { group_id, is_muted } = event.data;
                        ManagedGroup.setMuted(draft.managedGroups, ManagedGroup.resolveId(group_id), is_muted);
                        break;
                    case 'groupsmessagespushes':
                        if (!featureFlags.vkm_managed_groups_mute_unmute) {
                            break;
                        }
                        needUpdateNotificationCounters = true;
                        draft.viewer.settings.groupsMessagesNotifySetting =
                            event.data.enabled;
                        break;
                    default:
                        /**
                         * Ничего не делаем, просто игнорируем апдейты, которых не знаем.
                         * При этом добавляем тайпгарды, чтобы быть уверенными, что мы точно обработали все,
                         * что знаем.
                         */
                        const _typeguard = event;
                        break;
                }
            }
            return [
                async function pollQueue({ queue }) {
                    try {
                        return {
                            type: 'QueueBatchReceived',
                            next: await queue.poll(),
                        };
                    }
                    catch {
                        return {
                            type: 'Noop',
                        };
                    }
                },
                async function updateCounters() {
                    if (needUpdateNotificationCounters) {
                        return { type: 'CountersUpdate' };
                    }
                    return { type: 'Noop' };
                },
                async function playNotificationSound({ notification }) {
                    if (shouldNotifySound) {
                        notification.playSound();
                    }
                    return { type: 'Noop' };
                },
            ];
        }
        case 'CountersUpdate': {
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=QueueBatchReceived.js.map