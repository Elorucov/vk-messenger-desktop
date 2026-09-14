import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserSeenHelpHint': {
            /* скрываем оптимистично */
            const changed = draft.helpHints.delete(action.hintId);
            if (!changed) {
                return [];
            }
            return [
                async function updateHelpHint({ api }) {
                    try {
                        const response = await api.fetch('account.hideHelpHint', {
                            hint_id: action.hintId,
                        }, { retries: 1 });
                        return {
                            type: 'UserSeenHelpHint_RequestCompleted',
                            hasFailed: response !== 1,
                        };
                    }
                    catch {
                        /* не отменяем при неудаче, чтобы подсказка не вернулась сразу */
                        return {
                            type: 'UserSeenHelpHint_RequestCompleted',
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'UserSeenHelpHint_RequestCompleted': {
            return [];
        }
        default: {
            exhaustivenessCheck(action);
        }
    }
};
//# sourceMappingURL=UserSeenHelpHint.js.map