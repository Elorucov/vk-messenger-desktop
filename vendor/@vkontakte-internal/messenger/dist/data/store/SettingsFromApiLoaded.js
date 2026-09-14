import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    const { type } = action;
    switch (type) {
        case 'SettingsFromApiLoaded': {
            if (Object.keys(action.value).length === 0) {
                return [];
            }
            return [
                async function saveSettings(env) {
                    return env.api
                        .fetch('messages.setConfig', {
                        config: JSON.stringify(action.value),
                    })
                        .catch(() => { })
                        .then(() => {
                        return {
                            type: 'SettingsFromApiLoaded_RequestCompleted',
                        };
                    });
                },
            ];
        }
        case 'SettingsFromApiLoaded_RequestCompleted': {
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=SettingsFromApiLoaded.js.map