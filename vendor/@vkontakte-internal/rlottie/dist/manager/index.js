import { createArray } from '@vkontakte/vkjs';
import { makeSharedState } from '@vkontakte-internal/utils';
import { LottiePlayer } from '../player';
import { OffscreenCanvasNotSupportedError } from '../errors';
import { AnimationObserver } from '../helpers/animationObserver';
import { isOffscreenCanvasSupported } from '../utils/isOffscreenCanvasSupported';
import { loadThreads } from '../utils/loadThreads';
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class LottieManagerInternal {
    static #WORKERS_COUNT = 4;
    static #observer = AnimationObserver;
    static #prevUsedWorkerIndex = 0;
    static #workers = [];
    static #players = new Set();
    static #initialized = false;
    static #initializePromise;
    static get observer() {
        return this.#observer;
    }
    static init() {
        if (!isOffscreenCanvasSupported) {
            return Promise.reject(new OffscreenCanvasNotSupportedError());
        }
        if (this.#initializePromise) {
            return this.#initializePromise;
        }
        this.#initializePromise = (async () => {
            try {
                const { EsThread } = await loadThreads();
                this.#workers = await Promise.all(createArray(this.#WORKERS_COUNT).map(() => 
                // eslint-disable-next-line new-cap
                EsThread.Spawn(new Worker(new URL('../worker/manager/index.worker', import.meta.url), {
                    type: 'module',
                }))));
            }
            catch (error) {
                throw error;
            }
            this.#initialized = true;
            return;
        })();
        return this.#initializePromise;
    }
    static async loadAnimation(options) {
        if (!this.#initialized) {
            await this.init();
        }
        const player = new LottiePlayer(this.#getWorker(options), options);
        if (!player.options.lazyLoading) {
            await player.init();
        }
        this.#players.add(player);
        this.#observer.addPlayer(player);
        player.addEventListener('destroy', () => {
            this.#players.delete(player);
            this.#observer.removePlayer(player);
        }, {
            once: true,
        });
        return player;
    }
    static #getWorker(options) {
        const animationUrl = options?.animationUrl;
        const animationData = options?.animationData;
        for (const player of this.#players) {
            if (player.options.animationUrl === animationUrl || player.options.animationData === animationData) {
                return player.worker;
            }
        }
        let currentWorkerId = this.#prevUsedWorkerIndex++;
        if (currentWorkerId >= this.#workers.length) {
            currentWorkerId = 0;
            this.#prevUsedWorkerIndex = 0;
        }
        return this.#workers[currentWorkerId];
    }
}
const getLottieManager = makeSharedState('rlottie', () => LottieManagerInternal, {
    version: 3,
});
export const LottieManager = getLottieManager();
//# sourceMappingURL=index.js.map