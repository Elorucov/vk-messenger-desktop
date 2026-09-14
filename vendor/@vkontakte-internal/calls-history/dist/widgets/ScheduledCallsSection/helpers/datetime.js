/** возвращает по типу дня - "по рабочим или "по выходным" */
export const getTypeOfDay = (date, getLang) => {
    switch (date.getDay()) {
        case 0:
        case 6:
            return getLang('calls_on_dayoffs'); // по выходным
        default:
            return getLang('calls_on_workdays'); // по рабочим
    }
};
//# sourceMappingURL=datetime.js.map