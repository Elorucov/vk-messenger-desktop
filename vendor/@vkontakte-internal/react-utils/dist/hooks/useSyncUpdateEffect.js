import { useState } from 'react';
import { shallowEqual } from '@vkontakte-internal/utils';
/**
 * Этот хук синхронно вызывает `callback`, когда зависимости изменились.
 * При первом рендере `callback` не вызывается.
 *
 * Как основной сценарий использования, этот хук позволяет синхронно обновить состояние компонента
 * при изменении пропов. Как результат, текущий рендер будет отброшен, и компонент будет перерендерен синхронно.
 * См. подробнее тут: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 *
 * ВНИМАНИЕ! Не смотря на то, что этот паттерн является стандартным и общепринятым, и он более эффективен, чем
 * асинхронный вариант через useEffect – в большинстве случаев без него можно обойтись.
 * Если вам кажется, что есть необходимость обновить стейт на изменение другого стейта или пропа, то, вероятно,
 * этого можно избежать, если взглянуть на проблему с другой стороны, используя производные данные.
 * Используйте этот хук в качестве крайней меры.
 *
 * @example
 * const [selectedItem, setSelectedItem] = useState(null);
 * useSyncUpdateEffect(() => {
 *   setSelectedItem(null);
 * }, [props.items]);
 */
export function useSyncUpdateEffect(callback, dependencies) {
    const [lastDependencies, setLastDependencies] = useState(dependencies);
    if (!shallowEqual(lastDependencies, dependencies)) {
        setLastDependencies(dependencies);
        callback();
    }
}
//# sourceMappingURL=useSyncUpdateEffect.js.map