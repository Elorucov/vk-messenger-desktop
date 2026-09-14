import * as Channel from '../model/Channel';
export function empty() {
    return {
        text: '',
        attaches: {},
        uploadsTrackIds: new Set(),
        visibility: 'all',
        donutDelay: -1,
        sendOptions: {
            selected: ['enable_comments'],
            disabled: [],
        },
        ads: {
            predId: '',
            erId: '',
            isAd: false,
        },
    };
}
export function isEmpty(draft, actualText) {
    const hasAttaches = Object.keys(draft.attaches).length !== 0;
    return (actualText.length === 0 &&
        !hasAttaches &&
        !draft.forward &&
        !hasActiveUploads(draft));
}
export function hasActiveUploads(draft) {
    return draft.uploadsTrackIds.size !== 0;
}
export const VISIBILITY = ['all', 'donut'];
export const SEND_OPTIONS = [
    'enable_comments',
    'signed',
    'mute_notifications',
];
// Дополняет драфты предыдущих версий
export function validateRequiredFields(drafts) {
    const emptyDraft = empty();
    return Object.entries(drafts).reduce((acc, [rawPeerId, draft]) => {
        const peerId = Channel.resolveId(+rawPeerId);
        acc[peerId] = draft;
        if (!(draft.uploadsTrackIds instanceof Set)) {
            acc[peerId] = {
                ...draft,
                uploadsTrackIds: emptyDraft.uploadsTrackIds,
            };
        }
        if (draft.ads === undefined) {
            acc[peerId] = {
                ...draft,
                ads: emptyDraft.ads,
            };
        }
        return acc;
    }, {});
}
//# sourceMappingURL=ChannelComposerDraft.js.map