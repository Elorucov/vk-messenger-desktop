import { Storage } from '../../env/Storage';
import { ConvoAudiosPlaylist, isConvoAudioTrack, isRestoredConvoAudiosPlaylist, } from '../../env/AudioPlayer/ConvoAudiosPlaylist';
export class PlayerStorage extends Storage {
    getPlaylist() {
        const restoredPlaylist = this.get('reforged_audio_player_playlist');
        // обязательно проверяем: "что мы достали из стораджа"
        if (isRestoredConvoAudiosPlaylist(restoredPlaylist)) {
            return new ConvoAudiosPlaylist(restoredPlaylist);
        }
        return;
    }
    getCurrentTrack() {
        const currentTrackEntity = this.get('reforged_audio_player_track');
        // обязательно проверяем: "что мы достали из стораджа"
        if (isConvoAudioTrack(currentTrackEntity)) {
            return currentTrackEntity;
        }
        return;
    }
    getVolume() {
        return this.get('reforged_audio_player_volume');
    }
    storeVolume(value) {
        this.set('reforged_audio_player_volume', value);
    }
    getMute() {
        return this.get('reforged_audio_player_mute');
    }
    storeMute(value) {
        this.set('reforged_audio_player_mute', value);
    }
    getShuffle() {
        return this.get('reforged_audio_player_shuffle');
    }
    storeShuffle(value) {
        this.set('reforged_audio_player_shuffle', value);
    }
    getRepeatMode() {
        return this.get('reforged_audio_player_repeat_mode');
    }
    storeRepeatMode(value) {
        this.set('reforged_audio_player_repeat_mode', value);
    }
    invalidatePlayerStateCache() {
        const CACHE_EXPIRATION_TIME = 2 * 60 * 60 * 1000;
        const timeOfLastRecord = this.get('reforged_audio_player_saved') || 0;
        const isCacheExpired = Date.now() - CACHE_EXPIRATION_TIME > timeOfLastRecord;
        if (isCacheExpired) {
            this.del('reforged_audio_player_playlist');
            this.del('reforged_audio_player_saved');
            this.del('reforged_audio_player_track');
        }
    }
    restorePlayerState() {
        this.invalidatePlayerStateCache();
        const volume = this.getVolume() || 100;
        const mute = this.getMute() || false;
        const shuffle = this.getShuffle() || false;
        const repeatMode = this.getRepeatMode() || 'none';
        const currentTrackEntity = this.getCurrentTrack();
        const playlist = this.getPlaylist();
        return {
            status: 'stopped',
            playedTimeAccumulator: {},
            currentTrackEntity,
            playlist,
            volume,
            mute,
            shuffle,
            repeatMode,
            playbackRate: 1,
        };
    }
    storePlayerState(playerState) {
        const { currentTrackEntity, playlist, volume } = playerState;
        this.set('reforged_audio_player_saved', Date.now());
        this.set('reforged_audio_player_volume', volume);
        if (currentTrackEntity) {
            this.set('reforged_audio_player_track', currentTrackEntity);
        }
        else {
            this.del('reforged_audio_player_track');
        }
        if (playlist) {
            if (playlist instanceof ConvoAudiosPlaylist) {
                this.set('reforged_audio_player_playlist', {
                    meta: playlist.getPlaylistMeta(),
                    list: playlist.getConvoAudiosList(),
                });
            }
        }
        else {
            this.del('reforged_audio_player_playlist');
        }
    }
}
export class VoicePlayerStorage extends Storage {
    getVolume() {
        return this.get('reforged_voice_player_volume');
    }
    storeVolume(value) {
        this.set('reforged_voice_player_volume', value);
    }
    getMute() {
        return this.get('reforged_voice_player_mute');
    }
    storeMute(value) {
        this.set('reforged_voice_player_mute', value);
    }
    getPlaybackRate() {
        return this.get('reforged_voice_player_playback_rate');
    }
    storePlaybackRate(value) {
        this.set('reforged_voice_player_playback_rate', value);
    }
    restorePlayerState() {
        const volume = this.getVolume() || 100;
        const mute = this.getMute() || false;
        const playbackRate = this.getPlaybackRate() || 1;
        return {
            status: 'stopped',
            playedTimeAccumulator: {},
            volume,
            mute,
            shuffle: false,
            repeatMode: 'none',
            playbackRate,
        };
    }
}
//# sourceMappingURL=PlayerStorage.js.map