import { getRandomString } from '../helpers';
class LoadAssetError extends Error {
    constructor() {
        super('Не удалось загрузить ассет, используется заглушка');
    }
}
export class GiftOverlayAnimationPlayer {
    // Конфиг
    #config;
    // Область канваса разделяется на cекции как пирог, которые заполняются звездами
    #SECTION_COUNT;
    // Скорость вращения всех секций
    #GLOBAL_ROTATION_SPEED;
    // Скорость спавна частиц во время фазы после взрыва
    #PARTICLE_SPAWN_RATE;
    // Диапазон скорости вращения частицы
    #MIN_PARTICLE_RORATION_SPEED;
    #MAX_PARTICLE_RORATION_SPEED;
    // Диапазон скорости частицы
    #MIN_PARTICLE_BASE_SPEED;
    #MAX_PARTICLE_BASE_SPEED;
    // Движение частицы описано синусоидой, частота и амплитуда – параметры формулы колебания
    #SINE_FREQUENCY;
    #DEFAULT_SINE_AMPLITUDE;
    // Диапазон прозрачности частицы
    #MIN_PARTICLE_PEAK_ALPHA;
    #MAX_PARTICLE_PEAK_ALPHA;
    // Жизненный цикл частицы разделен на появление и исчезание, их длительность можно немного регулировать. Но важно учитывать, что при достижении progress = 1 частица исчезнет
    #FADE_IN_DURATION;
    #FADE_OUT_START;
    // Количество частиц во время фазы взрыва
    #EXPLOSION_PARTICLES_COUNT;
    // Исходное ускорение глобального времени – нужно для создания эффекта взрыва частиц
    #INITIAL_TIME_MULTIPLIER;
    // Коэффициент замедления времени (затухания взрыва)
    #EXPLOSION_DECAY;
    #DEG_TO_RAD;
    // Состояние
    #timeMultiplier;
    #globalAngle;
    #centerX;
    #centerY;
    #maxRadius;
    #isExploded;
    #isPaused;
    // Ассеты
    #particleImagePath;
    #particleImage;
    #defaultSvgString;
    // Пул объектов
    #activeParticles;
    #particlesPool;
    #sectionDeck;
    // Canvas и контекст
    #canvas;
    #ctx;
    #animationId;
    #lastTime;
    #frameAccumulator;
    #devicePixelRatio;
    #container;
    constructor(config) {
        this.id = getRandomString(6);
        // Область канваса разделяется на cекции как пирог, которые заполняются звездами
        this.#SECTION_COUNT = 12;
        // Скорость вращения всех секций
        this.#GLOBAL_ROTATION_SPEED = 0.4;
        // Скорость спавна частиц во время фазы после взрыва
        this.#PARTICLE_SPAWN_RATE = 0.07;
        // Диапазон скорости вращения частицы
        this.#MIN_PARTICLE_RORATION_SPEED = 1;
        this.#MAX_PARTICLE_RORATION_SPEED = 1;
        // Диапазон скорости частицы
        this.#MIN_PARTICLE_BASE_SPEED = 0.001;
        this.#MAX_PARTICLE_BASE_SPEED = 0.0025;
        // Движение частицы описано синусоидой, частота и амплитуда – параметры формулы колебания
        this.#SINE_FREQUENCY = 0.03;
        this.#DEFAULT_SINE_AMPLITUDE = 20;
        // Диапазон прозрачности частицы
        this.#MIN_PARTICLE_PEAK_ALPHA = 150;
        this.#MAX_PARTICLE_PEAK_ALPHA = 255;
        // Жизненный цикл частицы разделен на появление и исчезание, их длительность можно немного регулировать. Но важно учитывать, что при достижении progress = 1 частица исчезнет
        this.#FADE_IN_DURATION = 0.3;
        this.#FADE_OUT_START = 0.7;
        // Количество частиц во время фазы взрыва
        this.#EXPLOSION_PARTICLES_COUNT = 50;
        // Исходное ускорение глобального времени – нужно для создания эффекта взрыва частиц
        this.#INITIAL_TIME_MULTIPLIER = 18.0;
        // Коэффициент замедления времени (затухания взрыва)
        this.#EXPLOSION_DECAY = 0.97;
        this.#DEG_TO_RAD = 0.0174532925;
        // Состояние
        this.#timeMultiplier = this.#INITIAL_TIME_MULTIPLIER;
        this.#globalAngle = 0;
        this.#centerX = 0;
        this.#centerY = 0;
        this.#maxRadius = 0;
        this.#isExploded = false;
        this.#isPaused = true;
        this.#defaultSvgString = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#fff"><path d="M9.121 3.544c-.514-1.604-.77-2.406-.914-2.485a.36.36 0 0 0-.396 0c-.143.08-.399.882-.91 2.488-.306.962-.678 1.796-1.115 2.233-.438.438-1.272.809-2.235 1.115-1.608.512-2.413.768-2.492.91a.36.36 0 0 0 0 .397c.079.143.882.4 2.49.915.963.308 1.799.681 2.237 1.119s.81 1.27 1.117 2.23c.51 1.596.766 2.395.908 2.473.143.08.253.08.396 0 .143-.078.4-.876.913-2.471.309-.96.682-1.793 1.121-2.232.44-.44 1.274-.815 2.235-1.127 1.592-.517 2.388-.776 2.466-.919a.36.36 0 0 0-.001-.396c-.08-.142-.878-.396-2.474-.902-.957-.304-1.788-.674-2.226-1.112s-.81-1.273-1.12-2.236"/></svg>';
        // Пул объектов
        this.#activeParticles = [];
        this.#particlesPool = [];
        this.#sectionDeck = [];
        this.#animationId = undefined;
        this.#lastTime = 0;
        this.#frameAccumulator = 0;
        // Функция обработки кадра RAF
        this.#animationFrame = (timestamp) => {
            if (!this.#lastTime) {
                this.#lastTime = timestamp;
            }
            const deltaTime = timestamp - this.#lastTime;
            this.#lastTime = timestamp;
            // Физика и рендеринг независимы
            this.#updatePhysics(deltaTime);
            // Рендеринг оптимизируется под нужное количество кадров для слабых устройств
            if (this.#shouldDrawFrame()) {
                this.#draw();
            }
            if (this.#isPaused) {
                return;
            }
            this.#animationId = requestAnimationFrame(this.#animationFrame);
        };
        this.#devicePixelRatio = window.devicePixelRatio ?? 1;
        this.#container = config.container;
        this.#config = {
            particleMinSize: config.particleMinSize ?? 8,
            particleMaxSize: config.particleMaxSize ?? 18,
            targetFps: config.targetFps ?? 60,
        };
        if (config.particleImage) {
            this.#particleImage = config.particleImage;
        }
        else if (config.particleImagePath) {
            this.#particleImagePath = config.particleImagePath;
        }
        if (!this.#particleImage && !this.#particleImagePath) {
            this.#particleImagePath = `data:image/svg+xml;base64,${btoa(this.#defaultSvgString)}`;
        }
        this.#canvas = document.createElement('canvas');
        this.setSize(config.width, config.height);
        config.container.appendChild(this.#canvas);
        const context = this.#canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context');
        }
        this.#ctx = context;
        this.#initialize();
    }
    #drawDefaultParticle() {
        this.#ctx.beginPath();
        this.#ctx.moveTo(9.121, 3.544);
        this.#ctx.bezierCurveTo(8.607, 1.94, 8.351, 1.138, 8.207, 1.059);
        this.#ctx.bezierCurveTo(8.064, 1.059, 7.808, 1.138, 7.297, 3.544);
        this.#ctx.bezierCurveTo(6.991, 4.506, 6.619, 5.34, 6.182, 5.777);
        this.#ctx.bezierCurveTo(5.744, 6.215, 4.91, 6.586, 3.947, 6.892);
        this.#ctx.bezierCurveTo(2.339, 7.404, 1.534, 7.66, 1.455, 7.802);
        this.#ctx.bezierCurveTo(1.376, 7.945, 1.376, 8.055, 1.455, 8.198);
        this.#ctx.bezierCurveTo(1.534, 8.341, 2.336, 8.598, 3.944, 9.113);
        this.#ctx.bezierCurveTo(4.907, 9.421, 5.743, 9.794, 6.181, 10.232);
        this.#ctx.bezierCurveTo(6.619, 10.67, 6.99, 11.504, 7.297, 12.466);
        this.#ctx.bezierCurveTo(7.807, 14.062, 8.063, 14.861, 8.205, 14.939);
        this.#ctx.bezierCurveTo(8.348, 15.019, 8.458, 15.019, 8.601, 14.939);
        this.#ctx.bezierCurveTo(8.744, 14.861, 9.001, 14.063, 9.514, 12.469);
        this.#ctx.bezierCurveTo(9.823, 11.509, 10.196, 10.676, 10.635, 10.237);
        this.#ctx.bezierCurveTo(11.075, 9.797, 11.909, 9.422, 12.87, 9.11);
        this.#ctx.bezierCurveTo(14.462, 8.593, 15.258, 8.334, 15.336, 8.191);
        this.#ctx.bezierCurveTo(15.415, 8.048, 15.414, 7.938, 15.336, 7.795);
        this.#ctx.bezierCurveTo(15.256, 7.653, 14.458, 7.398, 12.862, 6.892);
        this.#ctx.bezierCurveTo(11.905, 6.588, 11.074, 6.218, 10.636, 5.78);
        this.#ctx.bezierCurveTo(10.198, 5.342, 9.826, 4.507, 9.516, 3.544);
        this.#ctx.closePath();
        this.#ctx.fillStyle = '#fff';
        this.#ctx.fill();
    }
    #loadParticleImage() {
        return new Promise((resolve, reject) => {
            if (!this.#particleImagePath || this.#particleImage) {
                resolve();
                return;
            }
            this.#particleImage = new Image();
            this.#particleImage.src = this.#particleImagePath;
            if (!this.#particleImage) {
                resolve();
                return;
            }
            this.#particleImage.onload = () => resolve();
            this.#particleImage.onerror = () => {
                this.#particleImage = undefined;
                reject(new LoadAssetError());
            };
        });
    }
    async #initialize() {
        await this.#initializeGraphics();
        this.#refillDeck();
        this.playAnimation();
    }
    async #initializeGraphics() {
        await this.#loadParticleImage();
    }
    #createParticle(sectionIndex, progress, baseSpeed, height, peakAlpha, sinePhase, selfRotationAngle, selfRotationSpeed, curveAngleTotal, amplitude) {
        return {
            sectionIndex,
            progress,
            baseSpeed,
            height,
            peakAlpha,
            sinePhase,
            selfRotationAngle,
            selfRotationSpeed,
            curveAngleTotal,
            amplitude,
        };
    }
    // Заполнить массив индексов секций в случайном порядке
    #refillDeck() {
        this.#sectionDeck = [];
        for (let i = 0; i < this.#SECTION_COUNT; i++) {
            this.#sectionDeck.push(i);
        }
        this.#shuffleArray(this.#sectionDeck);
    }
    #shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    #getRandomValueInRange(min, max) {
        const minDecimals = min.toString().split('.')[1]?.length || 0;
        const maxDecimals = max.toString().split('.')[1]?.length || 0;
        const decimals = Math.max(minDecimals, maxDecimals);
        const factor = 10 ** decimals;
        const minInt = Math.round(min * factor);
        const maxInt = Math.round(max * factor);
        const randomInt = Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
        return randomInt / factor;
    }
    // Создание объекта частицы
    #spawnParticleInternal(section, forceExplosion) {
        const particleHeight = this.#config.particleMinSize +
            Math.random() * (this.#config.particleMaxSize - this.#config.particleMinSize);
        const speed = this.#getRandomValueInRange(this.#MIN_PARTICLE_BASE_SPEED, this.#MAX_PARTICLE_BASE_SPEED);
        const peakAlpha = this.#getRandomValueInRange(this.#MIN_PARTICLE_PEAK_ALPHA, this.#MAX_PARTICLE_PEAK_ALPHA);
        const rotationSpeed = forceExplosion
            ? this.#getRandomValueInRange(this.#MIN_PARTICLE_RORATION_SPEED * 2, this.#MAX_PARTICLE_RORATION_SPEED * 2)
            : this.#getRandomValueInRange(this.#MIN_PARTICLE_RORATION_SPEED, this.#MAX_PARTICLE_RORATION_SPEED);
        const startProgress = forceExplosion ? Math.random() * 0.15 : 0;
        const currentAmplitude = forceExplosion ? 0 : this.#DEFAULT_SINE_AMPLITUDE;
        const curveAngle = forceExplosion ? Math.random() * 120 - 60 : 0;
        const particle = this.#createParticle(section, startProgress, speed, particleHeight, peakAlpha, Math.random() * Math.PI * 2, 0, rotationSpeed, curveAngle, currentAmplitude);
        this.#activeParticles.push(particle);
    }
    // Подготовить частицы по секциям
    #spawnParticleRegular() {
        if (this.#sectionDeck.length === 0) {
            this.#refillDeck();
        }
        if (this.#sectionDeck.length > 0) {
            const sectionIndex = this.#sectionDeck.pop();
            if (sectionIndex) {
                this.#spawnParticleInternal(sectionIndex, false);
            }
        }
    }
    // Подготавливает физику частиц для взрыва
    #triggerExplosion() {
        const explosionDeck = [];
        const particlesPerSection = Math.ceil(this.#EXPLOSION_PARTICLES_COUNT / this.#SECTION_COUNT);
        for (let i = 0; i < this.#SECTION_COUNT; i++) {
            for (let j = 0; j < particlesPerSection; j++) {
                explosionDeck.push(i);
            }
        }
        this.#shuffleArray(explosionDeck);
        let count = 0;
        while (count < this.#EXPLOSION_PARTICLES_COUNT && explosionDeck.length > 0) {
            const index = explosionDeck.pop();
            if (index) {
                this.#spawnParticleInternal(index, true);
                count++;
            }
        }
    }
    // Обновляет глобальную физику – изменяет скорость (для взрыва), угол вращения всего канваса, подготавливает объекты частиц
    #updatePhysics(deltaTime) {
        // Обновление физики рассчитано на 60 фпс, если была задержка/опережение – определяем эту дельту и рассчитываем с этим условием
        // Если была долгая задержка (вероятноее всего пауза), то пропускаем кадр
        const normalizedDelta = deltaTime < 500 ? deltaTime / 16.67 : 0;
        // Замедление времени после взрыва
        if (this.#timeMultiplier > 1.0) {
            this.#timeMultiplier *= this.#EXPLOSION_DECAY ** normalizedDelta;
            if (this.#timeMultiplier < 1.0) {
                this.#timeMultiplier = 1.0;
            }
        }
        this.#globalAngle = (this.#globalAngle + this.#GLOBAL_ROTATION_SPEED * normalizedDelta) % 360;
        // Создание объектов частицы
        const currentSpawnRate = this.#timeMultiplier > 1 ? this.#PARTICLE_SPAWN_RATE * this.#timeMultiplier : this.#PARTICLE_SPAWN_RATE;
        if (Math.random() < currentSpawnRate * normalizedDelta) {
            this.#spawnParticleRegular();
        }
        // Обновление параметров частиц
        for (let i = this.#activeParticles.length - 1; i >= 0; i--) {
            const particle = this.#activeParticles[i];
            particle.progress += particle.baseSpeed * this.#timeMultiplier * normalizedDelta;
            particle.selfRotationAngle =
                (particle.selfRotationAngle + particle.selfRotationSpeed * normalizedDelta) % 360;
            if (particle.progress >= 1.0) {
                this.#activeParticles.splice(i, 1);
                this.#particlesPool.push(particle);
            }
        }
    }
    // Отрисовка всех объектов
    #draw() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#activeParticles.forEach((particle) => {
            this.#drawParticle(particle);
        });
    }
    // Вычисляет координаты частицы и рисует ее
    #drawParticle(particle) {
        const cycleProgress = particle.progress;
        let currentAlpha = 0;
        let currentScalePct = 1;
        if (cycleProgress < this.#FADE_IN_DURATION) {
            const t = cycleProgress / this.#FADE_IN_DURATION;
            currentAlpha = particle.peakAlpha * t;
            currentScalePct = t;
        }
        else if (cycleProgress > this.#FADE_OUT_START) {
            const range = 1.0 - this.#FADE_OUT_START;
            const t = (cycleProgress - this.#FADE_OUT_START) / range;
            currentAlpha = particle.peakAlpha * (1 - t);
            currentScalePct = 1 - t;
        }
        else {
            currentAlpha = particle.peakAlpha;
            currentScalePct = 1;
        }
        if (currentAlpha <= 0)
            return;
        const localX = particle.progress * this.#maxRadius;
        const localY = particle.amplitude * Math.sin(localX * this.#SINE_FREQUENCY + particle.sinePhase);
        const curveOffset = particle.curveAngleTotal * particle.progress;
        const sectionAngleDeg = particle.sectionIndex * (360 / this.#SECTION_COUNT) + this.#globalAngle + curveOffset;
        const sectionAngleRad = sectionAngleDeg * this.#DEG_TO_RAD;
        const destX = localX * Math.cos(sectionAngleRad) - localY * Math.sin(sectionAngleRad);
        const destY = localX * Math.sin(sectionAngleRad) + localY * Math.cos(sectionAngleRad);
        this.#ctx.save();
        this.#ctx.translate(this.#centerX + destX, this.#centerY + destY);
        this.#ctx.rotate(particle.selfRotationAngle * this.#DEG_TO_RAD);
        this.#ctx.globalAlpha = currentAlpha / 255;
        this.#ctx.globalCompositeOperation = 'lighter';
        if (!this.#particleImage) {
            const scale = currentScalePct * (particle.height / 16) * this.#devicePixelRatio;
            this.#ctx.scale(scale, scale);
            this.#drawDefaultParticle();
        }
        else {
            const scale = currentScalePct * (particle.height / this.#particleImage.height) * this.#devicePixelRatio;
            this.#ctx.scale(scale, scale);
            this.#ctx.drawImage(this.#particleImage, -this.#particleImage.width / 2, -this.#particleImage.height / 2);
        }
        this.#ctx.restore();
    }
    // Функция обработки кадра RAF
    #animationFrame;
    #shouldDrawFrame() {
        this.#frameAccumulator += this.#config.targetFps / 60;
        if (this.#frameAccumulator >= 1) {
            this.#frameAccumulator -= 1;
            return true;
        }
        return false;
    }
    playAnimation() {
        if (!this.#isExploded) {
            this.#triggerExplosion();
            this.#isExploded = true;
        }
        this.#isPaused = false;
        if (!this.#animationId) {
            this.#animationId = requestAnimationFrame(this.#animationFrame);
        }
    }
    pauseAnimation() {
        this.#isPaused = true;
        if (this.#animationId) {
            cancelAnimationFrame(this.#animationId);
            this.#animationId = undefined;
        }
    }
    restartAnimation() {
        this.#particlesPool.push(...this.#activeParticles);
        this.#activeParticles = [];
        this.#refillDeck();
        this.#timeMultiplier = this.#INITIAL_TIME_MULTIPLIER;
        this.#triggerExplosion();
    }
    destroy() {
        this.pauseAnimation();
        this.#canvas.remove();
    }
    setSize(width, height) {
        this.#canvas.width = width * this.#devicePixelRatio;
        this.#canvas.height = height * this.#devicePixelRatio;
        this.#canvas.style.width = `${width}px`;
        this.#canvas.style.height = `${height}px`;
        this.#centerX = this.#canvas.width / 2;
        this.#centerY = this.#canvas.height / 2;
        this.#maxRadius = (Math.min(this.#canvas.width, this.#canvas.height) / 2) * 1.2;
    }
    get isPaused() {
        return this.#isPaused;
    }
    get container() {
        return this.#container;
    }
}
//# sourceMappingURL=GiftOverlayAnimationPlayer.js.map