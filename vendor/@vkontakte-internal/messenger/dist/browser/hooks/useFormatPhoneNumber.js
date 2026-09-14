import { preparePhoneNumber } from '../utils/misc';
import { useCallback, useEffect, useRef, useState } from 'react';
export function useFormatPhoneNumber() {
    const [isReady, setReady] = useState(false);
    const $asYouType = useRef(null);
    useEffect(() => {
        import(/* webpackPrefetch */ 'awesome-phonenumber').then(({ getAsYouType }) => {
            $asYouType.current = getAsYouType('RU');
            setReady(true);
        });
    }, []);
    const format = useCallback((value) => {
        if (!$asYouType.current) {
            return value;
        }
        //Если удалили последний символ, то возвращаем пустую строку
        //Иначе форматтер добавит +
        if (value.length === 0) {
            return '';
        }
        const preparedValue = preparePhoneNumber(value);
        // Удаляем из номера всё кроме "+" и цифр, иначе libphonenumber работает некорректно
        $asYouType.current.reset(preparedValue.replace(/[^\d+]/g, ''));
        //Обязательно тримаем значение после форматирования
        //Иначе в конце останется пробел из-за которого не получится удалить часть номера
        return $asYouType.current.number().trim();
    }, []);
    return {
        isReady,
        format,
    };
}
//# sourceMappingURL=useFormatPhoneNumber.js.map