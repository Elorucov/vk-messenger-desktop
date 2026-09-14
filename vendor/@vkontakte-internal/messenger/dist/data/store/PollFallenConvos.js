import { exhaustivenessCheck } from '../../core/utils/misc';
import { CONVO_REFRESH_INTERVAL } from '../../core/config/config';
import { getOwnerGroupId, insertConvos, insertPeers } from '../store/State';
let intervalTimeout = CONVO_REFRESH_INTERVAL;
let shortPollingTimeout;
export const handler = (draft, action, featureFlags) => {
    if (!featureFlags.vkm_convos_short_polling || intervalTimeout === null) {
        return [];
    }
    switch (action.type) {
        case 'InitPollFallenConvos': {
            intervalTimeout =
                typeof featureFlags.vkm_convos_short_polling === 'number'
                    ? featureFlags.vkm_convos_short_polling * 60 * 1000
                    : CONVO_REFRESH_INTERVAL;
            const intervalTimeoutNumber = intervalTimeout;
            return [
                async function initPollFallenConvos() {
                    await new Promise((resolve) => {
                        shortPollingTimeout = window.setTimeout(() => {
                            resolve();
                        }, intervalTimeoutNumber);
                    });
                    return {
                        type: 'PollFallenConvos',
                    };
                },
            ];
        }
        case 'DisposePollFallenConvos': {
            clearTimeout(shortPollingTimeout);
            intervalTimeout = null;
            return [];
        }
        case 'PollFallenConvos': {
            const ownerId = draft.ownerId;
            const fallenConvosIds = [];
            draft.convos.forEach((convo) => {
                /**
                 * Ограничение на количество запрашиваемых "мертвых" чатов (50 элементов, ограничение для
                 * messages.getConversationsById peer_ids.length < 100 )
                 */
                if (!convo.isAlive && fallenConvosIds.length < 50) {
                    fallenConvosIds.push(convo.peerId);
                }
            });
            if (!fallenConvosIds.length) {
                return [
                    async function retryShortPollFallenConvos() {
                        return {
                            type: 'InitPollFallenConvos',
                        };
                    },
                ];
            }
            return [
                async function fetchOnlyFallenConvos({ api }) {
                    try {
                        const response = await api.fetch('messages.getConversationsById', {
                            peer_ids: fallenConvosIds.toString(),
                            group_id: getOwnerGroupId(ownerId),
                            extended: 1,
                        });
                        return {
                            type: 'PollFallenConvos_RequestSucceed',
                            apiResponse: response,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'Noop',
                        };
                    }
                },
            ];
        }
        case 'PollFallenConvos_RequestSucceed': {
            const { apiResponse } = action;
            insertConvos(draft, apiResponse.items, featureFlags);
            insertPeers(draft, {
                apiUsers: apiResponse.profiles || [],
                apiGroups: apiResponse.groups || [],
                apiContacts: apiResponse.contacts || [],
            });
            return [
                async function retryShortPollFallenConvos() {
                    return {
                        type: 'InitPollFallenConvos',
                    };
                },
            ];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=PollFallenConvos.js.map