export class LottieFramesCache {
    /**
     * Существующие экземпляры кеша
     */
    static #instances = new Map();
    #cache;
    #options;
    constructor(options) {
        this.#options = options;
        let cache = LottieFramesCache.#instances.get(this.name);
        if (!cache) {
            cache = new Map();
            LottieFramesCache.#instances.set(this.name, cache);
        }
        this.#cache = cache;
    }
    destroy() {
        this.#cache.forEach((frame) => {
            if (frame instanceof ImageBitmap) {
                frame.close();
            }
        });
        this.#cache.clear();
        LottieFramesCache.#instances.delete(this.name);
    }
    get frames() {
        return this.#cache;
    }
    get name() {
        const { player, name } = this.#options;
        if (name) {
            return name;
        }
        if (player) {
            const { name, width, height } = player.options;
            return String([name, width, height]);
        }
        return '';
    }
}
//# sourceMappingURL=index.js.map