export function getNextTrackFromPlaylist(currentTrackEntity, playlist, repeatMode) {
    const curTrackEntityIndex = playlist.findIndex((te) => te.audioTrack.id === currentTrackEntity.audioTrack.id);
    const nextTrackEntity = curTrackEntityIndex >= 0 ? playlist[curTrackEntityIndex + 1] : undefined;
    if (nextTrackEntity) {
        return {
            ...nextTrackEntity,
            audioTrack: { ...nextTrackEntity.audioTrack, progress: 0 },
        };
    }
    if (!nextTrackEntity && repeatMode === 'all') {
        const firstTrackEntity = playlist[0];
        if (firstTrackEntity) {
            return {
                ...firstTrackEntity,
                audioTrack: { ...firstTrackEntity.audioTrack, progress: 0 },
            };
        }
        return;
    }
    return;
}
export function getPrevTrackFromPlaylist(currentTrackEntity, playlist, repeatMode) {
    const curTrackEntityIndex = playlist.findIndex((te) => te.audioTrack.id === currentTrackEntity.audioTrack.id);
    const prevTrackEntity = playlist[curTrackEntityIndex - 1];
    if (prevTrackEntity) {
        return {
            ...prevTrackEntity,
            audioTrack: { ...prevTrackEntity.audioTrack, progress: 0 },
        };
    }
    if (!prevTrackEntity && repeatMode === 'all') {
        const lastTrackEntity = playlist[playlist.length - 1];
        if (lastTrackEntity) {
            return {
                ...lastTrackEntity,
                audioTrack: { ...lastTrackEntity.audioTrack, progress: 0 },
            };
        }
        return;
    }
    return;
}
export function excludeTracksDoubling(list) {
    const uniqIds = new Set();
    return list.filter((te) => {
        if (uniqIds.has(te.audioTrack.id)) {
            return false;
        }
        uniqIds.add(te.audioTrack.id);
        return true;
    });
}
//# sourceMappingURL=utils.js.map