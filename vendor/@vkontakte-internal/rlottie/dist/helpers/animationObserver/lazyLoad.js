import { throttle } from '@vkontakte/vkjs';
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AnimationObserverLazyLoad {
    /**
     * Лимит одновременной обработки проигрывателей при ленивой загрузке
     */
    static #PROCESSING_LIMIT = 8;
    /**
     * Очередь ленивой загрузки
     */
    static #queue = new Set();
    /**
     * Проигрыватели обрабатываемые ленивой загрузкой
     */
    static #processing = new Set();
    /**
     * Добавляет проигрыватель в очередь для обработки ленивой загрузки
     */
    static addToQueue(player) {
        this.#queue.add(player);
        this.#processQueue();
    }
    static removeFromQueue(player) {
        this.#queue.delete(player);
    }
    /**
     * Запускает обработку очереди ленивой загрузки
     */
    static #processQueue = throttle(this.#processQueueHandler.bind(this), 20);
    static #processQueueHandler() {
        if (!this.#queue.size || this.#processing.size) {
            return;
        }
        while (this.#processing.size < this.#PROCESSING_LIMIT && this.#queue.size) {
            const player = [...this.#queue].shift();
            if (!player) {
                continue;
            }
            this.#queue.delete(player);
            this.#processPlayer(player);
        }
    }
    /**
     * Загружает проигрыватель при обработке через ленивую загрузку
     */
    static async #processPlayer(player) {
        this.#processing.add(player);
        try {
            await player.init();
        }
        catch (err) {
            console.error(err);
        }
        this.#processing.delete(player);
        this.#processQueue();
    }
}
//# sourceMappingURL=lazyLoad.js.map