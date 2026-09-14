import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Convo from '../../core/model/Convo';
import * as Trie from '../../core/model/Trie';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'AddConvosToSearchIndex': {
            if (!featureFlags.vkm_search_convos_new_sort) {
                return [];
            }
            const searchablePeerIds = action.peerIds.filter((peerId) => {
                const convo = Convo.safeGet(draft.convos, peerId);
                return Convo.isSearchableConvo(convo);
            });
            Trie.add(draft.convosSearchIndex, searchablePeerIds, (peerId) => {
                const peer = draft.peers.get(peerId);
                return {
                    id: peerId,
                    strings: peer ? Trie.peerWords(peer, false) : [],
                };
            });
            return [];
        }
        case 'Noop': {
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=AddConvosToSearchIndex.js.map