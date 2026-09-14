import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserProfileInfo_Update': {
            const { user, profileInfo, accounts } = action;
            if (profileInfo) {
                draft.viewer.profileInfo = profileInfo;
            }
            if (user) {
                draft.peers.set(user.id, user);
            }
            if (accounts) {
                draft.viewer.accounts = accounts;
            }
            return [];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=UserProfileInfo.js.map