export function empty() {
    return {
        text: '',
        attaches: {},
        uploadsTrackIds: new Set(),
    };
}
export function isEmpty(draft, actualText) {
    const hasAttaches = Object.keys(draft.attaches).length !== 0;
    return (actualText.length === 0 &&
        !hasAttaches &&
        !hasActiveUploads(draft));
}
export function hasActiveUploads(draft) {
    return draft.uploadsTrackIds.size !== 0;
}
//# sourceMappingURL=CommentsComposerDraft.js.map