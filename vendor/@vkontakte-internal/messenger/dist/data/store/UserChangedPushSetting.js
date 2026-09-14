import { exhaustivenessCheck } from '../../core/utils/misc';
import { current } from 'immer';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserChangedPushSetting': {
            const { setting, value } = action;
            draft.viewer.settings.push[setting] = value;
            const push = current(draft.viewer.settings.push);
            return [
                async function updatePush({ storage }) {
                    storage.set('settings-push', push);
                    return {
                        type: 'UserChangedPushSetting_RequestCompleted',
                        hasFailed: false,
                        setting,
                        value,
                    };
                },
            ];
        }
        case 'UserChangedPushSetting_RequestCompleted': {
            if (action.hasFailed) {
                return [];
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserChangedPushSetting.js.map