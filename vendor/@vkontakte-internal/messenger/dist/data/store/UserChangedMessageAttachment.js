import { fromApiMessage } from '../converter/MessageConverter';
import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Convo from '../../core/model/Convo';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'UserChangedMessageAttachment': {
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('messages.getByConversationMessageId', {
                            peer_id: action.peerId,
                            conversation_message_ids: action.cmid.toString(),
                            extended: 1,
                            group_id: action.groupId || 0,
                        }, { retries: 3 });
                        const apiMessage = response.items[0];
                        if (!apiMessage) {
                            return {
                                type: 'UserChangedMessageAttachment_RequestCompleted',
                                hasFailed: true,
                            };
                        }
                        return {
                            type: 'UserChangedMessageAttachment_RequestCompleted',
                            hasFailed: false,
                            peerId: action.peerId,
                            apiMessage,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedMessageAttachment_RequestCompleted',
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'UserChangedMessageAttachment_RequestCompleted': {
            if (action.hasFailed) {
                return [];
            }
            const { message, mentions } = fromApiMessage(featureFlags, action.apiMessage);
            const convo = draft.convos.get(action.peerId);
            if (!convo) {
                return [];
            }
            Convo.replaceMessage(convo, message, mentions.hasDirect || mentions.hasMass);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserChangedMessageAttachment.js.map