import { Transfer } from 'threads-es';
import { RLottieRenderer } from '../rlottie/renderer';
import { LottieFramesCache } from '../../cache/frames';
import { EventDispatcher } from '../../helpers/eventDispatcher';
import { LottiePlayerDirection } from '../../player/types';
import { getPlayerEventId } from '../../player/utils/getPlayerEventId';
import { fastRequestAnimationFrame } from '../../utils/fastRequestAnimationFrame';
/**
 * @module LottiePlayerWorker
 */
export class LottiePlayerWorker extends EventDispatcher {
    #canvas;
    #context = null;
    #options;
    #cache;
    #renderer;
    #paused = true;
    #destroyed = false;
    #minFrame = 0;
    #maxFrame = 0;
    #loopCount = 0;
    #frameDuration = 0;
    #currentFrame = 0;
    #currentFrameTime = 0;
    /**
     * Обработчик для остановки предыдущего слушателя метода `playTo`
     */
    #playToCancel;
    constructor({ id, canvas, options }) {
        super();
        this.id = id;
        this.#canvas = canvas;
        this.#context = canvas.getContext('2d');
        this.#options = options;
        this.#cache = new LottieFramesCache({
            player: this,
        });
        this.addEventListener('enterFrame', () => {
            this.dispatchEvent('firstFrame');
        }, {
            once: true,
        });
        this.addEventListener('loopComplete', () => {
            if (typeof this.#options.loop !== 'number') {
                return;
            }
            this.#loopCount++;
        });
    }
    /**
     * Возвращает параметры проигрывателя
     */
    get options() {
        return this.#options;
    }
    /**
     * Возвращает статус паузы анимации
     */
    paused() {
        return this.#paused;
    }
    /**
     * Возвращает данные о состоянии проигрывателя
     */
    state() {
        return {
            paused: this.paused(),
            frames: this.#renderer?.frames,
            maxFrame: this.#maxFrame,
            minFrame: this.#minFrame,
            currentFrame: this.#currentFrame,
        };
    }
    /**
     * Устанавливает параметры проигрывателя
     */
    setOptions(options) {
        this.#options = options;
    }
    /**
     * Инициализирует проигрыватель
     */
    async init() {
        this.#renderer = new RLottieRenderer({
            ...this.#options,
            id: this.id,
            width: this.#canvas.width,
            height: this.#canvas.height,
        });
        await this.#renderer.init();
        this.#frameDuration = (this.#renderer.duration / this.#renderer.frames) * 1_000;
        this.reset();
        this.dispatchEvent('ready');
    }
    /**
     * Снимает анимацию с паузы
     */
    play() {
        this.#paused = false;
        this.#processAnimation();
    }
    /**
     * Проигрывает анимацию по заданному промежутку
     */
    playPart({ from, to }) {
        this.pause();
        this.#currentFrame = from - 1;
        return this.playTo({
            frame: to,
            direction: to > from ? LottiePlayerDirection.FORWARD : LottiePlayerDirection.BACKWARD,
        });
    }
    /**
     * Проигрывает анимацию до заданного кадра
     */
    playTo({ frame, speed, direction, immediately }) {
        this.pause();
        if (immediately) {
            return this.#draw({
                index: frame,
            });
        }
        const prevSpeed = this.#options.speed;
        const prevDirection = this.#options.direction;
        this.#options.loop = false;
        this.#options.direction =
            direction ??
                (this.#currentFrame > frame ? LottiePlayerDirection.BACKWARD : LottiePlayerDirection.FORWARD);
        if (speed !== undefined) {
            this.#options.speed = speed;
        }
        this.#setFramesBounds(this.#currentFrame, frame);
        this.#playToCancel?.();
        return new Promise((resolve, reject) => {
            this.#playToCancel = reject;
            this.addEventListener('loopComplete', () => {
                resolve();
            }, {
                once: true,
            });
            this.play();
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
        }).then(() => {
            this.#options.speed = prevSpeed;
            this.#options.direction = prevDirection;
        });
    }
    /**
     * Ставит анимацию на паузу
     */
    pause() {
        this.#playToCancel?.();
        if (this.#paused) {
            return;
        }
        this.#paused = true;
    }
    /**
     * Сбрасывает позицию анимации в начало
     */
    reset() {
        const { startFrameIndex } = this.#options;
        this.#loopCount = 0;
        this.#setFramesBounds();
        if (startFrameIndex !== undefined) {
            this.#currentFrame = startFrameIndex;
        }
        else {
            this.#resetCurrentFrame();
        }
        this.#draw({
            index: this.#currentFrame,
        });
    }
    /**
     * Останавливает анимацию и рисует начальный кадр
     */
    stop() {
        this.pause();
        this.reset();
    }
    /**
     * Уничтожает содержимое кеша
     */
    destroyCache() {
        this.#cache.destroy();
    }
    /**
     * Уничтожает проигрыватель
     */
    destroy() {
        if (this.#destroyed) {
            return;
        }
        this.#destroyed = true;
        this.pause();
        this.destroyCache();
        this.#renderer?.destroy?.();
        this.dispatchEvent('destroy');
        this.removeEventListeners();
    }
    /**
     * Возвращает кадр анимации
     */
    async render(...args) {
        const frame = await this.#renderer?.render(...args);
        if (!frame) {
            return;
        }
        // eslint-disable-next-line new-cap
        return Transfer(frame);
    }
    /**
     * Перерисовывает текущий активный кадр на холсте
     */
    redraw() {
        this.#draw({
            index: this.#currentFrame,
        });
    }
    /**
     * Отправляет событие в главный поток
     */
    dispatchEvent(type, ...args) {
        super.dispatchEvent(type, ...args);
        const message = {
            type: 3, // WorkerMessageType.TaskResult
            uid: getPlayerEventId({
                event: type,
                player: this,
            }),
            result: args[0],
        };
        postMessage(message);
        return this;
    }
    /**
     * Возвращает статус прямого воспроизведения анимации
     */
    get #isForwardDirection() {
        return this.#options.direction === LottiePlayerDirection.FORWARD;
    }
    /**
     * Устанавливает рамки кадров для воспроизведения анимации
     */
    #setFramesBounds(min = 0, max = Number(this.#renderer?.frames) - 1) {
        this.#minFrame = min;
        this.#maxFrame = max;
    }
    #processAnimation(isTick = false) {
        if (this.#paused) {
            return;
        }
        if (!isTick) {
            this.#currentFrameTime = performance.now();
        }
        fastRequestAnimationFrame(this.#animationTickHandler.bind(this));
    }
    get #isAnimationLoopComplete() {
        return this.#isForwardDirection
            ? this.#currentFrame >= this.#maxFrame
            : this.#currentFrame <= this.#minFrame;
    }
    /**
     * Сбрасывает позицию кадра в начало
     */
    #resetCurrentFrame() {
        if (this.#isForwardDirection) {
            this.#currentFrame = this.#minFrame;
        }
        else {
            this.#currentFrame = this.#maxFrame;
        }
    }
    /**
     * Обработчик тика анимации
     */
    async #animationTickHandler() {
        if (this.#isAnimationLoopComplete) {
            this.#resetCurrentFrame();
        }
        const now = performance.now();
        const frameDuration = this.#frameDuration / this.#options.speed;
        const frameDurationDelta = now - this.#currentFrameTime;
        const frameOffset = Math.floor(frameDurationDelta / frameDuration);
        if (frameOffset > 0) {
            await this.#draw({
                index: this.#currentFrame,
            });
            if (this.#isForwardDirection) {
                this.#currentFrame += frameOffset;
            }
            else {
                this.#currentFrame -= frameOffset;
            }
            this.#currentFrameTime += frameOffset * frameDuration;
        }
        if (this.#isAnimationLoopComplete) {
            this.dispatchEvent('loopComplete');
            if (!this.#options.loop) {
                this.#paused = true;
                return;
            }
        }
        if (typeof this.#options.loop === 'number' && this.#loopCount >= this.#options.loop) {
            this.#paused = true;
            return;
        }
        this.#processAnimation(true);
    }
    /**
     * Отрисовывает кадр на холсте
     */
    async #draw(options) {
        const { index } = options;
        if (!this.#canvas || this.#destroyed) {
            return;
        }
        const frame = await this.#getFrame(options);
        // ImageData конвертируется по ходу получения
        if (!frame || frame instanceof ImageData) {
            return;
        }
        if (this.#context) {
            this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
            this.#context.drawImage(frame, 0, 0);
            if (typeof this.#options.color === 'string') {
                this.#context.globalCompositeOperation = 'source-atop';
                this.#context.fillStyle = this.#options.color;
                this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
                this.#context.globalCompositeOperation = 'source-over';
            }
        }
        if (!this.#options.cache && frame instanceof ImageBitmap) {
            frame.close();
        }
        this.dispatchEvent('enterFrame', index);
    }
    /**
     * Возвращает запрашиваемый кадр
     */
    async #getFrame({ index }) {
        let frame = this.#cache.frames.get(index);
        if (frame) {
            return frame;
        }
        frame = await this.#renderer?.render({
            index,
        });
        if (this.#destroyed) {
            return;
        }
        if (frame && this.#options.cache) {
            this.#cache.frames.set(index, frame);
        }
        return frame;
    }
}
//# sourceMappingURL=index.js.map