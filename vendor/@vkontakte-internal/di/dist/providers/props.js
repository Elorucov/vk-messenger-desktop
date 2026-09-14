var _a;
import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, observable } from 'mobx';
import { scope } from '../entitiesDecorators';
// Не символ, т.к. нужна поддержка нескольких рантаймов, в которых символ был бы разным
export const propsAttribute = 'propsAttribute';
/**
 * Контейнер для получения `props` в модели виджета из DI
 *
 * {@link Props.current} является наблюдаемой коллекцией {@link https://mobx.js.org/api.html#observableshallow | (observable.shallow)}.
 *
 * Это означает, что реакции на изменения будут производиться отдельно для каждого параметра, но не глубже.
 */
let Props = class Props {
    static { _a = propsAttribute; }
    constructor() {
        /**
         * Актуальные `props`
         *
         * Яявляется наблюдаемой коллекцией {@link https://mobx.js.org/api.html#observableshallow | (observable.shallow)}.
         *
         * Это означает, что реакции на изменения будут производиться отдельно для каждого параметра, но не глубже.
         */
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.current = {};
        makeAutoObservable(this, {
            current: observable.shallow,
        });
    }
    static { this[_a] = true; }
    /**
     * Устанавливает новые `props`
     *
     * @deprecated в продуктовом коде не вызывать!
     */
    set(props) {
        const current = this.current;
        Object.assign(current, props);
        Object.keys(current).forEach((key) => {
            if (!props.hasOwnProperty(key)) {
                delete current[key];
            }
        });
    }
};
Props = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [])
], Props);
export { Props };
//# sourceMappingURL=props.js.map