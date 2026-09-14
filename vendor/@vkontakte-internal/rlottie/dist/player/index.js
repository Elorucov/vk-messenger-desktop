import { getRandomString } from '@vkontakte/vkjs';
import { LottieDataCache } from '../cache/data';
import { LottiePlayerEventTask } from './eventTask';
import { EventDispatcher } from '../helpers/eventDispatcher';
import { AnimationDataLoadError, EmptyAnimationDataError, InvalidAnimationSizeError } from '../errors';
import { LottiePlayerDirection, } from './types';
import { getElementSize } from '../utils/getElementSize';
import { getPlayerEventId } from './utils/getPlayerEventId';
import { isPlayerEvent } from './utils/isPlayerEvent';
import { loadThreads } from '../utils/loadThreads';
export class LottiePlayer extends EventDispatcher {
    static #events = [
        'ready',
        'destroy',
        'firstFrame',
        'loopComplete',
        'enterFrame',
    ];
    /**
     * Работник, к которому привязан проигрыватель
     */
    #worker;
    /**
     * Параметры проигрывателя
     */
    #options;
    /**
     * Холст для отрисовки кадров
     */
    #canvas;
    #destroyed;
    #initialized;
    #startInitialization;
    #initializePromise;
    constructor(worker, options) {
        super();
        this.id = getRandomString(6);
        /**
         * Холст для отрисовки кадров
         */
        this.#canvas = document.createElement('canvas');
        this.#destroyed = false;
        this.#initialized = false;
        this.#initializePromise = new Promise((resolve) => {
            this.#startInitialization = resolve;
        });
        /**
         * @see {module:LottiePlayerWorker.play}
         */
        this.play = this.#createPlayerMethodProxy('play');
        /**
         * @see {module:LottiePlayerWorker.playPart}
         */
        this.playPart = this.#createPlayerMethodProxy('playPart');
        /**
         * @see {module:LottiePlayerWorker.playTo}
         */
        this.playTo = this.#createPlayerMethodProxy('playTo');
        /**
         * @see {module:LottiePlayerWorker.pause}
         */
        this.pause = this.#createPlayerMethodProxy('pause');
        /**
         * @see {module:LottiePlayerWorker.reset}
         */
        this.reset = this.#createPlayerMethodProxy('reset');
        /**
         * @see {module:LottiePlayerWorker.stop}
         */
        this.stop = this.#createPlayerMethodProxy('stop');
        /**
         * @see {module:LottiePlayerWorker.destroyCache}
         */
        this.destroyCache = this.#createPlayerMethodProxy('destroyCache');
        /**
         * @see {module:LottiePlayerWorker.destroy}
         */
        this.#destroy = this.#createPlayerMethodProxy('destroy');
        /**
         * @see {module:LottiePlayerWorker.paused}
         */
        this.paused = this.#createPlayerMethodProxy('paused');
        /**
         * @see {module:LottiePlayerWorker.state}
         */
        this.state = this.#createPlayerMethodProxy('state');
        /**
         * @see {module:LottiePlayerWorker.redraw}
         */
        this.redraw = this.#createPlayerMethodProxy('redraw');
        /**
         * @see {module:LottiePlayerWorker.render}
         */
        this.#render = this.#createPlayerMethodProxy('render');
        /**
         * @see {module:LottiePlayerWorker.setOptions}
         */
        this.#setOptions = this.#createPlayerMethodProxy('setOptions');
        const { name, loop, color, width, height, speed, cache, autoplay, direction, strictCache, lazyLoading, startFrameIndex, containers: [container], } = options;
        if (!width || !height) {
            const { width, height } = getElementSize(container);
            options.width = width;
            options.height = height;
        }
        if (Number(options.width) <= 0 || Number(options.height) <= 0) {
            throw new InvalidAnimationSizeError();
        }
        this.#worker = worker;
        this.#options = {
            ...options,
        };
        this.#options.containers.forEach((container) => {
            container.appendChild(this.#canvas);
        });
        this.#setName(name);
        this.setLoop(loop);
        this.setCache(cache);
        this.setColor(color);
        this.setSpeed(speed);
        this.#setSize(options);
        this.#setScale(options);
        this.#setCanvas(options);
        this.setAutoplay(autoplay);
        this.setDirection(direction);
        this.setStrictCache(strictCache);
        this.setLazyLoading(lazyLoading);
        this.setStartFrameIndex(startFrameIndex);
        this.#options = new Proxy(this.#options, {
            set: (target, key, value) => {
                target[key] = value;
                this.#setOptions(this.#transferableOptions);
                return true;
            },
        });
        LottiePlayer.#events.forEach((event) => {
            this.#attachEventTask(event);
        });
        this.addEventListener('destroy', this.#destroyHandler.bind(this), {
            once: true,
        });
    }
    /**
     * @see {module:LottiePlayerWorker.destroy}
     */
    #destroy;
    /**
     * @see {module:LottiePlayerWorker.render}
     */
    #render;
    /**
     * @see {module:LottiePlayerWorker.setOptions}
     */
    #setOptions;
    #createPlayerMethodProxy(method) {
        return async (...args) => {
            if (this.#destroyed) {
                return;
            }
            await this.#initializePromise;
            return this.#worker.methods[method](this.id, ...args);
        };
    }
    /**
     * Инициализирует проигрыватель
     */
    init() {
        if (this.#initialized || !this.#startInitialization) {
            return this.#initializePromise;
        }
        const initializePromise = (async () => {
            const [{ Transfer }] = await Promise.all([loadThreads(), this.#loadAnimationUrl()]);
            if (!this.#options.animationData) {
                throw new EmptyAnimationDataError();
            }
            const options = this.#transferableOptions;
            const canvas = this.#canvas.transferControlToOffscreen();
            await this.#worker.methods.createPlayer(
            // eslint-disable-next-line new-cap
            Transfer({
                canvas,
                options,
                id: this.id,
            }, [canvas]));
        })();
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
        initializePromise.then(() => {
            this.#initialized = true;
            if (this.#options.autoplay) {
                this.play();
            }
        });
        this.#startInitialization(initializePromise);
        this.#startInitialization = undefined;
        return this.#initializePromise;
    }
    /**
     * Загружает информацию об анимации по ссылке
     */
    async #loadAnimationUrl() {
        const { animationData, animationUrl } = this.#options;
        if (animationUrl && !animationData) {
            const cachedAnimationData = LottieDataCache.get(animationUrl);
            const animationData = cachedAnimationData ||
                // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax, no-restricted-globals
                (await fetch(animationUrl)
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
                    .then((response) => response.blob())
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
                    .catch(() => null));
            if (!animationData) {
                throw new AnimationDataLoadError();
            }
            if (!cachedAnimationData) {
                LottieDataCache.set(animationUrl, animationData);
            }
            this.#options.animationData = animationData;
        }
    }
    /**
     * Возвращает работника
     */
    get worker() {
        return this.#worker;
    }
    /**
     * Возвращает холст для отрисовки кадров
     */
    get canvas() {
        return this.#canvas;
    }
    /**
     * Возвращает параметры проигрывателя
     */
    get options() {
        return this.#options;
    }
    /**
     * Возвращает обработанные параметры проигрывателя для передачи работнику
     */
    get #transferableOptions() {
        const options = { ...this.#options };
        delete options.containers;
        return options;
    }
    /**
     * Возвращает статус инициализации проигрывателя
     */
    get initialized() {
        return this.#initialized;
    }
    /**
     * Возвращает статус наличия процесса инициализации проигрывателя
     */
    get initializing() {
        return !this.#startInitialization && !this.#initialized;
    }
    show() {
        this.#canvas.style.visibility = 'unset';
    }
    hide() {
        this.#canvas.style.visibility = 'hidden';
    }
    /**
     * Устанавливает параметры проигрывателя
     */
    setOptions(options) {
        Object.assign(this.#options, options);
    }
    /**
     * Устанавливает имя анимации
     */
    #setName(name = this.#options.animationUrl || this.id) {
        this.#options.name = name;
    }
    /**
     * Устанавливает скорость анимации
     */
    setSpeed(speed = 1) {
        if (this.#options.speed === speed) {
            return;
        }
        this.#options.speed = speed;
    }
    /**
     * Устанавливает направление анимации
     */
    setDirection(direction = LottiePlayerDirection.FORWARD) {
        if (this.#options.direction !== direction) {
            this.#options.direction = direction;
        }
    }
    /**
     * Управляет состоянием кеширования
     */
    setCache(cache = true) {
        this.#options.cache = cache;
    }
    /**
     * Управляет состоянием строгого кеширования
     */
    setStrictCache(strictCache = true) {
        this.#options.strictCache = strictCache;
    }
    /**
     * Устанавливает состояние ленивой загрузки
     */
    setLazyLoading(lazyLoading = true) {
        this.#options.lazyLoading = lazyLoading;
    }
    /**
     * Устанавливает статус автоматического проигрывания анимации
     */
    setAutoplay(autoplay = true) {
        this.#options.autoplay = autoplay;
    }
    /**
     * Устанавливает статус зацикливания анимации
     */
    setLoop(loop = true) {
        this.#options.loop = loop;
    }
    /**
     * Устанавливает цвет заполнения анимации
     */
    setColor(color = null) {
        if (Array.isArray(color)) {
            const [r, g, b, a = 1] = color;
            color = `rgba(${r},${g},${b},${a})`;
        }
        else if (color === 'currentColor') {
            color = getComputedStyle(this.#canvas).color;
        }
        this.#options.color = color;
    }
    /**
     * Устанавливает размер анимации
     */
    #setSize({ width, height }) {
        if (width) {
            this.#options.width = Math.trunc(Math.abs(width));
        }
        if (height) {
            this.#options.height = Math.trunc(Math.abs(height));
        }
    }
    /**
     * Устанавливает степень масштабирования
     */
    #setScale({ scale = 1, upscale = true }) {
        this.#options.scale = scale;
        this.#options.upscale = upscale;
        if (upscale && window.devicePixelRatio > 1) {
            this.#options.scale += window.devicePixelRatio - 1;
        }
        this.#canvas.width = this.#options.width * this.#options.scale;
        this.#canvas.height = this.#options.height * this.#options.scale;
        this.#canvas.style.width = `${this.#options.width}px`;
        this.#canvas.style.height = `${this.#options.height}px`;
    }
    /**
     * Устанавливает индекс начального кадра анимации
     */
    setStartFrameIndex(index) {
        if (index !== undefined) {
            this.#options.startFrameIndex = index;
        }
    }
    /**
     * Устанавливает холст для отрисовки кадров анимации
     */
    #setCanvas({ width, height, containers, className }) {
        if (!width || !height) {
            return;
        }
        this.#canvas.dataset.testid = 'lottie';
        this.#options.containers = containers;
        if (className) {
            className.split(' ').forEach((className) => {
                if (!className) {
                    return;
                }
                this.#canvas.classList.add(className);
            });
        }
    }
    /**
     * Возвращает кадр анимации
     */
    async render(...args) {
        const frame = await this.#render(...args);
        if (!frame) {
            return;
        }
        const canvas = new OffscreenCanvas(this.#canvas.width, this.#canvas.height);
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.drawImage(frame, 0, 0);
        return canvas;
    }
    #attachEventTask(event) {
        const eventId = getPlayerEventId({
            event,
            player: this,
        });
        this.#worker['tasks'].set(eventId, new LottiePlayerEventTask(eventId, (payload) => {
            this.#attachEventTask(event);
            this.dispatchEvent(event, payload);
        }));
    }
    /**
     * Уничтожает проигрыватель
     */
    destroy() {
        if (this.initialized) {
            return this.#destroy();
        }
        this.dispatchEvent('destroy');
    }
    #destroyHandler() {
        if (this.#destroyed) {
            return;
        }
        this.#destroyed = true;
        this.#canvas.remove();
        this.removeEventListeners();
        this.#worker['tasks'].forEach((event) => {
            if (!isPlayerEvent({ event, player: this })) {
                return;
            }
            this.#worker['tasks'].delete(event.taskUID);
        });
        if (!this.#options.strictCache) {
            LottieDataCache.outdate(this.#options.animationUrl);
        }
    }
}
//# sourceMappingURL=index.js.map