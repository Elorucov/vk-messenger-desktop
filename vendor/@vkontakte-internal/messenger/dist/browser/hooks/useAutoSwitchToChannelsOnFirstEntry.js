import { useEffect } from 'react';
import { useRouter } from '../ui/Router/Router';
import { useBrowserEnv, useFeatureFlags } from '../hooks/misc';
/**
 * Автопереход в папку "Каналы" при заходе в мессенджер
 */
export function useAutoSwitchToChannelsOnFirstEntry(selectedOrganiser, organisers, setSelectedOrganiser, convoOrganiserToggles) {
    const { screenRoute } = useRouter();
    const { stats } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const hasChannelsFolder = convoOrganiserToggles.some((item) => {
        return (item.organiser.kind === 'folders' && item.organiser.type === 'channels');
    });
    useEffect(() => {
        if (!hasChannelsFolder) {
            return;
        }
        const forcedLabel = resolveForcedChannelsLabel({
            featureFlags,
            screenRoute,
            selectedOrganiser,
            organisers,
        });
        if (!forcedLabel) {
            return;
        }
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'open_folder',
                    label: forcedLabel,
                },
            },
        });
        setSelectedOrganiser({
            kind: 'channelFilters',
            filter: 'all',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
/**
 * Возвращает label для экшена open_folder, если нужно переключиться в таб "Каналы"
 */
function resolveForcedChannelsLabel({ featureFlags, screenRoute, selectedOrganiser, organisers, }) {
    const isForcedAnyEnabled = featureFlags.vkm_ch_folder_forced_any;
    const isForcedUnmutedEnabled = featureFlags.vkm_ch_folder_forced_unmuted;
    if (!isForcedAnyEnabled && !isForcedUnmutedEnabled) {
        return null;
    }
    if (screenRoute.kind !== 'MainRoute') {
        return null;
    }
    // Автопереключение происходит если выбрана только папка "Все"
    if (selectedOrganiser.item.kind !== 'filters' ||
        selectedOrganiser.item.filter !== 'all') {
        return null;
    }
    // И в папке "Все" должно быть 0 непрочитанных
    const unreadInAllFolder = organisers.filters.all.unreadCount ?? 0;
    if (unreadInAllFolder > 0) {
        return null;
    }
    const channelStats = organisers.channelFilters.all;
    if (!channelStats) {
        return null;
    }
    const unreadChannelsTotal = channelStats.unreadCount ?? 0;
    const unreadChannelsUnmuted = channelStats.unreadUnmutedCount ?? 0;
    const hasAnyUnread = unreadChannelsTotal > 0;
    const hasUnmutedUnread = unreadChannelsUnmuted > 0;
    // B: любой непрочитанный в каналах
    if (isForcedAnyEnabled && hasAnyUnread) {
        return 'channels_forced_any';
    }
    // C: хотя бы один размьюченный
    if (isForcedUnmutedEnabled && hasUnmutedUnread) {
        return 'channels_forced_unmuted';
    }
    return null;
}
//# sourceMappingURL=useAutoSwitchToChannelsOnFirstEntry.js.map