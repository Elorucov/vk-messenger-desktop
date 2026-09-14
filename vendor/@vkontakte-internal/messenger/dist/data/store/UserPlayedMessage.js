import * as Convo from '../../core/model/Convo';
import * as Message from '../../core/model/Message';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { getOwnerGroupId } from '../store/State';
import { castDraft } from 'immer';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserPlayedMessage': {
            const { cmid, peerId } = action;
            const convo = draft.convos.get(peerId);
            const message = convo && Convo.findMessageByCmid(convo, cmid);
            const ownerId = draft.ownerId;
            if (message?.kind !== 'Normal' ||
                !Message.canChangeMessagePlayedStatus(message)) {
                return [];
            }
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('messages.markAsPlayed', {
                            peer_id: peerId,
                            cmid,
                            group_id: getOwnerGroupId(ownerId),
                        }, { retries: 1 });
                        return {
                            type: 'UserPlayedMessage_RequestCompleted',
                            hasFailed: response !== 1,
                            cmid,
                            peerId,
                        };
                    }
                    catch {
                        return {
                            type: 'UserPlayedMessage_RequestCompleted',
                            hasFailed: true,
                            cmid,
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'UserPlayedMessage_RequestCompleted': {
            if (!action.hasFailed) {
                const { cmid, peerId } = action;
                const convo = draft.convos.get(peerId);
                const message = convo && castDraft(Convo.findMessageByCmid(convo, cmid));
                if (message?.kind !== 'Normal' ||
                    !Message.canChangeMessagePlayedStatus(message)) {
                    return [];
                }
                message.isPlayed = true;
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserPlayedMessage.js.map