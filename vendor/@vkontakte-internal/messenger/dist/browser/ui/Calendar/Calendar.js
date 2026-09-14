import React, { useCallback, useState } from 'react';
import { Icon24CalendarOutline } from '@vkontakte/icons';
import { Calendar as VKUICalendar, LocaleProvider as VKUILocaleProvider, } from '@vkontakte/vkui';
import cx from 'classnames';
import { browser } from '../../utils/misc';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { NativeCalendar } from './NativeCalendar';
import './Calendar.css';
export const Calendar = ({ locale, value, onChange, dropdownContentClassname, variant, }) => {
    const [isCalendarOpened, setIsCalendarOpened] = useState(false);
    const supportsNative = isNative(variant);
    const handleDateChange = useCallback((date) => {
        setIsCalendarOpened(false);
        // Используем нативное поведение на соответствующих устройствах.
        if (supportsNative) {
            onChange(date);
            return;
        }
        if (!date) {
            return;
        }
        // тоггл даты (второе нажатие по дате сбрасывает дату)
        const val = date.toString() === value?.toString() ? undefined : date;
        onChange(val);
    }, [supportsNative, value, onChange]);
    const handleClose = useCallback(() => setIsCalendarOpened(false), []);
    const handleOpen = useCallback(() => setIsCalendarOpened(true), []);
    return (React.createElement(Dropdown, { classNames: {
            wrapper: 'Calendar',
            contentWrapper: dropdownContentClassname,
        }, adaptive: true, openType: "click", open: isCalendarOpened, onClose: handleClose, onOpen: handleOpen, content: supportsNative ? (React.createElement(NativeCalendar, { value: value, onChange: handleDateChange, disableFuture: true })) : (React.createElement(VKUILocaleProvider, { value: locale },
            React.createElement(VKUICalendar, { value: value, onChange: handleDateChange, disableFuture: true, size: "m", className: "Calendar__container" }))) },
        React.createElement("button", { className: cx('Calendar__button', {
                Calendar__buttonIndicator: value,
            }) },
            React.createElement(Icon24CalendarOutline, null))));
};
const SUPPORTS_NATIVE_PICKER = 'showPicker' in window.HTMLInputElement.prototype;
/**
 * Определяем вариант для отрисовки исходя из возможностей
 * устройства пользователя.
 */
function isNative(variant) {
    switch (variant) {
        case 'native':
            return SUPPORTS_NATIVE_PICKER;
        case 'auto':
            return browser.mobile && SUPPORTS_NATIVE_PICKER;
        // Отображаем календарь от VK UI по умолчанию.
        default:
            return false;
    }
}
//# sourceMappingURL=Calendar.js.map