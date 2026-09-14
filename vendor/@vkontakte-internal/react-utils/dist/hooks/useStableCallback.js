import { useCallback, useLayoutEffect, useRef } from 'react';
/**
 * Хук, возвращающий стабильную ссылку на колбек со свежим замыканием.
 *
 * Она никогда не поменяется, поэтому её можно без опасений использовать внутри других
 * эффектов или передавать в мемоизированные компоненты.
 *
 * При этом на момент вызова функции внутри будет всегда актуальное состояние из внешнего замыкания.
 * Любые переменные (например, из стейта или пропсов) всегда будут иметь свежее значение.
 *
 * В `useCallback` это достигается за счёт массива зависимостей, в этом же хуке их нет совсем.
 */
export function useStableCallback(callback) {
    const callbackRef = useRef(callback);
    useLayoutEffect(() => {
        callbackRef.current = callback;
    });
    return useCallback(
    // @ts-expect-error TS0000: Нужны лучшие типы, но это не влияет на поведение хука снаружи
    (...args) => callbackRef.current?.(...args), [callbackRef]);
}
//# sourceMappingURL=useStableCallback.js.map