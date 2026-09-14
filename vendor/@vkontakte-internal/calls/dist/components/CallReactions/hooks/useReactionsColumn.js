import { useCallback, useRef, useEffect } from 'react';
import { ArrayDequeue } from '@vkontakte/calls-sdk';
import { isEqual } from '@vkontakte/vkjs';
import { useIsMounted } from '@vkontakte-internal/react-utils';
import { CALL_MAX_H, CALL_MIN_H } from '../../../constants';
import { minmax, createImmediate } from '../../../helpers/helpers';
import { useRef as customUseRef } from '../../../hooks/useRef';
const ANIMATION_SPEED = [
    [4000, 600],
    [3000, 450],
    [2000, 300],
];
export const useReactionsColumn = ({ refCall, onAdd }) => {
    const isMounted = useIsMounted();
    const prevStartTs = useRef(0);
    const currTimeout = useRef(null);
    const coeff = useCoeff(refCall);
    /** очередь еще не вызванных реакций */
    const queue = customUseRef(() => new ArrayDequeue(100));
    /** скорость анимаций и задержка между анимациями */
    const animationSpeed = useRef(ANIMATION_SPEED[0][0]);
    const minimalDelay = useRef(ANIMATION_SPEED[0][1]);
    const isWaitForCurrQueueClear = useRef(false);
    // реакции для отрисовки
    const reactions = useRef([]);
    /**
     * @private
     */
    const updateAnimationSpeed = () => {
        const prev = animationSpeed.current;
        const left = queue.current.left;
        if (left >= 30) {
            animationSpeed.current = ANIMATION_SPEED[2][0];
            minimalDelay.current = ANIMATION_SPEED[2][1];
        }
        else if (left >= 20) {
            animationSpeed.current = ANIMATION_SPEED[1][0];
            minimalDelay.current = ANIMATION_SPEED[1][1];
        }
        else {
            animationSpeed.current = ANIMATION_SPEED[0][0];
            minimalDelay.current = ANIMATION_SPEED[0][1];
        }
        if (coeff.current) {
            minimalDelay.current += Math.floor(((1 - coeff.current) * minimalDelay.current) / 3);
        }
        if (!isEqual(prev, animationSpeed.current) && !!reactions.current) {
            isWaitForCurrQueueClear.current = prev > animationSpeed.current;
            return true;
        }
    };
    const onAnimationEnd = (id) => {
        reactions.current = reactions.current.filter((r) => r.id !== id);
    };
    /**
     * @private
     *
     * запланировать анимацию показа следующей реакции
     */
    const scheduleAnimation = () => {
        if (currTimeout.current || !queue.current.left || !isMounted()) {
            return;
        }
        if (isWaitForCurrQueueClear.current) {
            if (!reactions.current.length) {
                isWaitForCurrQueueClear.current = false;
            }
            scheduleTimeout(minimalDelay.current);
            return;
        }
        /** прошло времени с момента вызова последней реакции */
        const timeLeft = Date.now() - prevStartTs.current;
        if (timeLeft > minimalDelay.current) {
            prevStartTs.current = Date.now();
            if (updateAnimationSpeed()) {
                scheduleAnimation();
                return;
            }
            const currReaction = queue.current.next();
            // если экран не видно - пропускаем рендер элемента, тк
            // в неактивных вкладках css анимации стоят на паузе
            if (currReaction && document.visibilityState === 'visible') {
                currReaction.animationSpeed = animationSpeed.current;
                currReaction.onAnimationEnd = onAnimationEnd;
                reactions.current.push(currReaction);
                onAdd(currReaction);
            }
            scheduleAnimation();
            return;
        }
        scheduleTimeout(minimalDelay.current - timeLeft);
    };
    /**
     * @private
     */
    function scheduleTimeout(timeout) {
        currTimeout.current = setTimeout(() => {
            currTimeout.current = null;
            scheduleAnimation();
        }, timeout);
    }
    const add = useCallback((reactions) => {
        createImmediate(() => {
            if (Array.isArray(reactions)) {
                for (const reaction of reactions) {
                    queue.current.add(reaction);
                }
            }
            else {
                queue.current.add(reactions);
            }
            updateAnimationSpeed();
            scheduleAnimation();
        });
    }, []);
    return { add };
};
/** коэффициент для корректировки скорости задержки в зависимости от высоты контейнера `section.Call` */
function useCoeff(refCall) {
    const coeff = useRef(0);
    useEffect(() => {
        if (!refCall.current)
            return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { height } = entry.contentRect;
                // сначала проверяем в рамках рейнджа размера окна звонка
                if (minmax(height, CALL_MIN_H, CALL_MAX_H)) {
                    const total = CALL_MAX_H - CALL_MIN_H;
                    const progress = height - CALL_MIN_H;
                    coeff.current = progress / total;
                    continue;
                }
                // не смотря на то, что в css стоит мин высота 500
                // иногда окно может быть чуть меньше (например, 498px)
                // ИЛИ может быть включен режим fullscreen
                // поэтому тут просто делаем максимальное замедление
                if (height < CALL_MIN_H) {
                    coeff.current = 0.001;
                    continue;
                }
                // если ничего не помогло =)
                coeff.current = 0;
            }
        });
        ro.observe(refCall.current);
        return () => {
            ro.disconnect();
        };
    }, []);
    return coeff;
}
//# sourceMappingURL=useReactionsColumn.js.map