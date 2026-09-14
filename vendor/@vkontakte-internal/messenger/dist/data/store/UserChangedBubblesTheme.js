import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Viewer from '../../core/model/Viewer';
export const handler = (draft, action, featureFlags) => {
    const { type } = action;
    switch (type) {
        case 'UserChangedBubblesTheme': {
            if (draft.locks.settings.has('bubblesTheme')) {
                return [];
            }
            draft.locks.settings.add('bubblesTheme');
            draft.viewer.settings.bubblesTheme = action.value;
            const isWithoutBubbles = Viewer.isWithoutBubbles(draft.viewer, featureFlags);
            return [
                async function changeBubblesTheme({ api, stats }) {
                    return api
                        .fetch('messages.setConfig', {
                        config: JSON.stringify({
                            bubble_theme: action.value === 'enabled' ? 1 : 0,
                            theme_style: action.value === 'enabled'
                                ? action.themeStyleId
                                : undefined,
                        }),
                    }, { retries: 3 })
                        .catch(() => { })
                        .then((result) => {
                        const isRequestSuccessful = result?.version !== undefined;
                        if (!isRequestSuccessful) {
                            return {
                                type: 'Noop',
                            };
                        }
                        stats.logEvent({
                            type: 'type_action',
                            type_action: {
                                type: 'type_messaging_action_item',
                                type_messaging_action_item: {
                                    action_type: 'CHANGE_APPEARANCE',
                                    label: isWithoutBubbles ? 'CLASSIC' : 'BUBBLE',
                                },
                            },
                        });
                        return {
                            type: 'UserChangedBubblesTheme_RequestCompleted',
                        };
                    });
                },
            ];
        }
        case 'UserChangedBubblesTheme_RequestCompleted': {
            draft.locks.settings.delete('bubblesTheme');
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=UserChangedBubblesTheme.js.map