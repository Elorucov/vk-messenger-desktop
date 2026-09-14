import { Player } from '../env/AudioPlayer/Player';
import { VideoMessagePlayer } from '../env/VideoMessagePlayer/VideoMessagePlayer';
import { PlayerStorage, VoicePlayerStorage, } from '../env/AudioPlayer/PlayerStorage';
import { PlayerEventTypes, } from '../../data/env/IPlayer';
import { STORAGE_DB_NAME } from '../../core/config/config';
export class MEAppPlayer extends Player {
    mediaMediator;
    playerStorage;
    constructor(mediaMediator, storageId) {
        super({
            status: 'stopped',
            playedTimeAccumulator: {},
            volume: 100,
            mute: false,
            shuffle: false,
            repeatMode: 'none',
            playbackRate: 1,
        });
        this.subscribe(PlayerEventTypes.START_NEW_TRACK, (e) => {
            this.playerStorage.storePlayerState({
                ...e.state,
                status: 'stopped',
            });
        });
        this.subscribe(PlayerEventTypes.START_NEXT_TRACK_AUTOMATICALLY, (e) => {
            this.playerStorage.storePlayerState({
                ...e.state,
                status: 'stopped',
            });
        });
        this.mediaMediator = mediaMediator;
        this.playerStorage = new PlayerStorage(STORAGE_DB_NAME, storageId);
        const initialState = this.playerStorage.restorePlayerState();
        this.forceUpdate(initialState);
    }
    play(audioTrack, playlist) {
        this.mediaMediator.handlePlayerOn(this);
        return super.play(audioTrack, playlist);
    }
    setVolume(value) {
        super.setVolume(value);
        const { volume, mute } = this.getState();
        this.playerStorage.storeVolume(volume);
        this.playerStorage.storeMute(mute);
    }
    setMute(value) {
        super.setMute(value);
        const { volume, mute } = this.getState();
        this.playerStorage.storeVolume(volume);
        this.playerStorage.storeMute(mute);
    }
    setShuffle(value) {
        super.setShuffle(value);
        const { shuffle } = this.getState();
        this.playerStorage.storeShuffle(shuffle);
    }
    setRepeatMode(value) {
        super.setRepeatMode(value);
        const { repeatMode } = this.getState();
        this.playerStorage.storeRepeatMode(repeatMode);
    }
    stopPlayer() {
        super.stopPlayer();
        const state = this.getState();
        this.playerStorage.storePlayerState({
            ...state,
            status: 'stopped',
        });
    }
    isPlaying() {
        const { status } = this.getState();
        return status === 'playing';
    }
    handleMediaMediatorResume() {
        super.resume();
    }
    handleMediaMediatorPause() {
        super.pause();
    }
}
export class MEAppVoicePlayer extends Player {
    mediaMediator;
    playerStorage;
    constructor(mediaMediator, storageId) {
        super({
            status: 'stopped',
            playedTimeAccumulator: {},
            volume: 100,
            mute: false,
            shuffle: false,
            repeatMode: 'none',
            playbackRate: 1,
        });
        this.mediaMediator = mediaMediator;
        this.subscribe(PlayerEventTypes.PLAYLIST_ENDED, () => this.mediaMediator.handleVoicePlayerOff(this));
        this.playerStorage = new VoicePlayerStorage(STORAGE_DB_NAME, storageId);
        const initialState = this.playerStorage.restorePlayerState();
        this.forceUpdate(initialState);
    }
    setVolume(value) {
        super.setVolume(value);
        const { volume, mute } = this.getState();
        this.playerStorage?.storeVolume(volume);
        this.playerStorage?.storeMute(mute);
    }
    setMute(value) {
        super.setMute(value);
        const { volume, mute } = this.getState();
        this.playerStorage?.storeVolume(volume);
        this.playerStorage?.storeMute(mute);
    }
    setPlaybackRate(value) {
        super.setPlaybackRate(value);
        const { playbackRate } = this.getState();
        this.playerStorage?.storePlaybackRate(playbackRate);
    }
    play(trackEntity, playlist) {
        this.mediaMediator.handleVoicePlayerOn(this);
        return super.play(trackEntity, playlist);
    }
    isPlaying() {
        const { status } = this.getState();
        return status === 'playing';
    }
    handleMediaMediatorResume() {
        super.resume();
    }
    handleMediaMediatorPause() {
        super.pause();
    }
}
export class MEAppVideoMessagePlayer extends VideoMessagePlayer {
    mediaMediator;
    constructor(mediaMediator, storage) {
        super(storage);
        this.mediaMediator = mediaMediator;
    }
    play(convoPeerId, videoMessageTrack) {
        this.mediaMediator.handleVideoMessagePlayerOn(this);
        super.play(convoPeerId, videoMessageTrack);
    }
    pause = () => {
        super.pause();
        this.mediaMediator.handleVideoMessagePlayerOff(this);
    };
    resume() {
        this.mediaMediator.handleVideoMessagePlayerOn(this);
        super.resume();
    }
    stop() {
        this.mediaMediator.handleVideoMessagePlayerOff(this);
        super.stop();
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        this.mediaMediator.dispose();
        super.dispose();
    }
    isPlaying() {
        const { status } = this.getState();
        return status === 'playing';
    }
    handleMediaMediatorResume() {
        super.resume();
    }
    handleMediaMediatorPause() {
        super.pause();
    }
}
//# sourceMappingURL=MEAppPlayers.js.map