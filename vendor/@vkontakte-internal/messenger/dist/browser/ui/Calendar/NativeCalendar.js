import React, { useRef, useLayoutEffect } from 'react';
import { browser } from '../../utils/misc';
export const NativeCalendar = ({ disableFuture, enableTime, value, onChange, }) => {
    const ref = useRef(null);
    const now = new Date();
    useLayoutEffect(() => {
        if (!ref.current)
            return;
        // Меняем значение в эффекте для сохранения uncontrolled state.
        ref.current.value = dateToString(value, enableTime);
        ref.current.focus();
    }, [value, enableTime]);
    const handleDisallowedEvent = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };
    return (React.createElement("input", { type: enableTime ? 'datetime-local' : 'date', defaultValue: "", max: disableFuture ? dateToString(now, enableTime) : '', autoFocus: false, tabIndex: -1, ref: ref, style: {
            color: 'transparent',
            caretColor: 'transparent',
            width: 1,
            height: 1,
            opacity: 0,
        }, onInput: handleDisallowedEvent, onPaste: handleDisallowedEvent, onFocus: () => {
            ref.current?.showPicker();
        }, 
        /**
         * На iOS меняем дату на onBlur, т.к. там onChange вызывается при смене года или месяца, без смены числа
         * Из-за этого не получается выбрать нужную дату
         * На Android onChange вызывается только при подтверждении, там такой проблемы нет.
         * Но там не сбрасывается focus с элемента при подтверждении даты и принудительный вызов blur() тоже не работает.
         *
         * Поэтому мы разделяем логику в зависимости от браузера
         */
        onChange: () => {
            if (!ref.current || browser.ios)
                return;
            onChange?.(stringToDate(ref.current.value));
        }, onBlur: () => {
            if (!ref.current || !browser.ios)
                return;
            onChange?.(stringToDate(ref.current.value));
        } }));
};
/**
 * Конвертирует `Date` в строку, отвечающую требованиям RFC 3339.
 */
function dateToString(value, enableTime) {
    if (!value)
        return '';
    const [date = '', time] = new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
        .format(value)
        .split(',')
        .map((data) => data.trim());
    const [DD, MM, YYYY] = date.split('.');
    if (!DD || !MM || !YYYY)
        return '';
    const dateStr = `${YYYY}-${MM}-${DD}`;
    if (enableTime) {
        return `${dateStr}T${time || '00:00'}`;
    }
    return dateStr;
}
/**
 * Конвертирует значение из строки по RFC 3339 в `Date`. Используется из-за
 * того, что не все браузеры адекватно поддерживают `valueAsDate` в инпутах.
 */
function stringToDate(value) {
    if (!value)
        return;
    const [date, time] = value.split('T');
    if (!date)
        return;
    return new Date(`${date}T${time || '00:00'}`);
}
//# sourceMappingURL=NativeCalendar.js.map