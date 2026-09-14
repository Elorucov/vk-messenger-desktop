import { useMemo } from 'react';
import * as ComposerDraft from '../../core/model/ComposerDraft';
import * as ChannelComposerDraft from '../../core/model/ChannelComposerDraft';
import * as CommentsComposerDraft from '../../core/model/CommentsComposerDraft';
import { useStore } from '../hooks/misc';
export function useComposerDraft(peerId) {
    const emptyDraft = useMemo(() => ComposerDraft.empty(), []);
    return useStore((state) => {
        const peerDrafts = state.composerDrafts[peerId];
        if (peerDrafts) {
            return peerDrafts[peerDrafts.length - 1] ?? emptyDraft;
        }
        return emptyDraft;
    });
}
export function useComposerPostponedDraft(peerId) {
    const emptyDraft = useMemo(() => ComposerDraft.empty(), []);
    return useStore((state) => {
        const peerDrafts = state.composerPostponedDrafts[peerId];
        if (peerDrafts) {
            return peerDrafts[peerDrafts.length - 1] ?? emptyDraft;
        }
        return emptyDraft;
    });
}
export function useChannelComposerDraft(channelId) {
    const emptyDraft = useMemo(() => ChannelComposerDraft.empty(), []);
    return useStore((state) => state.channelComposerDrafts[channelId] || emptyDraft);
}
export function useCommentsComposerDraft(channelId, postCmid) {
    const emptyDraft = useMemo(() => CommentsComposerDraft.empty(), []);
    return useStore((state) => state.commentsComposerDrafts[`${channelId}-${postCmid}`] || emptyDraft);
}
//# sourceMappingURL=useComposerDraft.js.map