import { insertPeers } from '../store/State';
import { CONVOS_PER_PAGE } from '../../core/config/config';
import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Convo from '../../core/model/Convo';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'MorePrecreatedConvosNeeded': {
            if (draft.locks.getPrecreatedConversations) {
                return [];
            }
            draft.locks.getPrecreatedConversations = true;
            const ids = [...draft.precreatedConvos.peerIds];
            const startAfter = ids[ids.length - 1];
            return [
                async function loadMorePrecreatedConvos({ api }) {
                    try {
                        const response = await api.fetch('messages.getPrecreatedConversations', {
                            start_after: startAfter,
                            count: CONVOS_PER_PAGE,
                            extended: 1,
                        });
                        return {
                            ...action,
                            type: 'MorePrecreatedConvosNeeded_RequestCompleted',
                            hasFailed: false,
                            hasMore: true,
                            response,
                        };
                    }
                    catch (err) {
                        return {
                            ...action,
                            type: 'MorePrecreatedConvosNeeded_RequestCompleted',
                            hasMore: false,
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'MorePrecreatedConvosNeeded_RequestCompleted': {
            const { hasFailed } = action;
            draft.locks.getPrecreatedConversations = false;
            if (hasFailed || !action.response) {
                return [];
            }
            const { profiles, items, contacts } = action.response;
            insertPeers(draft, {
                apiUsers: profiles ?? [],
                apiGroups: [],
                apiContacts: contacts ?? [],
            });
            items.forEach((rawPeerId) => {
                const peerId = Convo.resolvePrecreatedConvoId(rawPeerId);
                draft.precreatedConvos.peerIds.add(peerId);
            });
            draft.precreatedConvos.hasMore = items.length >= CONVOS_PER_PAGE;
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=MorePrecreatedConvosNeeded.js.map