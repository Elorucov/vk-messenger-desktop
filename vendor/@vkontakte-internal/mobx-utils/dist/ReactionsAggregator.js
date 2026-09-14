import { autorun, reaction } from 'mobx';
/**
 * Аггрегатор реакций для mobx
 *
 * Полезен, в случаях, когда необходимо уничтожать сразу множество реакций
 */
export class ReactionsAggregator {
    #isDestroyed = false;
    #disposers = new Set();
    /**
     * Добавляет reaction
     */
    reaction(expression, effect, options) {
        this.#assertNotDestroyed();
        const disposer = reaction(expression, effect, options);
        this.#disposers.add(disposer);
        return this;
    }
    /**
     * Добавляет autorun
     */
    autorun(view, options) {
        this.#assertNotDestroyed();
        const disposer = autorun(view, options);
        this.#disposers.add(disposer);
        return this;
    }
    /**
     * Отписывает все добавленные реакции
     */
    dispose() {
        for (const disposer of this.#disposers) {
            disposer();
        }
        this.#disposers.clear();
    }
    /**
     * Уничтожает агрегатор
     *
     * * Отписываются все добавленные реакции
     * * Попытка добавить новые реакции будет приводить к исключению
     */
    destroy() {
        this.dispose();
        this.#isDestroyed = true;
    }
    #assertNotDestroyed() {
        if (this.#isDestroyed) {
            throw new Error('ReactionsAggregator is destroyed');
        }
    }
}
//# sourceMappingURL=ReactionsAggregator.js.map