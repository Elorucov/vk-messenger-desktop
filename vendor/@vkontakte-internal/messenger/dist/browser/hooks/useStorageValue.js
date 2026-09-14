import { useState, useCallback, useRef, useLayoutEffect } from 'react';
/** Хук для использования и изменения storage.
 * Так как данные из стора присваиваются в value только при монтировании,
 * то синхронизации между вкладками нет. То есть изменив данные в одной
 * вкладке - в соседней вкладке они не обновятся.
 * Мемоизация параметра defaultValue не нужна.
 */
export function useStorageValue(storage, settingName, defaultValue) {
    /**
     * Возвращаем undefined в качестве индикатора того,
     * что настройка еще не считалась из локального хранилища.
     */
    const [value, setValue] = useState();
    const valueRef = useRef(value); // для оптимизации функции setter
    valueRef.current = value;
    /**
     * Не указываем зависимости, обеспечивая дешевизну вызова функции
     * каждый рендер ранним выходом и избегая возможный цикл внутри хука
     */
    // Используем LayoutEffect чтобы исключить возможность дергания макета
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useLayoutEffect(() => {
        if (value !== undefined) {
            return;
        }
        const storageValue = storage.get(settingName);
        setValue(storageValue !== undefined ? storageValue : defaultValue);
    });
    const setter = useCallback((getNewValue) => {
        const newValue = getNewValue(valueRef.current);
        storage.set(settingName, newValue);
        setValue(newValue);
    }, [storage, settingName]);
    return [value, setter];
}
//# sourceMappingURL=useStorageValue.js.map