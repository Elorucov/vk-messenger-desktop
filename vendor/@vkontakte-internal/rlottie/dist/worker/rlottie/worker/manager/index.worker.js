import { exposeApi } from 'threads-es';
import { RLottieRendererWorker } from '../renderer';
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RLottieManagerWorker {
    static #renderers = new Map();
    static async createRenderer(options) {
        const { id } = options;
        let renderer = this.#renderers.get(id);
        if (renderer) {
            return;
        }
        renderer = await RLottieRendererWorker.create(options);
        this.#renderers.set(id, renderer);
        return {
            frames: renderer.frames,
            duration: renderer.duration,
        };
    }
    static destroyRenderer({ id }) {
        const renderer = this.#renderers.get(id);
        renderer?.destroy();
        this.#renderers.delete(id);
    }
    static createRendererMethodProxy(method) {
        return (id, ...args) => {
            const renderer = this.#renderers.get(id);
            if (!renderer) {
                throw new Error(`Вызван метод ${method} на несуществующем генераторе кадров`);
            }
            return renderer[method](...args);
        };
    }
}
const rLottieManagerWorker = {
    createRenderer: RLottieManagerWorker.createRenderer.bind(RLottieManagerWorker),
    destroyRenderer: RLottieManagerWorker.destroyRenderer.bind(RLottieManagerWorker),
    render: RLottieManagerWorker.createRendererMethodProxy('render'),
};
exposeApi(rLottieManagerWorker);
//# sourceMappingURL=index.worker.js.map