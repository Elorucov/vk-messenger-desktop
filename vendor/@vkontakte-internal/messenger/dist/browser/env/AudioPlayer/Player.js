import { EventEmitter } from '../../../data/env/EventEmitter';
import { PlayerEventTypes, } from '../../../data/env/IPlayer';
const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
// сколько времени аудиодорожки было прослушано без учёта перемотки
const getPlayedTime = (htmlAudioElement) => {
    const ranges = htmlAudioElement.played;
    let playedTime = 0;
    for (let i = 0; i < ranges.length; i++) {
        playedTime += ranges.end(i) - ranges.start(i);
    }
    return playedTime;
};
export class Player extends EventEmitter {
    player;
    state;
    constructor(initialPlayerState) {
        super();
        this.state = initialPlayerState;
        this.player = document.createElement('audio');
        this.player.volume = initialPlayerState.volume / 100;
        this.player.src = SILENCE;
        this.player.playbackRate = initialPlayerState.playbackRate;
        this.player.addEventListener('ended', () => {
            const { currentTrackEntity } = this.state;
            const currentAudioTrack = currentTrackEntity?.audioTrack;
            if (currentAudioTrack) {
                const state = {
                    ...this.state,
                    status: 'ended',
                };
                this.setState(state);
                this.stopCurrentTrackAutomatically();
                this.startNextTrackAutomatically();
            }
        });
        this.player.addEventListener('error', () => {
            this.stopCurrentTrackByError();
        });
        this.player.addEventListener('timeupdate', () => {
            const state = { ...this.state };
            if (state.currentTrackEntity?.audioTrack) {
                const { currentTime, duration: playerDuration } = this.player;
                // голосовые сообщения в safari в качестве duration получают Infinity => использеум duration из объекта аудиодорожки
                const { duration, progress: prevProgress, id, } = state.currentTrackEntity.audioTrack;
                const progress = currentTime / duration;
                // в safari не всегда получается определить played, так как по завершению проигрывания TimeRange выдаёт 0 (событие 'ended'). Поэтому следим на каждом 'timeupdate'
                if (progress > 0) {
                    state.playedTimeAccumulator[id] = getPlayedTime(this.player);
                }
                this.setState({
                    ...state,
                    currentTrackEntity: {
                        ...state.currentTrackEntity,
                        audioTrack: {
                            ...state.currentTrackEntity.audioTrack,
                            progress: progress > 1 ? 1 : progress,
                        },
                    },
                });
                // голосовые сообщения в safari в качестве duration получают Infinity => событие 'ended' не срабатывает
                // инициируем это событи самостоятельно
                // это относится к голосовым (надо сходить к бэкендерам и попросить добавить content-length к голосовым)
                // также, на сафари происходит и такое, что progress > 1
                if (playerDuration === Infinity &&
                    ((progress === 0 && prevProgress !== 0) || progress > 1)) {
                    this.player.dispatchEvent(new Event('ended'));
                }
            }
        });
    }
    play(trackEntity, playlist) {
        // если запускаем новую дорожку
        if (this.state.currentTrackEntity?.audioTrack?.url !==
            trackEntity.audioTrack.url) {
            // если текущая дорожка не остановлена полностью или играет - останавливаем её
            if (this.state.status !== 'stopped') {
                this.stopCurrentTrackBeforeStartingNewTrack();
            }
            this.startNewTrack(trackEntity, playlist);
            // если запускается дорожка, которая до этого либо была остановлена либо закончилась - значит песню хотят повторить
        }
        else if (this.state.status === 'stopped') {
            // TODO: после добавления возможности повторения треков в плеере не забыть разделить события "пользователь сам нажал на повтор (например на последний трек в плейлисте)" и "плеер воспроизводит на повторе" (разница в reason: 'new' | 'next')
            this.repeateCurrentTrack(trackEntity, playlist);
            // если запускается дорожка, которая до этого либо была на паузе - значит песню хотят продолжить слушать
        }
        else if (this.state.status === 'paused') {
            this.resumeTrack(trackEntity, playlist);
            // просто перемотка
        }
        else {
            this.player.currentTime =
                trackEntity.audioTrack.duration * trackEntity.audioTrack.progress;
        }
    }
    playNext(currentTrackEntity, playlist) {
        const { shuffle, repeatMode } = this.getState();
        const nextTrackEntity = playlist?.getNext(currentTrackEntity, shuffle, repeatMode);
        if (nextTrackEntity) {
            this.play(nextTrackEntity, playlist);
        }
    }
    playPrev(currentTrackEntity, playlist) {
        const { shuffle, repeatMode } = this.getState();
        const prevTrackEntity = playlist?.getPrev(currentTrackEntity, shuffle, repeatMode);
        if (prevTrackEntity) {
            this.play(prevTrackEntity, playlist);
        }
    }
    pause() {
        const { currentTrackEntity, playlist, playedTimeAccumulator } = this.state;
        const currentAudioTrack = currentTrackEntity?.audioTrack;
        if (currentAudioTrack) {
            const { currentTime } = this.player;
            // голосовые сообщения в safari в качестве duration получают Infinity => использеум duration из объекта аудиодорожки
            const { duration } = currentAudioTrack;
            const state = {
                ...this.state,
                status: 'paused',
                playlist,
                playedTimeAccumulator,
                currentTrackEntity: {
                    ...currentTrackEntity,
                    audioTrack: {
                        ...currentAudioTrack,
                        progress: currentTime / duration,
                    },
                },
            };
            this.setState(state);
            this.player.pause();
            const playerEventPayload = {
                state,
            };
            this.emit(PlayerEventTypes.PAUSE_CURRENT_TRACK, playerEventPayload);
        }
    }
    resume() {
        const { currentTrackEntity, playlist } = this.state;
        const currentAudioTrack = currentTrackEntity?.audioTrack;
        if (currentAudioTrack) {
            this.resumeTrack(currentTrackEntity, playlist);
        }
    }
    resetCurrentTrackState() {
        const { currentTrackEntity, playlist, playedTimeAccumulator } = this.state;
        const currentAudioTrack = currentTrackEntity?.audioTrack;
        if (currentAudioTrack) {
            const state = {
                ...this.state,
                status: 'stopped',
                playlist,
                playedTimeAccumulator,
                currentTrackEntity: {
                    ...currentTrackEntity,
                    audioTrack: {
                        ...currentAudioTrack,
                        progress: 0,
                    },
                },
            };
            this.setState(state);
        }
    }
    startNewTrack(trackEntity, playlist) {
        const currentState = this.getState();
        const state = {
            ...currentState,
            status: 'playing',
            playlist,
            playedTimeAccumulator: {},
            currentTrackEntity: trackEntity,
        };
        this.setState(state);
        const playerEventPayload = {
            state,
        };
        this.emit(PlayerEventTypes.START_NEW_TRACK, playerEventPayload);
        const src = trackEntity.audioTrack.url;
        const currentTime = trackEntity.audioTrack.duration * trackEntity.audioTrack.progress;
        this.playHTML5Player(src, currentTime);
    }
    resumeTrack(trackEntity, playlist) {
        const curState = this.getState();
        const state = {
            ...curState,
            status: 'playing',
            playlist,
            playedTimeAccumulator: curState.playedTimeAccumulator,
            currentTrackEntity: trackEntity,
        };
        const src = curState.currentTrackEntity?.audioTrack?.url;
        let currentTime;
        // если вдруг resume делается с нового времени
        // голосовые сообщения в safari в качестве duration получают Infinity
        // проверяем что это дорожка, длительность которой известна
        if (this.player.duration !== Infinity &&
            this.state.currentTrackEntity?.audioTrack?.progress !==
                trackEntity.audioTrack.progress) {
            currentTime =
                trackEntity.audioTrack.duration * trackEntity.audioTrack.progress;
        }
        this.setState(state);
        const playerEventPayload = {
            state,
        };
        this.emit(PlayerEventTypes.RESUME_TRACK, playerEventPayload);
        this.playHTML5Player(src, currentTime);
    }
    repeateCurrentTrack(trackEntity, playlist) {
        this.startNewTrack(trackEntity, playlist);
    }
    startNextTrackAutomatically() {
        const curState = this.getState();
        const { playlist, currentTrackEntity, repeatMode, shuffle } = curState;
        let playerEventPayload = {
            state: curState,
        };
        if (!playlist || !currentTrackEntity) {
            this.emit(PlayerEventTypes.PLAYLIST_ENDED, playerEventPayload);
            return;
        }
        const nextTrackEntity = repeatMode === 'one'
            ? {
                ...currentTrackEntity,
                audioTrack: { ...currentTrackEntity.audioTrack, progress: 0 },
            }
            : playlist.getNext(currentTrackEntity, shuffle, repeatMode);
        if (!nextTrackEntity) {
            this.emit(PlayerEventTypes.PLAYLIST_ENDED, playerEventPayload);
            return;
        }
        const state = {
            ...curState,
            status: 'playing',
            playlist,
            playedTimeAccumulator: {},
            currentTrackEntity: nextTrackEntity,
        };
        this.setState(state);
        playerEventPayload = {
            state,
        };
        this.emit(PlayerEventTypes.START_NEXT_TRACK_AUTOMATICALLY, playerEventPayload);
        const src = nextTrackEntity.audioTrack.url;
        const currentTime = nextTrackEntity.audioTrack.duration * nextTrackEntity.audioTrack.progress;
        this.playHTML5Player(src, currentTime);
    }
    stopCurrentTrackAutomatically() {
        const { currentTrackEntity } = this.state;
        if (currentTrackEntity) {
            const state = {
                ...this.state,
            };
            const playerEventPayload = {
                state,
            };
            this.emit(PlayerEventTypes.STOP_CURRENT_TRACK_AUTOMATICALLY, playerEventPayload);
            // после фиксации состояния ended переводим состояние в stopped
            this.resetCurrentTrackState();
            if (this.player.duration === Infinity) {
                this.player.src = ''; // если не сбросить src, то в safari прогресс перевалит за 1 и будет постоянно увеличиваться (вызывая событие timeupdate)
            }
        }
    }
    stopCurrentTrackBeforeStartingNewTrack() {
        const { currentTrackEntity, status } = this.state;
        const currentAudioTrack = currentTrackEntity?.audioTrack;
        if (currentAudioTrack && status === 'playing') {
            this.player.pause();
            const playerEventPayload = {
                state: { ...this.state, status: 'stopped' },
            };
            this.emit(PlayerEventTypes.STOP_CURRENT_TRACK_BEFORE_STARTING_NEW_TRACK, playerEventPayload);
            this.resetCurrentTrackState();
        }
        else if (currentAudioTrack && status === 'paused') {
            this.resetCurrentTrackState();
        }
    }
    stopCurrentTrackByError() {
        const { currentTrackEntity } = this.state;
        const currentAudioTrack = currentTrackEntity?.audioTrack;
        if (currentAudioTrack) {
            this.resetCurrentTrackState();
            const playerEventPayload = {
                state: this.state,
            };
            this.emit(PlayerEventTypes.STOP_CURRENT_TRACK_BY_ERROR, playerEventPayload);
        }
    }
    stopPlayer() {
        if (!this.state.currentTrackEntity?.audioTrack) {
            return;
        }
        // остановить проигрывание
        this.pause();
        // сбросить состояние трека
        this.resetCurrentTrackState();
        // сбросить состояние плеера
        this.setState({
            ...this.state,
            currentTrackEntity: undefined,
            playlist: undefined,
        });
    }
    /**
     *
     * @param progress [0, 1]
     */
    seek(progress) {
        const currentState = this.getState();
        const { currentTrackEntity } = currentState;
        const currentAudioTrack = currentTrackEntity?.audioTrack;
        if (!currentAudioTrack) {
            return;
        }
        const nextState = {
            ...currentState,
            currentTrackEntity: {
                ...currentTrackEntity,
                audioTrack: {
                    ...currentAudioTrack,
                    progress,
                },
            },
        };
        this.player.currentTime = currentAudioTrack.duration * progress;
        this.setState(nextState);
    }
    setState(state) {
        this.state = state;
        this.player.volume = state.volume / 100;
        this.player.muted = state.mute;
        this.player.playbackRate = state.playbackRate;
        this.emit('stateupdated', state);
    }
    getState() {
        return { ...this.state };
    }
    forceUpdate(state) {
        this.setState(state);
        this.player.src = state.currentTrackEntity?.audioTrack?.url || SILENCE;
    }
    /**
     *
     * @param value [0, 100]
     */
    setVolume(value) {
        const state = {
            ...this.getState(),
            mute: false,
            volume: value,
        };
        this.setState(state);
    }
    setMute(value) {
        const state = {
            ...this.getState(),
            mute: value,
        };
        this.setState(state);
    }
    setShuffle(value) {
        const curState = this.getState();
        const state = {
            ...curState,
            shuffle: value,
        };
        this.setState(state);
    }
    setRepeatMode(value) {
        const curState = this.getState();
        const state = {
            ...curState,
            repeatMode: value,
        };
        this.setState(state);
    }
    setPlaybackRate(value) {
        const state = this.getState();
        this.setState({ ...state, playbackRate: value });
    }
    playHTML5Player(src, currentTime) {
        if (typeof currentTime === 'number') {
            this.player.currentTime = currentTime;
        }
        if (src && this.player.src !== src) {
            this.player.src = src;
        }
        this.player
            .play()
            .then(() => {
            /**
             * так как сам Player мы считаем синхронным, а вызов this.player.play() асинхронный,
             * то после play() нам нужно обязательно синхронизировать состояние нашего плеера с состоянием this.player
             */
            const state = this.getState();
            if (state.status !== 'playing') {
                this.player.pause();
            }
            if (src && this.player.src !== src) {
                this.player.pause();
            }
        })
            .catch(() => {
            this.stopCurrentTrackByError();
            // logging
        });
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        // пока здесь нечего подчищать
    }
}
//# sourceMappingURL=Player.js.map