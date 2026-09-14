import { useAdaptivityWithJSMediaQueries } from '@vkontakte/vkui';
import { useViewer } from '../hooks/misc';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { useMemo } from 'react';
/**
 * Для устройств без указателя-мышки (телефоны, планшеты) оставляем только
 * один вариант вызова быстрых действий: кнопка, отображающаяся постоянно.
 *
 * Для всех остальных оставляем выбор: ПКМ или кнопка, отображаемая по ховеру.
 */
export function useFastActionsTrigger() {
    const viewer = useViewer();
    const { fastActionsTriggerFromApi } = viewer.settings;
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    return useMemo(() => {
        if (!hasPointer) {
            return { button: 'tap', rightClick: false };
        }
        switch (fastActionsTriggerFromApi) {
            case 'hover':
                return {
                    button: 'hover',
                    rightClick: false,
                };
            case 'hoverAndRightClick':
                return {
                    button: 'hover',
                    rightClick: true,
                };
            case 'rightClick':
                return {
                    button: false,
                    rightClick: true,
                };
            default:
                exhaustivenessCheck(fastActionsTriggerFromApi);
        }
    }, [fastActionsTriggerFromApi, hasPointer]);
}
//# sourceMappingURL=useFastActionsTrigger.js.map