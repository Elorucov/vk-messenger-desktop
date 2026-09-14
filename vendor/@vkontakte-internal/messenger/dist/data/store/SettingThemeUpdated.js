import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    const { type } = action;
    switch (type) {
        case 'SettingThemeUpdated': {
            const previousValue = draft.viewer.settings.theme;
            if (previousValue === action.value || draft.locks.settings.has('theme')) {
                return [];
            }
            draft.locks.settings.add('theme');
            draft.viewer.settings.theme = action.value;
            return [
                async function changeTheme(env) {
                    const { api } = env;
                    return api
                        .fetch('messages.setConfig', {
                        config: JSON.stringify({
                            theme: action.value,
                        }),
                    }, { retries: 3 })
                        .catch(() => { })
                        .then(() => {
                        return {
                            type: 'SettingThemeUpdated_RequestCompleted',
                        };
                    });
                },
            ];
        }
        case 'SettingThemeUpdated_RequestCompleted': {
            draft.locks.settings.delete('theme');
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=SettingThemeUpdated.js.map