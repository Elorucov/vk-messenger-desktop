import React, { useEffect, useState } from 'react';
import { formatPhoneNumber } from '../../utils/misc';
/**
 * Асинхронно форматирует номер телефона. Выводит сперва переданный номер
 * и после заменяет его на отформатированный.
 */
export const FormattedPhoneNumber = ({ phone, className, }) => {
    const [formattedPhoneNumber, setFormattedPhoneNumber] = useState(phone);
    useEffect(() => {
        formatPhoneNumber(phone)
            .then((result) => setFormattedPhoneNumber(result.international))
            .catch(() => setFormattedPhoneNumber(phone));
    }, [phone]);
    return React.createElement("div", { className: className }, formattedPhoneNumber ?? phone);
};
//# sourceMappingURL=FormattedPhoneNumber.js.map