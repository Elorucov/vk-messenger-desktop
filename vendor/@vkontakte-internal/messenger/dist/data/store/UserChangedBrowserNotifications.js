import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    const { type } = action;
    switch (type) {
        case 'UserChangedBrowserNotifications': {
            draft.locks.settings.add('browserNotifications');
            draft.viewer.settings.browserNotifications = action.value;
            return [
                async function changeTheme(env) {
                    env.storage.set('settings-browser-notifications-on', action.value);
                    return {
                        type: 'UserChangedBrowserNotifications_RequestCompleted',
                    };
                },
            ];
        }
        case 'UserChangedBrowserNotifications_RequestCompleted': {
            draft.locks.settings.delete('browserNotifications');
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=UserChangedBrowserNotifications.js.map