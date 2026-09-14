import { debounce } from '@vkontakte/vkjs';
export class PopupAnimationObserver {
    constructor() {
        this.isScrolling = false;
        this.isInView = false;
        this.SCROLL_LISTENER_DELAY = 1000;
        this.OBSERVE_LISTENER_DELAY = 500;
        this.onScrollEnd = this.createScrollEndHandler();
        this.onScroll = () => {
            this.isScrolling = true;
            this.onScrollEnd();
        };
        this.onObserveEnd = this.createObserveEndHandler();
    }
    createScrollEndHandler() {
        return debounce(() => {
            this.isScrolling = false;
            if (this.observer && this.isInView) {
                this.handleObserve();
            }
        }, this.SCROLL_LISTENER_DELAY);
    }
    createObserveEndHandler() {
        return debounce((inView) => {
            this.isInView = inView;
            if (this.isInView && !this.isScrolling) {
                this.handleObserve();
            }
        }, this.OBSERVE_LISTENER_DELAY);
    }
    addScrollListeners() {
        document.addEventListener('wheel', this.onScroll, { passive: true });
        document.addEventListener('touchmove', this.onScroll, { passive: true });
    }
    clearScrollListeners() {
        document.removeEventListener('wheel', this.onScroll);
        document.removeEventListener('touchmove', this.onScroll);
    }
    observe(target, callback, onDisconnectTarget, targetId) {
        this.callback = callback;
        if (this.observer) {
            this.clearObserver();
            if (targetId !== this.targetId) {
                this.disconnectCallback?.();
            }
        }
        else {
            this.addScrollListeners();
        }
        this.targetId = targetId;
        this.disconnectCallback = onDisconnectTarget;
        this.observer = new IntersectionObserver((entries) => {
            const lastTarget = entries[entries.length - 1];
            if (lastTarget) {
                this.onObserveEnd(lastTarget.isIntersecting);
            }
        }, {
            rootMargin: '0px',
            threshold: 1.0,
        });
        this.observer.observe(target);
    }
    clearObserver() {
        this.observer?.disconnect();
        this.observer = undefined;
    }
    handleObserve() {
        this.clearScrollListeners();
        this.clearObserver();
        this.callback?.();
        this.callback = undefined;
        this.disconnectCallback = undefined;
    }
}
//# sourceMappingURL=PopupAnimationObserver.js.map