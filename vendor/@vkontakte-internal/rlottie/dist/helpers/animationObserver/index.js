import { AnimationObserverLazyLoad } from './lazyLoad';
import { idleManager } from '../idleManager';
import { isSafari } from '../../utils/isSafari';
import { isIntersectionObserverSupported } from '../../utils/isIntersectionObserverSupported';
/**
 * Отслеживает проигрыватели в зоне видимости и управляет их загрузкой и состоянием проигрывания
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AnimationObserver {
    static #observer;
    /**
     * Остановленные проигрыватели
     */
    static #paused = new Set();
    /**
     * Проигрыватели находящиеся в зоне видимости
     */
    static #visible = new Set();
    /**
     * Основная группа анимаций для проигрывания
     * Анимации во всех остальных группах будут остановлены
     */
    static #primaryGroup;
    /**
     * Группы проигрывателей
     */
    static #groups = {};
    /**
     * Игнорируемые группы для обработки
     */
    static #ignoredGroups = new Set();
    static {
        if (isIntersectionObserverSupported) {
            this.#observer = new IntersectionObserver((entries) => {
                for (const { target, isIntersecting } of entries) {
                    for (const group in this.#groups) {
                        if (!this.#groups.hasOwnProperty(group)) {
                            continue;
                        }
                        const player = [...this.#groups[group]]?.find((player) => player.canvas === target);
                        if (!player) {
                            continue;
                        }
                        const isGroupIgnored = this.#ignoredGroups.has(group);
                        const { initialized, initializing, options: { lazyLoading }, } = player;
                        if (isIntersecting) {
                            if (lazyLoading && !initialized && !initializing) {
                                AnimationObserverLazyLoad.addToQueue(player);
                            }
                            if (isGroupIgnored) {
                                continue;
                            }
                            this.#visible.add(player);
                            this.#checkPlayer({
                                player,
                            });
                        }
                        else {
                            AnimationObserverLazyLoad.removeFromQueue(player);
                            if (!player.canvas.isConnected) {
                                player.destroy();
                            }
                            if (isGroupIgnored) {
                                continue;
                            }
                            this.#visible.delete(player);
                            this.#checkPlayer({
                                player,
                                pause: true,
                            });
                            player.destroyCache();
                        }
                        // В один target не может встраиваться сразу несколько анимаций
                        break;
                    }
                }
            });
        }
        idleManager.addEventListener('change', (isIdle) => {
            this.#checkPlayers({
                idle: isIdle,
            });
        });
    }
    /**
     * Добавляет проигрыватель для отслеживания
     */
    static addPlayer(player) {
        const { canvas, options: { group }, } = player;
        this.#groups[group] ??= new Set();
        const players = this.#groups[group];
        players.add(player);
        this.#observer?.observe(canvas);
    }
    /**
     * Удаляет проигрыватель из отслеживания
     */
    static removePlayer(player) {
        const { canvas, options: { group }, } = player;
        const players = this.#groups[group];
        if (players?.size) {
            players.delete(player);
            if (!players.size) {
                delete this.#groups[group];
            }
        }
        this.#observer?.unobserve(canvas);
        this.#paused.delete(player);
        this.#visible.delete(player);
    }
    /**
     * Устанавливает основную группу анимаций для проигрывания
     * Анимации во всех остальных группах будут остановлены
     */
    static setPrimaryGroup({ group, ...options }) {
        this.#primaryGroup = group;
        this.#checkPlayers(options);
    }
    /**
     * Сбрасывает основную группу анимаций для проигрывания
     * Анимации во всех остальных группах начнут проигрываться
     */
    static resetPrimaryGroup() {
        this.#primaryGroup = undefined;
        this.#checkPlayers();
    }
    /**
     * Добавляет группу в игнор для отслеживания
     */
    static ignoreGroup(groups) {
        if (!Array.isArray(groups)) {
            groups = [groups];
        }
        groups.forEach((group) => {
            this.#ignoredGroups.add(group);
        });
        this.#checkPlayers();
    }
    /**
     * Удаляет группу из игнора для отслеживания
     */
    static removeIgnoredGroup(groups) {
        if (!Array.isArray(groups)) {
            groups = [groups];
        }
        groups.forEach((group) => {
            this.#ignoredGroups.add(group);
        });
        this.#checkPlayers();
    }
    /**
     * Проверяет состояние проигрывания анимаций
     */
    static #checkPlayers(options = {}) {
        const { group } = options;
        const hasGroup = group !== undefined;
        if (hasGroup && !this.#groups[group]) {
            return;
        }
        const groups = hasGroup ? [group] : Object.keys(this.#groups);
        for (const group of groups) {
            const players = this.#groups[group];
            players?.forEach((player) => {
                this.#checkPlayer({
                    player,
                    ...options,
                });
            });
        }
    }
    /**
     * Проверяет состояние проигрывания определенной анимации
     */
    static async #checkPlayer({ player, idle, pause, destroy, destroyCache, }) {
        const { canvas, options: { group }, } = player;
        const isPaused = this.#paused.has(player);
        const isVisible = this.#visible.has(player);
        const isGroupIgnored = this.#ignoredGroups.has(group);
        const isSecondaryGroup = this.#primaryGroup && this.#primaryGroup !== group;
        const isPlayerPaused = await player.paused();
        if (destroy || (!isGroupIgnored && !canvas.isConnected)) {
            this.#removePlayer(player);
            return;
        }
        // В Safari очищается холст при открытии другой вкладки, удалить вызов и сам метод после исправления с их стороны
        if (idle === false && isPlayerPaused && isSafari) {
            player['redraw']();
        }
        if (isGroupIgnored) {
            return;
        }
        if ((pause || idle || isSecondaryGroup) && !isPlayerPaused) {
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax, @vkontakte-internal/vkcom-plugins/no-then
            player.pause().then(() => {
                if (!isSecondaryGroup || !destroyCache) {
                    return;
                }
                player.destroyCache();
            });
            this.#paused.add(player);
            return;
        }
        if (isPaused && isPlayerPaused && isVisible && !isSecondaryGroup) {
            player.play();
            this.#paused.delete(player);
        }
    }
    /**
     * Удаляет проигрыватель из отслеживания
     */
    static #removePlayer(player) {
        const { canvas, options: { group }, } = player;
        player.destroy();
        const players = this.#groups[group];
        if (players?.size) {
            players.delete(player);
            if (!players.size) {
                delete this.#groups[group];
            }
        }
        this.#observer?.unobserve(canvas);
        this.#visible.delete(player);
    }
}
//# sourceMappingURL=index.js.map