import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    const { type } = action;
    switch (type) {
        case 'SettingExperimentalUpdated': {
            if (draft.locks.settings.has('messageSelfMentionHighlighting')) {
                return [];
            }
            draft.locks.settings.add('messageSelfMentionHighlighting');
            draft.viewer.settings.messageSelfMentionHighlighting =
                action.messageMentionHighlighting;
            return [
                async function changeExperimentalSettings(env) {
                    const { api } = env;
                    return api
                        .fetch('messages.setConfig', {
                        config: JSON.stringify({
                            message_self_mention_highlighting: action.messageMentionHighlighting,
                        }),
                    }, { retries: 3 })
                        .catch(() => { })
                        .then(() => {
                        return {
                            type: 'SettingExperimentalUpdated_RequestCompleted',
                        };
                    });
                },
            ];
        }
        case 'SettingExperimentalUpdated_RequestCompleted': {
            draft.locks.settings.delete('messageSelfMentionHighlighting');
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=SettingExperimentalUpdated.js.map