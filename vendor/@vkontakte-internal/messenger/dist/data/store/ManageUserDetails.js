import * as Peer from '../../core/model/Peer';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'GetUserDetails': {
            if (draft.locks.getUserDetails.has(action.userId)) {
                return [];
            }
            draft.locks.getUserDetails.add(action.userId);
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('groups.getUserDetails', {
                            group_id: Peer.toRealId(action.groupId),
                            user_id: action.userId,
                        }, { retries: 1 });
                        return {
                            type: 'GetUserDetails_RequestCompleted',
                            userDetails: response,
                            hasFailed: !response,
                            userId: action.userId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'GetUserDetails_RequestCompleted',
                            userDetails: {},
                            hasFailed: true,
                            userId: action.userId,
                        };
                    }
                },
            ];
        }
        case 'GetUserDetails_RequestCompleted': {
            draft.locks.getUserDetails.delete(action.userId);
            if (action.hasFailed) {
                return [];
            }
            const answerLockedAdminId = action.userDetails?.answer_locked_by_user_id !== undefined
                ? Peer.resolveRealId('User', action.userDetails?.answer_locked_by_user_id)
                : undefined;
            draft.userDetails = {
                ...draft.userDetails,
                [action.userId]: {
                    ...action.userDetails,
                    answer_locked_by_user_id: answerLockedAdminId,
                },
            };
            return [];
        }
        case 'SetUserNote': {
            const { requestCompletedUICallback } = action;
            if (draft.locks.setUserNote.has(action.userId)) {
                return [];
            }
            draft.locks.setUserNote.add(action.userId);
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('groups.setUserNote', {
                            group_id: Peer.toRealId(action.groupId),
                            user_id: action.userId,
                            note: action.note,
                        }, { retries: 1 });
                        return {
                            type: 'SetUserNote_RequestCompleted',
                            note: action.note,
                            hasFailed: !response,
                            userId: action.userId,
                            requestCompletedUICallback,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'SetUserNote_RequestCompleted',
                            hasFailed: true,
                            userId: action.userId,
                            note: '',
                            requestCompletedUICallback,
                        };
                    }
                },
            ];
        }
        case 'SetUserNote_RequestCompleted': {
            draft.locks.setUserNote.delete(action.userId);
            const { requestCompletedUICallback, hasFailed } = action;
            requestCompletedUICallback(hasFailed);
            if (action.hasFailed || !action.userId) {
                return [];
            }
            draft.userDetails = {
                ...draft.userDetails,
                [action.userId]: {
                    ...draft.userDetails[action.userId],
                    note: action.note,
                },
            };
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=ManageUserDetails.js.map