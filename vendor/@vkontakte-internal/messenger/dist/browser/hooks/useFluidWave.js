import { useCallback, useLayoutEffect, useRef, useState, } from 'react';
import { getAudioWave, getAudioWaveSize, getFilledAudioWaveSize, } from '../utils/audio';
export function useFluidWave(duration, waveform, strokeW, height, density, unlimited) {
    /**
     * Поскольку ширина аудиосообщения зависит от ширины родителя,
     * реализовываем его через подписку на ширину, чтобы нарисовать
     * и перерисовать волну, когда она перестает влезать
     *
     * Как это работает:
     * 0) изначально все ширины 0
     * 1) волны нет и включается "линейка" -- псевдоэлемент, растягивающийся
     *    до максимальной доступной ширины под волну
     * 2) изменение ширины тригерит обзервер, фиксирующий максимальную ширину
     *    и высчитывающий волну
     */
    const [wave, setWave] = useState(null);
    const $container = useRef(null);
    const phaseRef = useRef('measure');
    const commitSubRef = useRef(null);
    const maxWidthRef = useRef(0);
    /**
     * возможное отклонение итоговой ширины волны от "идеально влезающего",
     * случается из-за округления значений для рендеринга svg
     */
    const WAVE_LEEWAY = 4;
    useLayoutEffect(() => {
        if (!window.ResizeObserver) {
            return;
        }
        /**
         * Обзервер срабатывает в трех случаях:
         * -- инициализация и начальное состояние, измеряющее доступную для волны область
         * -- изменение размера контейнера рисованием волны
         * -- изменение размера контейнера по другим причинам
         *
         * Поэтому обезервер может находиться в 3х режимах:
         * measure -- фиксирует максимальную доступную ширину
         * commit -- обработка срабатывания после рисования рассчитанной волны
         * ready -- ожидание изменений
         */
        const resizeObserver = new ResizeObserver(([entry]) => {
            if (!entry) {
                return;
            }
            let containerWidth;
            if (entry.contentBoxSize) {
                const contentBoxSize = Array.isArray(entry.contentBoxSize)
                    ? entry.contentBoxSize[0]
                    : entry.contentBoxSize;
                containerWidth = contentBoxSize.inlineSize;
            }
            else {
                containerWidth = entry.contentRect.width;
            }
            containerWidth = Math.floor(containerWidth);
            switch (phaseRef.current) {
                case 'commit': {
                    /**
                     * В этой фазе обрабатывается рисуется расчитанная гибкая волна.
                     *
                     * Если ширина контейнера зависит только от волны, то новая ширина
                     * контейнера будет соответствовать расчетной длине волны.
                     *
                     * Если есть несоответствие, то только в сторону волны меньше
                     * расчетной. В этом случае, чтобы избежать дырок, рисуется волна,
                     * заполняющая все доступное место
                     */
                    if (commitSubRef.current) {
                        commitSubRef.current.skip();
                    }
                    const { width: idealWidth } = getAudioWaveSize(duration, maxWidthRef.current, strokeW, 1 / density);
                    if (idealWidth <= containerWidth &&
                        containerWidth <= idealWidth + WAVE_LEEWAY) {
                        /* Ширина волны близка к ширине контейнера --
                           ожидаемое изменение, ничего не делаем */
                        phaseRef.current = 'ready';
                    }
                    else {
                        /* Подгоняем волну под контейнер, чтобы избежать дырок */
                        setUpWaveRender(containerWidth, 'fill');
                        /* Так как подстроили ширину вручную, то реакция обзервера не требуется (чаще всего он не тригернется) */
                        phaseRef.current = 'ready';
                    }
                    return;
                }
                case 'ready': {
                    /**
                     * В этой фазе обрабатываются изменения ширины контейнера,
                     * не зависящие от механики рисования волны
                     */
                    const { width: waveWidthForMax } = getAudioWaveSize(duration, maxWidthRef.current, strokeW, 1 / density);
                    switch (true) {
                        /**
                         * Ширина контейнера увеличилась выше зафиксированного максимума,
                         * фиксируем новый и заполняем всю ширину волной
                         */
                        case containerWidth > maxWidthRef.current: {
                            maxWidthRef.current = containerWidth;
                            setUpWaveRender(containerWidth, 'fill');
                            return;
                        }
                        /**
                         * Новая ширина контейнера больше расчетной ширины волны,
                         * заполняем всю ширину волной
                         */
                        case waveWidthForMax < containerWidth - WAVE_LEEWAY: {
                            setUpWaveRender(containerWidth, 'fill');
                            return;
                        }
                        /**
                         * Новая ширина контейнера меньше расчетной ширины волны,
                         * в этом случае считаем что максимум сократился, фиксируем новый,
                         * далее волна пересчитывается по новому контейнеру
                         */
                        case waveWidthForMax > containerWidth: {
                            maxWidthRef.current = containerWidth;
                            break;
                        }
                        default: {
                            /**
                             * В остальных случаях считаем, что ширина волны и контейнера
                             * ровны или различаются незначительно, и реакция не требуется
                             */
                            /**
                             * Однако если это запись голосового сообщения, то не
                             * останавливаемся и продолжаем расчет по звуковой волне
                             */
                            if (unlimited) {
                                setUpWaveRender(containerWidth, 'fill');
                            }
                            return;
                        }
                    }
                    break;
                }
                case 'measure': {
                    /**
                     * В этой фазе фиксируется максимальная доступная ширина,
                     * далее волна пересчитывается по этой величине
                     */
                    maxWidthRef.current = containerWidth;
                    break;
                }
                default:
            }
            const newWaveWidth = setUpWaveRender(containerWidth, 'relative');
            if (newWaveWidth >= containerWidth - WAVE_LEEWAY &&
                newWaveWidth <= containerWidth) {
                /* волна заполнит контейнер и реакция обзервера не требуется */
                phaseRef.current = 'ready';
                return;
            }
            /* волна меньше доступной ширины, конечный результат получим на комите */
            phaseRef.current = 'commit';
            /**
             * Если контейнер не меняется после рисования волны комит в обзервере
             * не происходит. Причина в соответствии текущей и максимальной ширин
             * контейнера. Ждем комита или заполняем ширину
             */
            new Promise((resolve, reject) => {
                commitSubRef.current = {
                    skip: reject,
                    timerId: window.setTimeout(() => {
                        resolve();
                        commitSubRef.current = null;
                    }),
                };
            })
                .then(() => {
                if (phaseRef.current === 'commit') {
                    /* Подгоняем волну под контейнер, чтобы избежать дырок */
                    setUpWaveRender(containerWidth, 'fill');
                    /* Так как подстроили ширину вручную, то реакция обзервера не требуется (чаще всего он не тригернется) */
                    phaseRef.current = 'ready';
                }
            })
                .catch(() => {
                if (commitSubRef.current) {
                    window.clearTimeout(commitSubRef.current.timerId);
                }
            })
                .finally(() => {
                commitSubRef.current = null;
            });
        });
        /* Не оборачиваем в колбек, потому что зависимости эффекта условно постоянны */
        function setUpWaveRender(containerWidth, fillMode = 'relative') {
            const calcFunction = fillMode === 'fill' ? getFilledAudioWaveSize : getAudioWaveSize;
            const { bitNumber, width: waveWidth } = calcFunction(duration, containerWidth, strokeW, 1 / density);
            setWave({
                width: waveWidth,
                curve: getAudioWave(waveform, bitNumber, strokeW, 1 / density, height),
            });
            return waveWidth;
        }
        if ($container.current) {
            resizeObserver.observe($container.current);
        }
        return () => resizeObserver.disconnect();
    }, [duration, waveform, height, strokeW, density, unlimited]);
    const resetWave = useCallback(() => {
        if (phaseRef.current !== 'ready' || !wave) {
            return;
        }
        const { bitNumber, width: waveWidthForMax } = getAudioWaveSize(duration, maxWidthRef.current, strokeW, 1 / density);
        if (waveWidthForMax < wave.width) {
            setWave({
                width: waveWidthForMax,
                curve: getAudioWave(waveform, bitNumber, strokeW, 1 / density, height),
            });
        }
    }, [density, duration, height, strokeW, waveform, wave]);
    return {
        $container,
        waveWidth: wave?.width || 0,
        waveCurve: wave?.curve || '',
        isMeasuringActive: !wave?.width,
        resetWave,
    };
}
//# sourceMappingURL=useFluidWave.js.map