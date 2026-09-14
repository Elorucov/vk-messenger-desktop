import { EventEmitter } from '../../../data/env/EventEmitter';
import { VideoMessagePlayerEventTypes, } from '../../../data/env/IPlayer';
import { getVideoSource } from '../../env/VideoMessagePlayer/utils';
/**
 * @todo Поддержать режим Picture-in-Picture (https://jira.mvk.com/browse/ME-41000).
 */
export class VideoMessagePlayer extends EventEmitter {
    player;
    state = {
        status: 'stopped',
        settings: {
            volume: 1,
            playbackRate: 1,
            muted: false,
        },
    };
    storage;
    constructor(storage) {
        super();
        this.storage = storage;
        this.player = document.createElement('video');
        this.player.disablePictureInPicture = true;
        this.player.playsInline = true;
        this.player.src = '';
        const localSettings = this.storage.get('videomessage_settings');
        if (localSettings) {
            this.state.settings = localSettings;
        }
        this.player.addEventListener('ended', () => {
            this.endTrack();
        });
        this.player.addEventListener('timeupdate', () => {
            this.tick();
        });
        this.player.addEventListener('error', () => {
            const { currentVideoMessageTrack } = this.state;
            if (currentVideoMessageTrack) {
                this.stopCurrentTrackByError(currentVideoMessageTrack.id);
            }
        });
    }
    updateProgressState(progress) {
        const { currentVideoMessageTrack } = this.state;
        if (currentVideoMessageTrack) {
            this.setState({
                ...this.state,
                currentVideoMessageTrack: {
                    ...currentVideoMessageTrack,
                    progress,
                },
            });
        }
    }
    /** установка звука 0-1 */
    setVolume(volume) {
        this.setState({
            ...this.state,
            settings: {
                ...this.state.settings,
                muted: false,
                volume,
            },
        });
        this.player.muted = false;
        this.player.volume = volume;
        this.storage.set('videomessage_settings', this.state.settings);
    }
    setMuted(value) {
        const state = {
            ...this.state,
            settings: {
                ...this.state.settings,
                muted: value,
            },
        };
        this.setState(state);
        this.player.muted = value;
    }
    /** установка скорости воспроизведения звука 0.5, 1, 1.5... */
    setPlaybackRate(playbackRate) {
        this.setState({
            ...this.state,
            settings: {
                ...this.state.settings,
                playbackRate,
            },
        });
        this.player.playbackRate = playbackRate;
        this.storage.set('videomessage_settings', this.state.settings);
    }
    stop() {
        this.player.pause();
        this.player.currentTime = 0;
        this.player.src = '';
        this.setState({
            ...this.state,
            status: 'stopped',
            playlist: undefined,
            currentVideoMessageTrack: undefined,
        });
    }
    play(convoPeerId, videoMessageTrack) {
        this.playHTML5Player(videoMessageTrack, videoMessageTrack.progress);
        this.setState({
            ...this.state,
            status: 'playing',
            convoPeerId,
            currentVideoMessageTrack: videoMessageTrack,
        });
    }
    move(backward = false) {
        if (!this.state.currentVideoMessageTrack) {
            return;
        }
        const { playlist } = this.state;
        if (playlist) {
            const nextTrack = backward
                ? playlist.getPrev(this.state.currentVideoMessageTrack)
                : playlist.getNext(this.state.currentVideoMessageTrack);
            const { source } = playlist.getPlaylistMeta();
            if (nextTrack && source?.kind === 'message') {
                this.play(source.peerId, nextTrack);
                this.scrollToMessage();
                return nextTrack;
            }
            else {
                this.stop();
            }
        }
        else {
            this.stop();
        }
    }
    pause() {
        const { currentVideoMessageTrack } = this.state;
        if (currentVideoMessageTrack) {
            this.player.pause();
            this.setState({
                ...this.state,
                status: 'paused',
            });
        }
    }
    resume() {
        const { currentVideoMessageTrack } = this.state;
        if (currentVideoMessageTrack) {
            this.playHTML5Player(currentVideoMessageTrack);
            this.setState({
                ...this.state,
                status: 'playing',
            });
        }
    }
    endTrack() {
        // Сначала переходим в status 'ended'
        this.setState({
            ...this.state,
            status: 'ended',
        });
        const { playlist } = this.state;
        if (playlist) {
            this.move();
        }
        else {
            this.stop();
        }
    }
    setProgress(progress) {
        const { currentVideoMessageTrack } = this.state;
        if (currentVideoMessageTrack) {
            this.player.currentTime =
                (currentVideoMessageTrack.duration ?? 0) * progress;
            this.updateProgressState(progress);
        }
    }
    scrollToMessage() {
        if (!this.state.currentVideoMessageTrack) {
            return;
        }
        this.emit(VideoMessagePlayerEventTypes.SCROLL_TO_MESSAGE, this.state.currentVideoMessageTrack.id);
    }
    stopCurrentTrackByError(id) {
        const { currentVideoMessageTrack } = this.state;
        if (currentVideoMessageTrack?.id === id) {
            this.setState({
                ...this.state,
                status: 'stopped',
                currentVideoMessageTrack: {
                    ...currentVideoMessageTrack,
                    progress: 0,
                },
            });
        }
    }
    setState(state) {
        this.state = state;
        this.emit(VideoMessagePlayerEventTypes.STATE_UPDATED, state);
    }
    getState() {
        return this.state;
    }
    getPlayer() {
        return this.player;
    }
    forceUpdate(state) {
        this.setState(state);
    }
    setPlaylist(playlist) {
        this.setState({
            ...this.state,
            playlist,
        });
    }
    tick() {
        const { currentVideoMessageTrack } = this.state;
        if (currentVideoMessageTrack) {
            const { currentTime, duration: playerDuration } = this.player;
            const { duration = 1, progress: prevProgress = 0 } = currentVideoMessageTrack;
            const progress = currentTime / duration;
            this.updateProgressState(progress > 1 ? 1 : progress);
            if (playerDuration === Infinity && progress === 0 && prevProgress !== 0) {
                this.player.dispatchEvent(new Event('ended'));
            }
        }
    }
    playHTML5Player(track, currentTime) {
        const src = getVideoSource(track.files);
        if (typeof currentTime === 'number') {
            this.player.currentTime = currentTime;
        }
        if (src && this.player.src !== src) {
            this.player.src = src;
        }
        // Применяем текущие настройки для консистентности.
        this.player.volume = this.state.settings.volume;
        this.player.playbackRate = this.state.settings.playbackRate;
        this.player.muted = this.state.settings.muted;
        this.player
            .play()
            .then(() => {
            /**
             * так как сам VideoMessagePlayer мы считаем синхронным, а вызов this.player.play() асинхронный,
             * то после play() нам нужно обязательно синхронизировать состояние нашего плеера с состоянием this.player
             */
            const { status } = this.state;
            if (status !== 'playing') {
                this.player.pause();
            }
            if (src && this.player.src !== src) {
                this.player.pause();
            }
        })
            .catch(() => {
            this.stopCurrentTrackByError(track.id);
        });
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        // пока здесь нечего подчищать
    }
}
//# sourceMappingURL=VideoMessagePlayer.js.map