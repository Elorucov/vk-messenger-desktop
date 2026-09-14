import { PlayerEventTypes, } from '../../../data/env/IPlayer';
import { exhaustivenessCheck, getRandomInt } from '../../../core/utils/misc';
// девятизначный uuid int
const uuid = () => {
    const min = Math.ceil(100000000);
    const max = Math.floor(999999999);
    return getRandomInt(min, max);
};
// состояние плеера в приложении: app | background | fullscreen
// playlistConvoPeerId - id беседы из которой запустили плеер, appCurrentActiveConvoPeerId - id текущей активной беседы
const getPlayerAppState = (playlistMetaSource, screenRoute) => {
    if (window.document.hidden) {
        return 'background';
    }
    const playlistTargetId = playlistMetaSource && getPlaylistTargetId(playlistMetaSource);
    const screenRouteId = screenRoute && getScreenRouteId(screenRoute);
    if (screenRouteId && playlistTargetId === screenRouteId) {
        return 'fullscreen';
    }
    return 'app';
};
const getPlaylistTargetId = (playlistMetaSource) => {
    switch (playlistMetaSource.kind) {
        case 'message': {
            return playlistMetaSource.peerId;
        }
        case 'channel': {
            return playlistMetaSource.channelId;
        }
        default:
            exhaustivenessCheck(playlistMetaSource);
    }
};
const getScreenRouteId = (screenRoute) => {
    if (screenRoute?.kind === 'ConvoRoute') {
        return screenRoute.peerId;
    }
    if (screenRoute?.kind === 'ChannelRoute') {
        return screenRoute.channelId;
    }
    return;
};
export class AudioStatsLogger {
    state = {
        prevPlaybackStartedAt: 0,
    };
    api;
    router;
    onDisposeActions = [];
    constructor(api) {
        this.api = api;
    }
    send(e) {
        this.api.fetch('stats.trackEvents', {
            events: JSON.stringify([e]),
        });
    }
    // слушаем события плеера и логируем их
    observePlayer(player) {
        const musicStartPlaybackReasonsMap = {
            [PlayerEventTypes.START_NEW_TRACK]: 'new',
            [PlayerEventTypes.START_NEXT_TRACK_AUTOMATICALLY]: 'auto',
            [PlayerEventTypes.RESUME_TRACK]: 'continue',
        };
        const musicStartPlaybackHandler = (eventType) => (e) => {
            const { currentTrackEntity, playlist, repeatMode, shuffle } = e.state;
            const currentAudioTrack = currentTrackEntity?.audioTrack;
            const trackCode = currentTrackEntity?.trackCode || '';
            const reason = musicStartPlaybackReasonsMap[eventType];
            const playlistMeta = playlist?.getPlaylistMeta();
            const playlistId = playlistMeta?.type === 'playlist'
                ? `${playlistMeta.ownerId}_${playlistMeta.id}`
                : undefined;
            const state = getPlayerAppState(playlistMeta?.source, this.router?.screenRoute);
            if (currentAudioTrack) {
                const { progress, duration, id } = currentAudioTrack;
                const logEvent = {
                    e: 'music_start_playback',
                    audio_id: id,
                    shuffled: shuffle,
                    uuid: -uuid(),
                    reason,
                    start_time: Date.now(),
                    playback_started_at: progress * duration,
                    track_code: trackCode,
                    repeate: repeatMode,
                    state,
                    source: 'messages',
                    playback_position: progress * duration,
                    playlist_id: playlistId,
                    prev_audio_id: this.state.prevAudioId,
                    prev_playlist_id: this.state.prevPlaylistId,
                };
                this.state.prevAudioId = id;
                this.state.prevPlaylistId = playlistId;
                this.state.prevPlaybackStartedAt = progress * duration;
                this.send(logEvent);
            }
        };
        player.subscribe(PlayerEventTypes.START_NEW_TRACK, musicStartPlaybackHandler(PlayerEventTypes.START_NEW_TRACK));
        player.subscribe(PlayerEventTypes.START_NEXT_TRACK_AUTOMATICALLY, musicStartPlaybackHandler(PlayerEventTypes.START_NEXT_TRACK_AUTOMATICALLY));
        player.subscribe(PlayerEventTypes.RESUME_TRACK, musicStartPlaybackHandler(PlayerEventTypes.RESUME_TRACK));
        const musicStopPlaybackReasonsMap = {
            [PlayerEventTypes.STOP_CURRENT_TRACK_BEFORE_STARTING_NEW_TRACK]: 'new',
            [PlayerEventTypes.STOP_CURRENT_TRACK_AUTOMATICALLY]: 'auto',
            [PlayerEventTypes.PAUSE_CURRENT_TRACK]: 'pause',
            [PlayerEventTypes.STOP_CURRENT_TRACK_BY_ERROR]: 'error',
            onbeforeunload: 'close_app',
        };
        const musicStopPlaybackHandler = (eventType) => (e) => {
            const { currentTrackEntity, playlist, playedTimeAccumulator, repeatMode, shuffle, } = e.state;
            const currentAudioTrack = currentTrackEntity?.audioTrack;
            const trackCode = currentTrackEntity?.trackCode || '';
            const playlistMeta = playlist?.getPlaylistMeta();
            const playlistId = playlistMeta?.type === 'playlist'
                ? `${playlistMeta.ownerId}_${playlistMeta.id}`
                : undefined;
            const state = getPlayerAppState(playlistMeta?.source, this.router?.screenRoute);
            if (currentAudioTrack) {
                const { id, progress, duration } = currentAudioTrack;
                const playbackDuration = playedTimeAccumulator[id] || 0;
                const reason = musicStopPlaybackReasonsMap[eventType];
                const logEvent = {
                    e: 'music_stop_playback',
                    audio_id: id,
                    shuffled: shuffle,
                    uuid: -uuid(),
                    reason,
                    start_time: Date.now(),
                    playback_started_at: this.state.prevPlaybackStartedAt,
                    track_code: trackCode,
                    repeate: repeatMode,
                    state: state,
                    duration: playbackDuration,
                    source: 'messages',
                    playback_position: progress * duration,
                    playlist_id: playlistId,
                    prev_audio_id: this.state.prevAudioId,
                    prev_playlist_id: this.state.prevPlaylistId,
                };
                this.state.prevAudioId = id;
                this.state.prevPlaylistId = playlistId;
                this.send(logEvent);
            }
        };
        player.subscribe(PlayerEventTypes.STOP_CURRENT_TRACK_BEFORE_STARTING_NEW_TRACK, musicStopPlaybackHandler(PlayerEventTypes.STOP_CURRENT_TRACK_BEFORE_STARTING_NEW_TRACK));
        player.subscribe(PlayerEventTypes.STOP_CURRENT_TRACK_AUTOMATICALLY, musicStopPlaybackHandler(PlayerEventTypes.STOP_CURRENT_TRACK_AUTOMATICALLY));
        player.subscribe(PlayerEventTypes.PAUSE_CURRENT_TRACK, musicStopPlaybackHandler(PlayerEventTypes.PAUSE_CURRENT_TRACK));
        player.subscribe(PlayerEventTypes.STOP_CURRENT_TRACK_BY_ERROR, musicStopPlaybackHandler(PlayerEventTypes.STOP_CURRENT_TRACK_BY_ERROR));
        const onbeforeunload = () => {
            const playerState = player.getState();
            musicStopPlaybackHandler('onbeforeunload')({
                state: playerState,
            });
        };
        window.addEventListener('beforeunload', onbeforeunload);
        this.onDisposeActions.push(() => {
            player.unsubscribe(PlayerEventTypes.START_NEW_TRACK, musicStartPlaybackHandler(PlayerEventTypes.START_NEW_TRACK));
            player.unsubscribe(PlayerEventTypes.START_NEXT_TRACK_AUTOMATICALLY, musicStartPlaybackHandler(PlayerEventTypes.START_NEXT_TRACK_AUTOMATICALLY));
            player.unsubscribe(PlayerEventTypes.RESUME_TRACK, musicStartPlaybackHandler(PlayerEventTypes.RESUME_TRACK));
            player.unsubscribe(PlayerEventTypes.STOP_CURRENT_TRACK_BEFORE_STARTING_NEW_TRACK, musicStopPlaybackHandler(PlayerEventTypes.STOP_CURRENT_TRACK_BEFORE_STARTING_NEW_TRACK));
            player.unsubscribe(PlayerEventTypes.STOP_CURRENT_TRACK_AUTOMATICALLY, musicStopPlaybackHandler(PlayerEventTypes.STOP_CURRENT_TRACK_AUTOMATICALLY));
            player.unsubscribe(PlayerEventTypes.PAUSE_CURRENT_TRACK, musicStopPlaybackHandler(PlayerEventTypes.PAUSE_CURRENT_TRACK));
            player.unsubscribe(PlayerEventTypes.STOP_CURRENT_TRACK_BY_ERROR, musicStopPlaybackHandler(PlayerEventTypes.STOP_CURRENT_TRACK_BY_ERROR));
            window.removeEventListener('beforeunload', onbeforeunload);
        });
        return;
    }
    // следим за роутером, чтобы определять состояние PlayerAppState
    observeRouter(router) {
        this.router = router;
        return;
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        this.onDisposeActions.forEach((action) => action());
    }
}
//# sourceMappingURL=AudioStatsLogger.js.map