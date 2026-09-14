import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'CountersUpdate': {
            const { idleCounter } = action;
            const { unreadUnmutedCount, unreadCount } = draft.organisers.filters.all;
            const showOnlyNotMuted = draft.viewer.settings.countOnlyNotMuted;
            const countGroupDialogs = draft.viewer.settings.countGroupDialogs;
            const countChannels = draft.viewer.settings.countChannels;
            let totalUnread = unreadCount;
            let totalUnreadUnmuted = unreadUnmutedCount;
            if (countChannels) {
                const channelsFolder = draft.organisers.folders.find((f) => f.type === 'channels');
                if (channelsFolder) {
                    totalUnread += draft.organisers.channelFilters.all.unreadCount;
                    totalUnreadUnmuted +=
                        draft.organisers.channelFilters.all.unreadUnmutedCount;
                }
            }
            if (featureFlags.vkm_managed_groups_folder && countGroupDialogs) {
                const managedGroupFolder = draft.organisers.folders.find((f) => f.type === 'managed_groups');
                const groupsMessagesNotifySetting = draft.viewer.settings.groupsMessagesNotifySetting;
                const managedGroupFolderUnreadCount = managedGroupFolder?.unreadCount || 0;
                const managedGroupFolderUnreadUnmutedCount = managedGroupFolder?.unreadUnmutedCount || 0;
                totalUnread += managedGroupFolderUnreadCount;
                totalUnreadUnmuted +=
                    !featureFlags.vkm_managed_groups_mute_unmute ||
                        groupsMessagesNotifySetting
                        ? managedGroupFolderUnreadUnmutedCount
                        : 0;
            }
            return [
                async function updateCounters({ notification }) {
                    // Устанавливаем счётчик непрочитанных
                    // На vk.me сейчас не используется никак
                    // На vk.com выставляет счетчик в левом меню для пункта Мессенджер
                    notification.setCounters({
                        unread: totalUnread,
                        unreadUnmuted: totalUnreadUnmuted,
                        showOnlyNotMuted,
                        countGroupDialogs,
                    });
                    // Отправляем событие для изменения счетчика для внешних систем
                    // Могут использовать те, кто подключил наш виджет (Сферум, YClients)
                    notification.notifyListeners({
                        kind: 'counter',
                        payload: unreadUnmutedCount,
                    });
                    if (idleCounter !== undefined) {
                        // Устанавливаем счетчик непрочитанных, который копится пока окно неактивно
                        // Сбрасывается, когда пользователь возвращает фокус на окно
                        // Используется для показа счетчика в favicon
                        notification.setIdleCounter(idleCounter);
                    }
                    return { type: 'Noop' };
                },
            ];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=CountersUpdate.js.map