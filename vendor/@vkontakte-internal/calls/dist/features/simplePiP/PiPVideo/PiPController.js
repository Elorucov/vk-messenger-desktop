export class PiPController {
    constructor(pipCanvas) {
        // Соотношение сторон как у минивью звонков
        this.GENERAL_SIZE = { width: 640 * devicePixelRatio, height: 483 * devicePixelRatio };
        this.WIDE_SIZE = { width: 640 * devicePixelRatio, height: 360 * devicePixelRatio };
        this.displayMode = 'general';
        this.getDisplayMode = () => {
            return this.displayMode;
        };
        this.handleEnterPiP = () => {
            this.isEntered = true;
            this.onEnter();
        };
        this.handleLeavePiP = () => {
            this.isEntered = false;
            this.onLeave();
        };
        this.isEntered = false;
        this.onEnter = () => { };
        this.onLeave = () => { };
        this.pipCanvas = pipCanvas;
    }
    restoreSize() {
        if (this.displayMode === 'wide') {
            return this.pipCanvas.setSize(this.WIDE_SIZE.width, this.WIDE_SIZE.height);
        }
        this.pipCanvas.setSize(this.GENERAL_SIZE.width, this.GENERAL_SIZE.height);
    }
    /**
     * Нужно, чтоб подстраивать видео под нужный формат
     * @param type
     */
    updateDisplayMode(type) {
        this.displayMode = type;
        this.restoreSize();
    }
    start() {
        this.restoreSize();
        if (this.videoElement) {
            this.videoElement.srcObject = this.pipCanvas.stream;
        }
        this.pipCanvas.start();
    }
    stop() {
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        this.pipCanvas.stop();
    }
    updateVideoElement(videoElement) {
        if (this.videoElement) {
            this.videoElement.removeEventListener('enterpictureinpicture', this.handleEnterPiP);
            this.videoElement.removeEventListener('leavepictureinpicture', this.handleLeavePiP);
        }
        this.videoElement = videoElement;
        this.videoElement.srcObject = this.pipCanvas.stream;
        this.videoElement.addEventListener('enterpictureinpicture', this.handleEnterPiP);
        this.videoElement.addEventListener('leavepictureinpicture', this.handleLeavePiP);
    }
    async enter() {
        if (!this.videoElement) {
            return;
        }
        this.restoreSize();
        await this.videoElement.requestPictureInPicture();
    }
    async exit() {
        await document.exitPictureInPicture();
    }
    get documentInPiP() {
        return this.isEntered;
    }
    set onUpdate(fn) {
        this.pipCanvas.onUpdate = fn;
    }
}
//# sourceMappingURL=PiPController.js.map