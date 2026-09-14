import * as Peer from '../model/Peer';
import { isNonEmptyArray } from '../utils/misc';
export function empty() {
    return {
        text: '',
        html: '',
        attaches: {},
        uploadsTrackIds: new Set(),
    };
}
export const DEFAULT_FORWARD_AUTHOR_HIDDEN = false;
export function isEmpty(draft, actualText) {
    const hasAttaches = Object.keys(draft.attaches).length !== 0;
    return (actualText.length === 0 &&
        !draft.forward &&
        !draft.reply &&
        !hasAttaches &&
        !hasActiveUploads(draft));
}
export function hasActiveUploads(draft) {
    return draft.uploadsTrackIds.size !== 0;
}
export function getNormalForward(draft, kind) {
    if (!draft.forward || draft.forward.kind !== kind) {
        return;
    }
    const normalForward = [...draft.forward.items].filter((item) => item.kind === 'Normal');
    return isNonEmptyArray(normalForward) ? normalForward : undefined;
}
// Очищает или дополняет драфты предыдущих версий
export function validateRequiredFields(drafts) {
    const emptyDraft = empty();
    return Object.entries(drafts).reduce((acc, [rawPeerId, draft]) => {
        const peerId = Peer.resolveId(+rawPeerId);
        if (!Array.isArray(draft)) {
            if ('kind' in draft) {
                return acc;
            }
            if (!(draft.uploadsTrackIds instanceof Set)) {
                draft = {
                    ...draft,
                    uploadsTrackIds: emptyDraft.uploadsTrackIds,
                };
            }
            acc[peerId] = [draft];
            return acc;
        }
        acc[peerId] = draft;
        return acc;
    }, {});
}
//# sourceMappingURL=ComposerDraft.js.map