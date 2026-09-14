import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":1}]} */
import { memo } from 'react';
import { getDateProxy, splitDateAndTime, } from '../../hooks/useFormDatePickerValue';
import { Calendar, Popover } from '@vkontakte-internal/vkcom-kit';
import { classNames as cn } from '@vkontakte/vkjs';
export const DatePicker = memo(({ minDate, maxDate, disabled, disableTimeSelect, openByDefault, ...dateCtx }) => (_jsx(Popover, { content: ({ onClose }) => (_jsx(Calendar, { onChange: (value) => {
            if (!value) {
                return;
            }
            const { date, time } = splitDateAndTime(value);
            dateCtx.onChange(date, time);
        }, value: getDateProxy({ passedDate: dateCtx.date, passedTime: dateCtx.time }), minDateTime: minDate, maxDateTime: maxDate, enableTime: !disableTimeSelect, onDoneButtonClick: onClose })), placement: "left-start", strategy: "absolute", defaultShown: openByDefault, usePortal: false, children: _jsx("span", { className: cn('ModalScheduleCall__select-text', 'ModalScheduleCall__select-text--datepicker', {
            'ModalScheduleCall__select-text--disabled': !!disabled,
        }), children: dateCtx.chosenDateText }) })));
DatePicker.displayName = 'DatePickerForScheduledCall';
//# sourceMappingURL=DatePicker.js.map