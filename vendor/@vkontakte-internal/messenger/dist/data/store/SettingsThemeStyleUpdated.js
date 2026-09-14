import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'SettingsThemeStyleUpdated': {
            const { themeStyleId } = action;
            const prevValue = draft.viewer.settings.themeStyleId;
            if (prevValue === themeStyleId ||
                draft.locks.settings.has('themeStyleId')) {
                return [];
            }
            draft.locks.settings.add('themeStyleId');
            draft.viewer.settings.themeStyleId = themeStyleId;
            return [
                async function changeThemeStyleId({ api }) {
                    return api
                        .fetch('messages.setConfig', {
                        config: JSON.stringify({ theme_style: themeStyleId }),
                    }, { retries: 3 })
                        .catch(() => { })
                        .then((result) => {
                        const isRequestSuccessful = result?.version !== undefined;
                        return {
                            type: 'SettingsThemeStyleUpdated_RequestCompleted',
                            previousThemeStyleId: !isRequestSuccessful
                                ? prevValue
                                : undefined,
                        };
                    });
                },
            ];
        }
        case 'SettingsThemeStyleUpdated_RequestCompleted': {
            const { prevThemeStyleId } = action;
            draft.locks.settings.delete('themeStyleId');
            if (prevThemeStyleId) {
                draft.viewer.settings.themeStyleId = prevThemeStyleId;
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=SettingsThemeStyleUpdated.js.map