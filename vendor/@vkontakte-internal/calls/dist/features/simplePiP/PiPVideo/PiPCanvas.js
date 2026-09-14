export class PiPCanvas {
    constructor(frameRate = 25) {
        this.canvas = document.createElement('canvas');
        this.canvasStream = undefined;
        this.currentTime = 0;
        this.currentRaf = 0;
        this.handleUpdate = () => { };
        this.animate = (now) => {
            if (this.currentRaf === 0) {
                return;
            }
            const elapsed = now - this.currentTime;
            if (elapsed > this.fpsInterval) {
                this.currentTime = now - (elapsed % this.fpsInterval);
                this.handleUpdate(this.ctx, this);
            }
            this.currentRaf = requestAnimationFrame(this.animate);
        };
        this.fpsInterval = 1000 / frameRate;
        this.frameRate = frameRate;
        const ctx = this.canvas.getContext('2d', { alpha: false });
        if (ctx) {
            this.ctx = ctx;
        }
        else {
            throw new Error('cannot create 2d context');
        }
    }
    get stream() {
        if (this.canvasStream) {
            return this.canvasStream;
        }
        return (this.canvasStream = this.canvas.captureStream(this.frameRate));
    }
    set onUpdate(fn) {
        this.handleUpdate = fn;
    }
    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    start() {
        this.currentTime = performance.now();
        this.currentRaf = requestAnimationFrame(this.animate);
    }
    stop() {
        cancelAnimationFrame(this.currentRaf);
        this.currentRaf = 0;
    }
}
//# sourceMappingURL=PiPCanvas.js.map