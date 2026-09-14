import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Convo from '../../core/model/Convo';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserHideConvoBanner': {
            const { peerId, name } = action;
            const convo = Convo.safeGet(draft.convos, peerId);
            Convo.hideBanner(convo);
            return [
                async function hideBanner({ api }) {
                    try {
                        await api.fetch('messages.conversationBarHide', {
                            name,
                            peer_id: peerId,
                        });
                    }
                    catch { }
                    return { type: 'Noop' };
                },
            ];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=UserHideConvoBanner.js.map