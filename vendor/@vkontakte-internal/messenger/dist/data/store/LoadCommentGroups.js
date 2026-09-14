import { exhaustivenessCheck } from '../../core/utils/misc';
import { insertPeers } from '../store/State';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'LoadCommentGroups': {
            if (draft.locks.loadCommentGroups) {
                return [];
            }
            draft.locks.loadCommentGroups = true;
            return [
                async function loadCommentGroups({ api }) {
                    try {
                        const response = await api.fetch('account.getCommentGroups', {}, {
                            retries: 3,
                        });
                        return {
                            type: 'LoadCommentGroups_RequestComplete',
                            response,
                        };
                    }
                    catch {
                        return {
                            type: 'LoadCommentGroups_RequestComplete',
                        };
                    }
                },
            ];
        }
        case 'LoadCommentGroups_RequestComplete': {
            const { response } = action;
            draft.locks.loadCommentGroups = false;
            if (!response) {
                return [];
            }
            const { insertedGroups } = insertPeers(draft, {
                apiUsers: [],
                apiGroups: response.items,
                apiContacts: [],
            });
            draft.commentGroups = {
                ids: insertedGroups.reduce((acc, group) => {
                    acc.add(group.id);
                    return acc;
                }, new Set()),
                isReady: true,
            };
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=LoadCommentGroups.js.map