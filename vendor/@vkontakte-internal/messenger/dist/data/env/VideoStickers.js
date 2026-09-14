export class VideoStickers {
    listeners = [];
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }
    send(data) {
        this.listeners.forEach((listener) => listener(data));
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        // пока нечего подчищать
    }
}
//# sourceMappingURL=VideoStickers.js.map