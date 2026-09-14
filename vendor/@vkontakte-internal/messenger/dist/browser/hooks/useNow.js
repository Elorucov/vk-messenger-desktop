import React, { useCallback, useContext, useEffect, useRef, useState, } from 'react';
const NewNowContext = React.createContext(null);
const DEFAULT_INTERVAL = 1000 * 60;
/**
 * Провайдер для получения в компонентах актуального значения времени через какой-то интревал.
 * Мотивация: раньше каждый компонент сам вызывал setInterval. Множественные вызовы
 * браузерного АПИ setInterval влияют на производительность. В рамках это компонента на какждый
 * уникальный интервал вермени вызывается всего один setInterval, а комопненты уже подписываются на его
 * срабатывание через контекст.
 */
export const NowContextProvider = ({ children, }) => {
    const $intervals = useRef(new Map());
    const subscribeToInterval = useCallback((intervalTime, callback) => {
        let interval = $intervals.current.get(intervalTime);
        if (!interval) {
            interval = {
                intervalId: window.setInterval(() => {
                    const now = Date.now();
                    interval?.callbacks.forEach((cb) => cb(now));
                }, intervalTime),
                callbacks: new Set(),
            };
            $intervals.current.set(intervalTime, interval);
        }
        interval.callbacks.add(callback);
        return () => {
            const interval = $intervals.current.get(intervalTime);
            if (!interval) {
                return;
            }
            interval.callbacks.delete(callback);
            if (interval.callbacks.size === 0) {
                window.clearInterval(interval.intervalId);
                $intervals.current.delete(intervalTime);
            }
        };
    }, []);
    return (React.createElement(NewNowContext.Provider, { value: subscribeToInterval }, children));
};
export function useNow(interval = DEFAULT_INTERVAL) {
    const sub = useContext(NewNowContext);
    if (sub === null) {
        throw new Error('NowContextProvider не добавлен в дерево Реакта!');
    }
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        return sub(interval, setNow);
    }, [interval, sub]);
    return now;
}
//# sourceMappingURL=useNow.js.map