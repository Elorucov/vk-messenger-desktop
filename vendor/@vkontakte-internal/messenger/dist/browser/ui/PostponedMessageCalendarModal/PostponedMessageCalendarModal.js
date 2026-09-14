import React, { useMemo, useState } from 'react';
import { CalendarModalNew } from '../../ui/CalendarModal/CalendarModalNew';
import { useNow } from '../../hooks/useNow';
import { Time } from '../../../core/utils/time';
export const PostponedMessageCalendarModal = (props) => {
    const { onClose, onSave, messageSentAt } = props;
    const isValid = (date) => {
        if (date.getTime() - Date.now() < 365 * Time.Day &&
            date.getTime() - Date.now() > Time.Minute) {
            return true;
        }
        return false;
    };
    const now = useNow();
    const [isValidDate, setIsValidDate] = useState(() => messageSentAt ? isValid(new Date(messageSentAt)) : true);
    const today = useMemo(() => {
        const now = new Date(Date.now());
        now.setHours(0, 0, 0, 0);
        return now;
    }, []);
    const maxPostponedTime = useMemo(() => {
        // бэк просто добавляет год как 365 дней  (высокосный или нет не учитывается)
        return new Date(today.getTime() + 365 * Time.Day);
    }, [today]);
    const calcInitialDate = () => {
        if (messageSentAt) {
            return new Date(messageSentAt);
        }
        return new Date(now + Time.Hour);
    };
    const handleDateChange = (date) => {
        setIsValidDate(isValid(date));
    };
    return (React.createElement(CalendarModalNew, { enableTime: true, maxDateTime: maxPostponedTime, minDateTime: today, disableSave: !isValidDate, onSave: onSave, onChange: handleDateChange, withoutTimeButton: true, calcInitialDate: calcInitialDate, onClose: onClose }));
};
//# sourceMappingURL=PostponedMessageCalendarModal.js.map