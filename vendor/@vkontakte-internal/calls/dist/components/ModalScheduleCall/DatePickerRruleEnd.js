import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":1}]} */
import { memo } from 'react';
import { Calendar, Popover } from '@vkontakte-internal/vkcom-kit';
import { getDateProxy, splitDateAndTime } from '../../hooks/useFormDatePickerValue';
export const DatePickerRruleEnd = memo((props) => {
    return (_jsx(Popover, { content: ({ onClose }) => (_jsx(Calendar, { onChange: (value) => {
                if (!value) {
                    return;
                }
                const { date, time } = splitDateAndTime(value);
                props.handleChangeDatePicker(date, time);
                onClose();
            }, value: getDateProxy({ passedDate: props.date, passedTime: props.time }), minDateTime: props.minDate })), placement: "left-start", strategy: "absolute", usePortal: false, children: _jsx("span", { ref: props.refDropdownTrigger, className: "ModalScheduleCall__select-text" }) }));
});
DatePickerRruleEnd.displayName = 'DatePickerRruleEnd';
//# sourceMappingURL=DatePickerRruleEnd.js.map