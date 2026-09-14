import { Transfer } from 'threads-es';
import { readBlobAsText } from '../../../../utils/readBlobAs';
import initThorvg from '../../../../../assets/thorvg-wasm';
const thorvg = initThorvg();
/**
 * @module RLottieRendererWorker
 */
export class RLottieRendererWorker {
    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
    #rlottie = thorvg.then(({ TvgLottieAnimation }) => new TvgLottieAnimation('sw', ''));
    #options;
    #frames = 0;
    #duration = 0;
    #destroyed = false;
    constructor(options) {
        this.#options = options;
    }
    static async create({ animationData, ...options }) {
        if (animationData instanceof Blob) {
            animationData = await readBlobAsText(animationData);
        }
        else if (typeof animationData === 'object') {
            animationData = JSON.stringify(animationData);
        }
        const renderer = new RLottieRendererWorker({
            animation: animationData,
            ...options,
        });
        await renderer.init();
        return renderer;
    }
    get frames() {
        return this.#frames;
    }
    get duration() {
        return this.#duration;
    }
    async init() {
        try {
            let { animation, width, height } = this.#options;
            const rlottie = await this.#rlottie;
            const loaded = rlottie.load(animation, 'lottie', width, height, '');
            if (loaded) {
                this.#frames = rlottie.totalFrame();
                this.#duration = rlottie.duration();
                rlottie.resize(width, height);
            }
            return loaded;
        }
        catch {
            return false;
        }
    }
    async render({ index }) {
        try {
            if (this.#destroyed) {
                return;
            }
            const { width, height } = this.#options;
            const rlottie = await this.#rlottie;
            rlottie.frame(index);
            rlottie.update();
            const frame = new ImageData(width, height);
            frame.data.set(rlottie.render());
            // eslint-disable-next-line new-cap
            return Transfer(await createImageBitmap(frame));
        }
        catch { }
    }
    async destroy() {
        try {
            if (this.#destroyed) {
                return;
            }
            this.#destroyed = true;
            const rlottie = await this.#rlottie;
            rlottie.delete();
        }
        catch {
            this.#destroyed = true;
        }
    }
}
//# sourceMappingURL=index.js.map