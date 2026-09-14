import { throttle } from '@vkontakte/vkjs';
import { CallsEventType, externalIdToString } from '@vkontakte-internal/calls-core';
import { eventBus } from './eventBus';
const DEFAULT_THRESHOLD = 500;
/**
 * Функция которая генерируею обработчик для события `onLocalVolume` от `@vkontakte/calls-sdk`
 * https://st.mycdn.me/static/callssdk/2-1-6/doc/
 * `onLocalVolume` - по умолчанию раз в 0.5 секунды генерирует событие с аргументами:
 * `volume: number` - уровень громкости от 0 до 1
 * `isMicEnabled: boolean` - влючен ли микрофон
 * `localVolumeDetectorGenerator` отдает функцию `localVolumeDetector`, которая с помощью `onVolumeLevelReached`
 *  уведомляет о том, что заданный уровень громкости превышен.
 *
 */
export function localVolumeDetectorGenerator(options) {
    const { onVolumeLevelReached, needCheckMicEnabled, vectorLength, volumeLevelDetection, callbackFactorStep, sensitivityCoefficient, onVolumeLevelUpdated, debugCallback, threshold = DEFAULT_THRESHOLD, } = options;
    const movingAverage = movingAverageGenerator(vectorLength);
    let callbackFactor = 0;
    let lastReached = false;
    return (...args) => {
        if (debugCallback) {
            debugCallback(args);
        }
        const [volume, isMicEnabled] = args;
        if (isMicEnabled && eventBus.has(CallsEventType.LOCAL_MICROPHONE_VOLUME_CHANGED)) {
            eventBus.emit(CallsEventType.LOCAL_MICROPHONE_VOLUME_CHANGED, { level: volume });
        }
        throttle((volume, isMicEnabled) => {
            /** Проверяем, нужно ли подсветить свою рамку */
            const reached = volume > volumeLevelDetection;
            if (lastReached !== reached && onVolumeLevelUpdated) {
                onVolumeLevelUpdated(reached);
            }
            lastReached = reached;
            /** если микрофон был включен - обнуляем `callbackFactor` для снижения порога к умолчанию */
            if (callbackFactor !== 0 && isMicEnabled) {
                callbackFactor = 0;
            }
            const volumeAvg = movingAverage(volume);
            if (!needCheckMicEnabled || !isMicEnabled) {
                /** условие порога, срабатывает если процент превышения звука относительно среднего больше порога зависящего от
                 * среднего шума окружения. Т.е. если средний шум `volumeAvg` высокий - порог будет меньше
                 * (будет более чувствительный), так как голос в шумных местах не сделает большого выброса относительно шума.
                 * Если средний шум низкий - порог увеличивается, чтобы убрать срабатывания при тихих звуках (шорох, вздох и т.д.)
                 * */
                if (volume / volumeAvg > (1 + callbackFactor) / sensitivityCoefficient &&
                    volume > volumeLevelDetection) {
                    callbackFactor += callbackFactorStep;
                    /** `localVolumeDetectorGenerator` отвечает только за отсылку событий `onVolumeLevelReached`.
                     */
                    onVolumeLevelReached();
                }
            }
        }, threshold)(volume, isMicEnabled);
    };
}
export function volumesDetectorGenerator(options) {
    const { onUpdate, volumeLevelDetection, debugCallback, threshold = DEFAULT_THRESHOLD } = options;
    /**
     * отвеачет сколько повторений `speaker` будет отображаться в шапке.
     * нужно для того, чтобы имена не мелькали как рамка говорящего.
     * А были более статичны, чтобы их можно было прочесть.
     * */
    const SPEAKER_IN_HEADER_TIMEOUT = 3;
    let lastSpeakers = {};
    let lastSpeakersInHeader = [];
    let speakersTime = {};
    let speakersInHeader = [];
    return (...args) => {
        if (debugCallback) {
            debugCallback(args);
        }
        throttle((volumes) => {
            /**
             * Здесь мы отнимаем одну итерацию у всех спикеров.
             */
            speakersTime = Object.keys(speakersTime).reduce((acc, id) => {
                if (speakersTime[id] - 1 > 0) {
                    acc[id] = speakersTime[id] - 1;
                }
                return acc;
            }, {});
            /**
             * если добавился говорит новый спикер или уже существующий,
             * то ему выставляем количество итераций = `SPEAKER_IN_HEADER_TIMEOUT`.
             */
            const speakers = volumes.reduce((acc, { uid, volume }) => {
                const id = externalIdToString(uid);
                if (volume > volumeLevelDetection) {
                    acc[id] = true;
                    speakersTime[id] = SPEAKER_IN_HEADER_TIMEOUT;
                }
                return acc;
            }, {});
            speakersInHeader = Object.keys(speakersTime);
            let speakersChanged = false;
            const result = {
                speakers: lastSpeakers,
                speakersInHeader: lastSpeakersInHeader,
            };
            if (!areEqualDictionaries(lastSpeakers, speakers)) {
                result.speakers = speakers;
                lastSpeakers = speakers;
                speakersChanged = true;
            }
            if (!areEqualArrays(lastSpeakersInHeader, speakersInHeader)) {
                result.speakersInHeader = speakersInHeader;
                lastSpeakersInHeader = speakersInHeader;
                speakersChanged = true;
            }
            if (speakersChanged) {
                onUpdate(result);
            }
        }, threshold)(...args);
    };
}
/**
 * Сравнивает на эквивалентность два словаря
 *
 * @param objA
 * @param objB
 */
function areEqualDictionaries(objA, objB) {
    const aKeys = Object.keys(objA);
    const bKeys = Object.keys(objB);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    return aKeys.every((item) => objB[item]);
}
/**
 * Сравнивает на эквивалентность два массива
 *
 * @param arrA
 * @param arrB
 */
function areEqualArrays(arrA, arrB) {
    if (arrA.length !== arrB.length) {
        return false;
    }
    return arrA.every((keyA, id) => keyA === arrB[id]);
}
/**
 * используется алгоритм арифметического скользящего среднего (simple moving average)
 * https://en.wikipedia.org/wiki/Moving_average#Simple_moving_average
 *
 * @param vectorLength количество запоминаемых значений.
 */
export function movingAverageGenerator(vectorLength) {
    const volumeVector = [];
    let volumeSum = 0;
    /** считаем среднее `volumeAvg` за промежуток `vectorLength`
     * `volumeSum` нужна для оптимизации, чтобы каждый раз не считать сумму `volumeVector`
     * */
    return (volume) => {
        volumeVector.push(volume);
        volumeSum += volume;
        if (volumeVector.length > vectorLength) {
            const removedValue = volumeVector.shift();
            volumeSum -= removedValue || 0;
        }
        return volumeSum / volumeVector.length;
    };
}
//# sourceMappingURL=volumeDetector.js.map