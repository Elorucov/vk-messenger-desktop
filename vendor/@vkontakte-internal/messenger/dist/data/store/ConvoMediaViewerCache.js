import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Convo from '../../core/model/Convo';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'ConvoMediaViewerCacheRemoved': {
            const convo = draft.convos.get(action.convo.peerId);
            if (!convo)
                return [];
            Convo.clearMediaViewerCache(convo);
            return [];
        }
        case 'ConvoMediaViewerCacheInserted': {
            const convo = draft.convos.get(action.peerId);
            if (!convo)
                return [];
            convo.mediaViewerCache = {
                ...convo.mediaViewerCache,
                ...action.data,
            };
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=ConvoMediaViewerCache.js.map