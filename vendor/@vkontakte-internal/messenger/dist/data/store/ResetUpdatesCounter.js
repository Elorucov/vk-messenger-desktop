import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Filters from '../../core/model/Filters';
import { getOwnerGroupId } from './State';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'ResetUpdatesCounter': {
            const ownerId = draft.ownerId;
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('messages.resetUpdatesCounter', {
                            group_id: getOwnerGroupId(ownerId),
                        });
                        return {
                            type: 'ResetUpdatesCounter_RequestCompleted',
                            hasFailed: !response,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'ResetUpdatesCounter_RequestCompleted',
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'ResetUpdatesCounter_RequestCompleted': {
            const { hasFailed } = action;
            if (hasFailed) {
                return [];
            }
            Filters.updateCounters(draft.organisers.filters, {
                headerNotMutedUnread: 0,
            });
            return [
                async function updateTitle({ notification }) {
                    notification.setIdleCounter(0);
                    return { type: 'Noop' };
                },
            ];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=ResetUpdatesCounter.js.map