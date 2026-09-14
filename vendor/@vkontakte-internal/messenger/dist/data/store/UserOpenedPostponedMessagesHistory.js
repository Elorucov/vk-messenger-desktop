import * as Convo from '../../core/model/Convo';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { fromApiPostponedMessage } from '../converter/MessageConverter';
import { getOwnerGroupId } from '../store/State';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserOpenedPostponedMessagesHistory': {
            const { peerId } = action;
            const groupId = getOwnerGroupId(draft.ownerId);
            const convo = draft.convos.get(peerId);
            if (convo?.postponed.loaded) {
                return [];
            }
            return [
                async function loadPostponedHistory({ api }) {
                    try {
                        const response = await api.fetch('messages.getPostponed', {
                            peer_id: peerId,
                            group_id: groupId,
                        });
                        return {
                            type: 'UserOpenedPostponedMessagesHistory_RequestCompleted',
                            peerId,
                            response,
                        };
                    }
                    catch (error) {
                        return {
                            type: 'UserOpenedPostponedMessagesHistory_RequestFailed',
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'UserOpenedPostponedMessagesHistory_RequestCompleted': {
            const { response, peerId } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const messages = response.items.map((apiMessage) => fromApiPostponedMessage(apiMessage));
            Convo.insertPostponedMessages(convo, messages);
            convo.postponed.loaded = true;
            return [];
        }
        case 'UserOpenedPostponedMessagesHistory_RequestFailed': {
            const { peerId } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            convo.postponed.loaded = false;
            // TODO: Экшен почти ничего не делает, но тут бы записать ошибку
            //       и показать заглушку. В дизайнах не было
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserOpenedPostponedMessagesHistory.js.map