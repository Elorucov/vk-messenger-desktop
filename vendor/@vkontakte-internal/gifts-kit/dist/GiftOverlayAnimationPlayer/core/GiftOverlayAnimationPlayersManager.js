import { GiftOverlayAnimationPlayer, } from './GiftOverlayAnimationPlayer';
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class GiftOverlayAnimationPlayersManager {
    static #instances = new Map();
    static #containerToPlayerId = new WeakMap();
    static #observer = undefined;
    static #isInitializedListeners = false;
    static #visiblePlayers = new Set();
    constructor() { }
    static initPlayer(config) {
        const { container } = config;
        const existingCanvasId = GiftOverlayAnimationPlayersManager.#containerToPlayerId.get(container);
        const existingPlayer = existingCanvasId
            ? GiftOverlayAnimationPlayersManager.#instances.get(existingCanvasId)
            : undefined;
        if (existingPlayer) {
            return existingPlayer;
        }
        const player = new GiftOverlayAnimationPlayer(config);
        GiftOverlayAnimationPlayersManager.#instances.set(player.id, player);
        GiftOverlayAnimationPlayersManager.#containerToPlayerId.set(config.container, player.id);
        GiftOverlayAnimationPlayersManager.#registerObserver(config.container);
        GiftOverlayAnimationPlayersManager.#initDocumentVisibilityListeners();
        return player;
    }
    static #pauseVisiblePlayers() {
        GiftOverlayAnimationPlayersManager.#visiblePlayers.forEach((playerId) => {
            GiftOverlayAnimationPlayersManager.#instances.get(playerId)?.pauseAnimation();
        });
    }
    static #playVisiblePlayers() {
        GiftOverlayAnimationPlayersManager.#visiblePlayers.forEach((playerId) => {
            GiftOverlayAnimationPlayersManager.#instances.get(playerId)?.playAnimation();
        });
    }
    static #handleDocumentVisibilityChange() {
        if (document.hidden) {
            GiftOverlayAnimationPlayersManager.#pauseVisiblePlayers();
        }
        else {
            GiftOverlayAnimationPlayersManager.#playVisiblePlayers();
        }
    }
    static #initDocumentVisibilityListeners() {
        if (GiftOverlayAnimationPlayersManager.#instances.size &&
            !GiftOverlayAnimationPlayersManager.#isInitializedListeners) {
            GiftOverlayAnimationPlayersManager.#isInitializedListeners = true;
            document.addEventListener('visibilitychange', GiftOverlayAnimationPlayersManager.#handleDocumentVisibilityChange);
        }
    }
    static #removeDocumentVisibilityListeners() {
        if (!GiftOverlayAnimationPlayersManager.#instances.size &&
            GiftOverlayAnimationPlayersManager.#isInitializedListeners) {
            GiftOverlayAnimationPlayersManager.#isInitializedListeners = false;
            document.removeEventListener('visibilitychange', GiftOverlayAnimationPlayersManager.#handleDocumentVisibilityChange);
        }
    }
    static #handleIntersection(entries) {
        entries.forEach((entry) => {
            const canvas = entry.target;
            const playerId = GiftOverlayAnimationPlayersManager.#containerToPlayerId.get(canvas);
            if (!playerId)
                return;
            const player = GiftOverlayAnimationPlayersManager.#instances.get(playerId);
            if (!player)
                return;
            if (entry.isIntersecting) {
                GiftOverlayAnimationPlayersManager.#visiblePlayers.add(player.id);
                if (player.isPaused) {
                    player.playAnimation();
                }
            }
            else {
                GiftOverlayAnimationPlayersManager.#visiblePlayers.delete(player.id);
                if (!player.isPaused) {
                    player.pauseAnimation();
                }
            }
        });
    }
    static #registerObserver(container) {
        if (!GiftOverlayAnimationPlayersManager.#observer) {
            GiftOverlayAnimationPlayersManager.#observer = new IntersectionObserver(GiftOverlayAnimationPlayersManager.#handleIntersection, {
                threshold: 0.1,
                rootMargin: '50px',
            });
        }
        GiftOverlayAnimationPlayersManager.#observer.observe(container);
    }
    static #unregisterObserver(container) {
        if (!GiftOverlayAnimationPlayersManager.#observer) {
            return;
        }
        GiftOverlayAnimationPlayersManager.#observer.unobserve(container);
    }
    static #cleanupObserverIfEmpty() {
        if (!GiftOverlayAnimationPlayersManager.#instances.size) {
            if (GiftOverlayAnimationPlayersManager.#observer) {
                GiftOverlayAnimationPlayersManager.#observer.disconnect;
                GiftOverlayAnimationPlayersManager.#observer = undefined;
            }
        }
    }
    static destroyPlayer(playerId) {
        const player = GiftOverlayAnimationPlayersManager.#instances.get(playerId);
        if (!player)
            return false;
        const container = player.container;
        GiftOverlayAnimationPlayersManager.#unregisterObserver(container);
        GiftOverlayAnimationPlayersManager.#containerToPlayerId.delete(container);
        player.destroy();
        GiftOverlayAnimationPlayersManager.#instances.delete(playerId);
        GiftOverlayAnimationPlayersManager.#cleanupObserverIfEmpty();
        GiftOverlayAnimationPlayersManager.#removeDocumentVisibilityListeners();
        return true;
    }
}
//# sourceMappingURL=GiftOverlayAnimationPlayersManager.js.map