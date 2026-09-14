import { EventDispatcher } from '../eventDispatcher';
import { isTouchSupported } from '../../utils/isTouchSupported';
export class IdleManager extends EventDispatcher {
    static #focusEventName = isTouchSupported ? 'touchstart' : 'mousemove';
    #isIdle = true;
    #focusPromise = Promise.resolve();
    #focusResolve = () => { };
    constructor() {
        super();
        if (typeof window === 'undefined') {
            return;
        }
        window.addEventListener('blur', () => {
            this.#setIsIdle(true);
            window.addEventListener('focus', () => {
                this.#setIsIdle(false);
            }, {
                once: true,
            });
        });
        window.addEventListener(IdleManager.#focusEventName, () => {
            this.#setIsIdle(false);
        }, {
            once: true,
            passive: true,
        });
        this.addEventListener('change', (idle) => {
            if (!idle) {
                this.#focusResolve();
                return;
            }
            this.#focusPromise = new Promise((resolve) => {
                this.#focusResolve = resolve;
            });
        });
    }
    get focusPromise() {
        return this.#focusPromise;
    }
    get isIdle() {
        return this.#isIdle;
    }
    #setIsIdle(value) {
        if (this.#isIdle === value) {
            return;
        }
        this.#isIdle = value;
        this.dispatchEvent('change', value);
    }
}
export const idleManager = new IdleManager();
//# sourceMappingURL=index.js.map