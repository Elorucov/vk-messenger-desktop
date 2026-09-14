import { exhaustivenessCheck } from '../../core/utils/misc';
import { fromApiMessage } from '../converter/MessageConverter';
import { getOwnerGroupId, insertConvos, insertPeers } from './State';
const MESSAGES_PER_PAGE = 20;
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'LoadImportantMessages': {
            const offset = Math.floor(draft.importantMessages.messages.size / MESSAGES_PER_PAGE) *
                MESSAGES_PER_PAGE;
            const ownerId = draft.ownerId;
            return [
                async function loadImportantMessages({ api }) {
                    try {
                        const response = await api.fetch('messages.getImportantMessages', {
                            count: MESSAGES_PER_PAGE,
                            offset,
                            extended: 1,
                            group_id: getOwnerGroupId(ownerId),
                        });
                        return {
                            type: 'LoadImportantMessages_RequestCompleted',
                            hasFailed: false,
                            response: response,
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
        case 'LoadImportantMessages_RequestCompleted': {
            const { response: { messages, profiles, groups, conversations }, } = action;
            if ((messages.items?.length || 0) < MESSAGES_PER_PAGE) {
                draft.importantMessages.hasMore = false;
            }
            insertConvos(draft, conversations || [], featureFlags);
            insertPeers(draft, {
                apiUsers: profiles || [],
                apiGroups: groups || [],
                apiContacts: [],
            });
            messages.items?.forEach((apiMessage) => {
                const { message } = fromApiMessage(featureFlags, apiMessage);
                if (message.kind === 'Normal') {
                    draft.importantMessages.messages.set(getImportantMessageKey(message.peerId, message.cmid), message);
                }
            });
            return [];
        }
        case 'UserClosedImportantMessages': {
            draft.importantMessages.messages.clear();
            draft.importantMessages.hasMore = true;
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
export const getImportantMessageKey = (peerId, cmid) => `${peerId}-${cmid}`;
//# sourceMappingURL=LoadImportantMessages.js.map