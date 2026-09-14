import * as ManagedGroup from '../../core/model/ManagedGroup';
export function fromApiManagedGroup(managedGroup, featureFlags) {
    return {
        name: managedGroup.name || '',
        activity: managedGroup.activity || '',
        type: managedGroup.type || 'group',
        id: ManagedGroup.resolveId(managedGroup.id),
        photo: {
            baseUrl: managedGroup.photo_base,
            photo50: managedGroup.photo_50,
            photo100: managedGroup.photo_100,
            photo200: managedGroup.photo_200,
        },
        canManageBy2FA: managedGroup.disallow_manage_reason
            ? managedGroup.disallow_manage_reason !== 1
            : true,
        isMuted: featureFlags.vkm_managed_groups_mute_unmute
            ? managedGroup.msg_notifications_allowed !== 1
            : false,
        unreadCount: managedGroup.unread_count || 0,
    };
}
//# sourceMappingURL=ManagedGroupConverter.js.map