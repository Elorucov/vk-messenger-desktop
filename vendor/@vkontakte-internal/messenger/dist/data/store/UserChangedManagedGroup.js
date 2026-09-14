import { exhaustivenessCheck } from '../../core/utils/misc';
import * as ManagedGroup from '../../core/model/ManagedGroup';
const userActionLockKeysMap = {
    mute: 'mute',
    unmute: 'mute',
};
const userUndoActions = {
    mute: 'unmute',
    unmute: 'mute',
};
export const handler = (draft, action) => {
    const { type } = action;
    switch (type) {
        case 'UserChangedManagedGroup': {
            const { groupId, userAction } = action;
            const lockKey = getUserActionLockKey(action.userAction, groupId);
            if (draft.locks.managedGroupActions.has(lockKey)) {
                return [];
            }
            draft.locks.managedGroupActions.add(lockKey);
            const managedGroup = draft.managedGroups.get(groupId);
            if (!managedGroup) {
                return [];
            }
            const managedGroupIsMuted = managedGroup.isMuted;
            const groupsMessagesNotifySetting = draft.viewer.settings.groupsMessagesNotifySetting;
            switch (userAction) {
                case 'mute': {
                    ManagedGroup.setMuted(draft.managedGroups, managedGroup.id, true);
                    break;
                }
                case 'unmute': {
                    if (!groupsMessagesNotifySetting) {
                        draft.viewer.settings.groupsMessagesNotifySetting = true;
                    }
                    ManagedGroup.setMuted(draft.managedGroups, managedGroup.id, false);
                    break;
                }
                default:
                    exhaustivenessCheck(userAction);
            }
            return [
                async function applyAction({ api }) {
                    try {
                        switch (userAction) {
                            case 'mute': {
                                await api.fetch('settingsGeneral.setNotifySettings', {
                                    key: `ng_${groupId}`,
                                    value: 'false',
                                });
                                break;
                            }
                            case 'unmute': {
                                await api.fetchMany([
                                    !groupsMessagesNotifySetting && {
                                        method: 'settingsGeneral.setNotifySettings',
                                        params: {
                                            key: `ns_notify_group_messages`,
                                            value: 'true',
                                        },
                                    },
                                    managedGroupIsMuted && {
                                        method: 'settingsGeneral.setNotifySettings',
                                        params: {
                                            key: `ng_${groupId}`,
                                            value: 'true',
                                        },
                                    },
                                ], { retries: 3 });
                                break;
                            }
                            default:
                                exhaustivenessCheck(userAction);
                        }
                        return {
                            type: 'UserChangedManagedGroup_RequestCompleted',
                            groupId,
                            hasFailed: false,
                            userAction,
                            prevGroupsMessagesNotifySetting: groupsMessagesNotifySetting,
                        };
                        /**
                         * Обрабатываем только CATCH, тк метод settingsGeneral.setNotifySettings всегда возвращает положительный ответ
                         */
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedManagedGroup_RequestCompleted',
                            groupId,
                            hasFailed: true,
                            userAction,
                            prevGroupsMessagesNotifySetting: groupsMessagesNotifySetting,
                        };
                    }
                },
            ];
        }
        case 'UserChangedManagedGroup_RequestCompleted': {
            const { groupId, userAction, hasFailed, prevGroupsMessagesNotifySetting, } = action;
            const lockKey = getUserActionLockKey(userAction, groupId);
            const undoAction = userUndoActions[userAction];
            if (hasFailed && undoAction) {
                switch (undoAction) {
                    case 'mute':
                        draft.viewer.settings.groupsMessagesNotifySetting =
                            prevGroupsMessagesNotifySetting;
                        ManagedGroup.setMuted(draft.managedGroups, groupId, true);
                        break;
                    case 'unmute':
                        ManagedGroup.setMuted(draft.managedGroups, groupId, false);
                        break;
                    default:
                        break;
                }
            }
            draft.locks.managedGroupActions.delete(lockKey);
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
const getUserActionLockKey = (userAction, groupId) => `${userActionLockKeysMap[userAction]}-${groupId.toString()}`;
//# sourceMappingURL=UserChangedManagedGroup.js.map