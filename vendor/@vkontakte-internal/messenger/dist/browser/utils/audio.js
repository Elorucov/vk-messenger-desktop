import { noop } from '../../core/utils/misc';
/**
 * Считает длину волны от длительности в пикселях и столбиках
 * с учетом минимального и максимального ограничения
 *
 * @param duration
 * @param availableWidth
 * @param bitWidth
 * @param bitRate
 */
export function getAudioWaveSize(duration, availableWidth, bitWidth, bitRate) {
    const MIN_BIT = 16;
    const MIN_NORMALIZED_DURATION = 5;
    const MAX_NORMALIZED_DURATION = 30;
    const BIT_SPACE = bitWidth * bitRate;
    /**
     * Нормализуем короткие:
     * минимальное количество столбиков
     */
    if (duration <= MIN_NORMALIZED_DURATION) {
        return { width: MIN_BIT * BIT_SPACE, bitNumber: MIN_BIT };
    }
    const bitNumberAvailable = Math.floor(availableWidth / BIT_SPACE);
    const wAvailable = Math.floor(availableWidth / BIT_SPACE) * BIT_SPACE;
    /* учитываем размер нормализованных коротких, чтобы расти от него */
    /**
     * Нормализуем длинные:
     * количество влезающих в предоставленную ширину
     * или минимальное расчетное количество столбиков */
    if (duration >= MAX_NORMALIZED_DURATION) {
        return {
            width: wAvailable,
            bitNumber: bitNumberAvailable,
        };
    }
    const TAIL_RATE = (bitNumberAvailable - MIN_BIT) /
        (MAX_NORMALIZED_DURATION - MIN_NORMALIZED_DURATION);
    const tailBitNumber = Math.floor(TAIL_RATE * (duration - MIN_NORMALIZED_DURATION));
    const bitNumber = MIN_BIT + tailBitNumber;
    return { width: bitNumber * BIT_SPACE, bitNumber };
}
/**
 * Считает длину волну, заполняющую доступную ширины
 *
 * @param duration
 * @param availableWidth
 * @param bitWidth
 * @param bitRate
 */
export function getFilledAudioWaveSize(duration, availableWidth, bitWidth, bitRate) {
    const BIT_SPACE = bitWidth * bitRate;
    const bitNumberAvailable = Math.floor(availableWidth / BIT_SPACE);
    const wAvailable = Math.floor(availableWidth / BIT_SPACE) * BIT_SPACE;
    return {
        width: wAvailable,
        bitNumber: bitNumberAvailable,
    };
}
/**
 * Строит SVG-шейп по дискретизации волны
 *
 * @param waveForm
 * @param bitCount необходимое количество столбиков
 * @param bitWidth ширина столбика
 * @param bitRate плотность столбиков 1 к N (1 к 2 -- отступ между столбиками равен ширине столбика)
 * @param height высота svg
 */
export function getAudioWave(waveForm, bitCount, bitWidth = 2, bitRate = 2, height = 20) {
    let sampledWave;
    /**
     * Уникальный кейс, когда видео-волна пуста.
     * Иногда бэкенд возвращает пустой массив, и чтобы не отображать
     * пустой аттач с кнопкой, — рисуем пустую волну.
     */
    if (!waveForm.length) {
        sampledWave = Array(1000).fill(0);
    }
    else {
        sampledWave = resampleWave(waveForm, bitCount, 1);
    }
    return sampledWave.reduce((acc, item, i) => {
        const bitOffset = bitWidth * bitRate;
        const bitX = i * bitOffset + bitWidth / 2;
        const bitH = Math.round(Math.max(1, height * item) * 100) / 100;
        const bitY = Math.round(0.5 * (height - bitH) * 100) / 100;
        return `${acc}M${bitX},${bitY}v${bitH}Z`;
    }, '');
}
/**
 * Считает дискретизацию волны под новый rate
 *
 * @param waveForm Оригинальная волна (массив чисел)
 * @param bitCount Количество «столбиков», которое хотим получить
 * @param normalizeTo Нормализация значений волны в диапазон до указанного значения
 * @param precision
 */
export function resampleWave(waveForm, bitCount, normalizeTo, precision = 2) {
    const newWave = [];
    const rate = waveForm.length / bitCount;
    if (rate <= 0) {
        return [];
    }
    let sum = 0;
    let sumQuad = 0;
    let counts = 0;
    let j = 0;
    let max = 0;
    waveForm.forEach((item) => {
        if (j > rate) {
            while (j > rate) {
                j -= rate;
                if (j <= 0.8) {
                    sum += item;
                    sumQuad += item * item;
                    counts++;
                }
                if (counts > 0) {
                    const value = Math.round(Math.sqrt((sumQuad - sum / counts) / counts) * 10 ** precision) /
                        10 ** precision;
                    if (max < value) {
                        max = value;
                    }
                    newWave.push(value);
                }
                sum = sumQuad = counts = 0;
                if (j > 0.2) {
                    sum += item;
                    sumQuad += item * item;
                    counts++;
                }
            }
        }
        else {
            sum += item;
            sumQuad += item * item;
            counts++;
        }
        j++;
    });
    return !normalizeTo
        ? newWave
        : newWave.map((item) => (item * normalizeTo) / Math.max(max, 0.01));
}
/**
 * WebKit браузеры запрещают воспроизводить аудио/видео со звуком, если пользователь
 * не совершал никаких действий на странице (клик, тап и тд).
 * Но если после совершения действия в течение некоторого времени не было запущено аудио,
 * то в дальнейшем аудио для этого элемента не удастся запустить через код.
 * Чтобы это исправить, мы на первое действие пользователя проигрываем аудио с 0 громкостью.
 */
export function safariAudioPlayFix(audioElement) {
    document.body.addEventListener('mousedown', prepareAllSounds);
    function prepareAllSounds() {
        const volumeValue = audioElement.volume;
        audioElement.volume = 0;
        audioElement.play().catch(noop);
        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement.volume = volumeValue;
        document.body.removeEventListener('mousedown', prepareAllSounds);
    }
}
//# sourceMappingURL=audio.js.map