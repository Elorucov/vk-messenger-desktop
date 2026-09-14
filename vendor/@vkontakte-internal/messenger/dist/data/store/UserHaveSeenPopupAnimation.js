import * as Convo from '../../core/model/Convo';
import * as Attach from '../../core/model/Attach';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserHaveSeenPopupAnimation': {
            const { message } = action;
            const convo = message.peerId
                ? draft.convos.get(message.peerId)
                : undefined;
            if (!convo) {
                return [];
            }
            let foundMessage;
            if (message.kind === 'Queued') {
                foundMessage = Convo.findMessageByRandomId(convo, message.randomId);
            }
            else {
                foundMessage = Convo.findMessageByCmid(convo, message.cmid);
            }
            if (!foundMessage) {
                return [];
            }
            Attach.toggleStickerIsPopupAutoplayed(foundMessage, true);
            return [];
        }
        default:
            return [];
    }
};
//# sourceMappingURL=UserHaveSeenPopupAnimation.js.map