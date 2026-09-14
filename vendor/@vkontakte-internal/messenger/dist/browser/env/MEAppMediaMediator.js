import { BroadcastChannel } from '../env/BroadcastChannel';
export class MEAppMediaMediator {
    broadcastChannel;
    player = null;
    voicePlayer = null;
    videoMessagePlayer = null;
    currentMedia = null;
    prevMedia = null;
    constructor(peerId) {
        this.broadcastChannel = new BroadcastChannel(peerId);
        this.broadcastChannel.subscribe('audio_start', this.pauseCurrentMedia);
        this.broadcastChannel.subscribe('video_message_start', this.pauseCurrentMedia);
        this.broadcastChannel.subscribe('stories_video_start', this.pauseCurrentMedia);
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        this.broadcastChannel.unsubscribe('audio_start', this.pauseCurrentMedia);
        this.broadcastChannel.unsubscribe('video_message_start', this.pauseCurrentMedia);
        this.broadcastChannel.unsubscribe('stories_video_start', this.pauseCurrentMedia);
        this.broadcastChannel.dispose();
    }
    pauseCurrentMedia = () => {
        if (this.currentMedia?.isPlaying()) {
            this.currentMedia.handleMediaMediatorPause();
        }
    };
    handlePlayerOn = (player) => {
        this.broadcastChannel.emit('audio_start');
        this.player = player;
        if (!this.currentMedia) {
            this.prevMedia = null;
            this.currentMedia = this.player;
        }
        else if (this.currentMedia && this.currentMedia !== this.player) {
            const isCurrentPlayerPlayingRightNow = this.currentMedia.isPlaying();
            if (isCurrentPlayerPlayingRightNow) {
                this.currentMedia.handleMediaMediatorPause();
                this.prevMedia = this.currentMedia;
                this.currentMedia = this.player;
            }
            else {
                this.prevMedia = null;
                this.currentMedia = this.player;
            }
        }
    };
    handleVoicePlayerOn = (voicePlayer) => {
        this.broadcastChannel.emit('audio_start');
        this.voicePlayer = voicePlayer;
        if (!this.currentMedia) {
            this.prevMedia = null;
            this.currentMedia = this.voicePlayer;
        }
        else if (this.currentMedia && this.currentMedia !== this.voicePlayer) {
            const isCurrentPlayerPlayingRightNow = this.currentMedia.isPlaying();
            if (isCurrentPlayerPlayingRightNow) {
                this.currentMedia.handleMediaMediatorPause();
                this.prevMedia = this.currentMedia;
                this.currentMedia = this.voicePlayer;
            }
            else {
                this.prevMedia = null;
                this.currentMedia = this.voicePlayer;
            }
        }
    };
    handleVoicePlayerOff = (voicePlayer) => {
        this.voicePlayer = voicePlayer;
        if (!this.currentMedia || this.currentMedia !== this.voicePlayer) {
            return;
        }
        this.currentMedia = null;
        if (this.prevMedia) {
            this.prevMedia.handleMediaMediatorResume();
            this.currentMedia = this.prevMedia;
            this.prevMedia = null;
        }
    };
    handleVideoMessagePlayerOn = (videoMessagePlayer) => {
        this.broadcastChannel.emit('video_message_start');
        this.videoMessagePlayer = videoMessagePlayer;
        if (!this.currentMedia) {
            this.prevMedia = null;
            this.currentMedia = this.videoMessagePlayer;
        }
        else if (this.currentMedia &&
            this.currentMedia !== this.videoMessagePlayer) {
            const isCurrentPlayerPlayingRightNow = this.currentMedia.isPlaying();
            if (isCurrentPlayerPlayingRightNow) {
                this.currentMedia.handleMediaMediatorPause();
                this.prevMedia = this.currentMedia;
                this.currentMedia = this.videoMessagePlayer;
            }
            else {
                this.prevMedia = null;
                this.currentMedia = this.videoMessagePlayer;
            }
        }
    };
    handleVideoMessagePlayerOff = (videoMessagePlayer) => {
        this.videoMessagePlayer = videoMessagePlayer;
        if (!this.currentMedia || this.currentMedia !== this.videoMessagePlayer) {
            return;
        }
        this.currentMedia = null;
        if (this.prevMedia) {
            this.prevMedia.handleMediaMediatorResume();
            this.currentMedia = this.prevMedia;
            this.prevMedia = null;
        }
    };
    // далее идёт метод обработки вкл записи голосовых
    // он доработан на проверку this.currentMedia и this.prevMedia, так как из-за хаков в записывальщикеГолосовых
    // иногда вызываются подряд два handleVoiceRecorderOn
    handleVoiceRecorderOn = () => {
        this.broadcastChannel.emit('audio_start');
        // костыль: для медиатора ЗаписывальщикГолосовых я вляется null и он его как-будто не видит, так не может его вызывать (иначе получим что в какой-то момент голосовые начнут то записываться, то ставиться на паузу)
        if (!this.currentMedia && this.prevMedia === this.player) {
            return;
        }
        if (!this.currentMedia) {
            this.prevMedia = null;
            this.currentMedia = null;
        }
        else if (this.currentMedia) {
            const isCurrentPlayerPlayingRightNow = this.currentMedia.isPlaying();
            if (isCurrentPlayerPlayingRightNow) {
                this.currentMedia.handleMediaMediatorPause();
                this.prevMedia = this.currentMedia;
                this.currentMedia = null;
            }
            else {
                this.prevMedia = null;
                this.currentMedia = null;
            }
        }
    };
    handleVoiceRecorderOff = () => {
        // возобновляем только если до записи голосового играл плеер песен
        if (this.prevMedia && this.prevMedia === this.player) {
            this.prevMedia.handleMediaMediatorResume();
            this.currentMedia = this.prevMedia;
            this.prevMedia = null;
        }
        else {
            this.currentMedia = null;
            this.prevMedia = null;
        }
    };
}
//# sourceMappingURL=MEAppMediaMediator.js.map