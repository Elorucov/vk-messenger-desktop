import { useEffect, useRef } from 'react';
const listeners = new Set();
/**
 * Хук, позволяющий подписаться на событие "Клик за пределами компонента".
 * Возвращает ref, который необходимо привязать к целевому элементу.
 * @param listener обработчик события.
 * @param dependencies список зависимостей, определяющих нужно ли обновить обработчик события.
 * @returns ref для элемента, за пределами которого мы хотим слушать клики.
 */
export function useClickOutsideListener(listener, dependencies) {
    const ref = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!ref.current) {
                return;
            }
            if (!ref.current.contains(event.target)) {
                listener(event);
            }
        };
        listeners.add(handleClickOutside);
        if (listeners.size === 1) {
            document.addEventListener('click', handleDocumentClick, true);
        }
        return () => {
            listeners.delete(handleClickOutside);
            if (listeners.size === 0) {
                document.removeEventListener('click', handleDocumentClick, true);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- useClickOutsideListener покрыт этим правилом на уровне конфигурации (см. react-hooks/exhaustive-deps -> additionalHooks)
    }, dependencies);
    return ref;
}
function handleDocumentClick(event) {
    listeners.forEach((listener) => listener(event));
}
//# sourceMappingURL=useClickOutsideListener.js.map