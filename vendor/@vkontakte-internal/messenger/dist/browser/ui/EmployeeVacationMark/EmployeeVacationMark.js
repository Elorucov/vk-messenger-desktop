import '../../ui/EmployeeVacationMark/EmployeeVacationMark.css';
import React from 'react';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useDispatch, useOwner } from '../../hooks/misc';
import { Icon16PlaneOutline } from '@vkontakte/icons';
import cx from 'classnames';
import { useNow } from '../../hooks/useNow';
export const EmployeeVacationMark = ({ peer, isShort = false, hasSeparator = false, hasName = false, hasIcon = false, capitalize = false, className, Wrapper, }) => {
    const owner = useOwner();
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    // Обновляем раз в минуту для оперативного реагирования на момент окончания отпуска
    const now = useNow(1000 * 60);
    const isFavourite = Peer.isFavorites(peer.id, owner.id);
    const vacationEndDate = peer?.kind === 'User' && Peer.vacationEndDate(peer);
    const businessTripEndDate = peer?.kind === 'User' && Peer.businessTripEndDate(peer);
    const endDate = vacationEndDate || businessTripEndDate;
    if (!endDate || isFavourite) {
        return null;
    }
    // Отпуска и командировки приходят как 00:00 даты начала\окончания по московскому времени.
    // Во избежание сдвига даты на день назад для таймзон < UTC+3 добавляем разницу между текущей таймзоной и UTC+3.
    // Риски смены московской таймзоны с UTC+3 считаем незначительными.
    const moscowOffset = (new Date(now).getTimezoneOffset() + 180) * 60 * 1000;
    // Для более удобной работы сдвинем дату окончания отпуска с 00:00:00 целевого дня на 23:59:59
    const endOfTheDayOffset = (24 * 60 * 60 - 1) * 1000;
    const endDateMoscow = endDate + moscowOffset + endOfTheDayOffset;
    const nowMoscow = now + moscowOffset;
    // Считаем отпуск просроченным в 23:59:59 даты окончания по UTC+3
    if (nowMoscow - endDateMoscow >= 0) {
        dispatch({ type: 'VacationMarkExpired', userId: peer.id });
        return null;
    }
    const namePart = hasName ? Peer.firstName(peer) + ' ' : '';
    const longLangKey = businessTripEndDate
        ? 'me_employee_businesstrip_till'
        : 'me_employee_vacation_till';
    const shortLangKey = businessTripEndDate
        ? 'me_employee_businesstrip'
        : 'me_employee_vacation';
    const EmployeeMark = (React.createElement("span", { className: cx(className, 'EmployeeVacationMark', {
            'EmployeeVacationMark--businessTrip': businessTripEndDate,
            'EmployeeVacationMark--vacation': vacationEndDate,
        }) },
        hasIcon && (React.createElement("span", { className: "EmployeeVacationMark__icon" },
            React.createElement(Icon16PlaneOutline, null))),
        hasSeparator && React.createElement("span", null, "\u00A0\u1427\u00A0"),
        React.createElement("span", { className: cx('EmployeeVacationMark__text', {
                'EmployeeVacationMark__text--capitalize': capitalize,
            }) }, `${namePart}${isShort ? lang.use(shortLangKey) : lang.use(longLangKey, { now: nowMoscow, date: endDateMoscow })}`)));
    if (Wrapper) {
        return React.createElement(Wrapper, null, EmployeeMark);
    }
    return EmployeeMark;
};
//# sourceMappingURL=EmployeeVacationMark.js.map