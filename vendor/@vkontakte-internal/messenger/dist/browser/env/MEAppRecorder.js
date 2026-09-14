import { Recorder } from '../env/Recorder';
export class MEAppRecorder extends Recorder {
    mediaMediator;
    constructor(config = {}, mediaMediator, logger) {
        super(config, logger);
        this.mediaMediator = mediaMediator;
    }
    start() {
        this.mediaMediator.handleVoiceRecorderOn();
        return super.start();
    }
    pause() {
        const val = super.pause();
        this.mediaMediator.handleVoiceRecorderOff();
        return val;
    }
    resume() {
        this.mediaMediator.handleVoiceRecorderOn();
        return super.resume();
    }
    stop() {
        const val = super.stop();
        this.mediaMediator.handleVoiceRecorderOff();
        return val;
    }
}
//# sourceMappingURL=MEAppRecorder.js.map