import * as Peer from '../../core/model/Peer';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { banInfoFromApi } from '../converter/GroupConverter';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'LoadGroupBannedUser': {
            const { groupId, peerId } = action;
            const { requestCompletedUICallback } = action;
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('groups.getBanned', {
                            group_id: Peer.toRealId(groupId),
                            owner_id: peerId,
                        }, { retries: 1 });
                        return {
                            type: 'LoadGroupBannedUser_RequestCompleted',
                            banInfo: response.items[0]?.ban_info
                                ? banInfoFromApi(response.items[0].ban_info)
                                : null,
                            hasFailed: !response.items[0],
                            groupId,
                            peerId,
                            requestCompletedUICallback,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'LoadGroupBannedUser_RequestCompleted',
                            hasFailed: true,
                            banInfo: null,
                            groupId,
                            peerId,
                            requestCompletedUICallback,
                        };
                    }
                },
            ];
        }
        case 'LoadGroupBannedUser_RequestCompleted': {
            const { requestCompletedUICallback, hasFailed, peerId, banInfo } = action;
            requestCompletedUICallback(hasFailed);
            if (hasFailed) {
                return [];
            }
            draft.groupBannedUsers[peerId] = banInfo;
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=LoadGroupBannedUser.js.map