import * as Peer from '../../core/model/Peer';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { isNumber } from '@vkontakte/vkjs';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'ViewerSetLanguage': {
            const { languageId } = action;
            const viewerPeer = Peer.safeGet(draft.peers, draft.viewer.id);
            const previousLanguageId = viewerPeer.languageId;
            draft.locks.setViewerLanguage = true;
            Peer.setLanguage(viewerPeer, languageId);
            return [
                async function ({ api }) {
                    try {
                        await api.fetch('platform.changeLang', {
                            lang_id: languageId,
                        }, {
                            retries: 2,
                        });
                        return {
                            type: 'ViewerSetLanguage_RequestCompleted',
                            languageId,
                            previousLanguageId,
                            hasFailed: false,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'ViewerSetLanguage_RequestCompleted',
                            languageId,
                            previousLanguageId,
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'ViewerSetLanguage_RequestCompleted': {
            const { hasFailed, previousLanguageId } = action;
            if (!hasFailed) {
                window.location.reload();
                return [];
            }
            const viewerPeer = Peer.safeGet(draft.peers, draft.viewer.id);
            if (isNumber(previousLanguageId)) {
                Peer.setLanguage(viewerPeer, previousLanguageId);
            }
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=ViewerSetLanguage.js.map