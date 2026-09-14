// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LottieDataCache {
    static #OUTDATED_CACHE_LIFETIME = 5 * 60 * 1_000;
    static #cache = new Map();
    static #outdated = new Map();
    /**
     * Устанавливает элемент
     */
    static set(url, data) {
        this.#cache.set(url, data);
    }
    /**
     * Возвращает элемент
     */
    static get(url) {
        this.#outdated.delete(url);
        this.#checkOutdated();
        return this.#cache.get(url);
    }
    /**
     * Удаляет элемент
     */
    static delete(url) {
        this.#cache.delete(url);
    }
    /**
     * Добавляет элемент в устаревший список
     */
    static outdate(url) {
        if (!this.#cache.has(url)) {
            return;
        }
        this.#outdated.set(url, Date.now());
    }
    /**
     * Проверяет актуальность устаревших элементов
     */
    static #checkOutdated() {
        for (const [url, date] of this.#outdated) {
            if (Date.now() - date <= this.#OUTDATED_CACHE_LIFETIME) {
                continue;
            }
            this.#cache.delete(url);
            this.#outdated.delete(url);
        }
    }
}
//# sourceMappingURL=index.js.map