var _a;
import { EsThread } from 'threads-es';
export class RLottieRenderer {
    // eslint-disable-next-line new-cap
    static #worker = EsThread.Spawn(new Worker(new URL('../worker/manager/index.worker', import.meta.url), {
        type: 'module',
    })).catch(() => null);
    #initializePromise;
    #options;
    #frames;
    #duration;
    constructor(options) {
        this.#frames = 0;
        this.#duration = 0;
        /**
         * @see {module:RLottieRendererWorker.paused}
         */
        this.render = this.#createRendererMethodProxy('render');
        this.#options = options;
        this.#initializePromise = _a.#worker
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
            .then((worker) => worker?.methods.createRenderer(options))
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
            .then((renderer) => {
            if (!renderer) {
                return;
            }
            const { frames, duration } = renderer;
            this.#frames = frames;
            this.#duration = duration;
        });
    }
    init() {
        return this.#initializePromise;
    }
    async destroy() {
        const worker = await _a.#worker;
        return worker?.methods.destroyRenderer(this.#options);
    }
    get frames() {
        return this.#frames;
    }
    get duration() {
        return this.#duration;
    }
    #createRendererMethodProxy(method) {
        return async (...args) => {
            const worker = await _a.#worker;
            await this.#initializePromise;
            if (!worker) {
                throw new Error('The worker is required!');
            }
            return worker.methods[method](this.#options.id, ...args);
        };
    }
}
_a = RLottieRenderer;
//# sourceMappingURL=index.js.map