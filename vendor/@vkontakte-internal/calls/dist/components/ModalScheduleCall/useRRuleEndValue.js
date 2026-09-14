import { useState, useMemo, useCallback, useRef } from 'react';
import { useFormSelectValue, } from '../../hooks/useFormSelectValue';
import { useChosenDateText } from '../../hooks/useFormDatePickerValue';
import { useLang } from '../../hooks/useLang';
var EOption;
(function (EOption) {
    EOption[EOption["Never"] = 0] = "Never";
    EOption[EOption["Date"] = 1] = "Date";
})(EOption || (EOption = {}));
export const useRRuleEndValue = ({ recurrenceUntilTime, date, time, onChange }) => {
    const { getLang } = useLang();
    const { getChosenDateText } = useChosenDateText();
    /** "нажиматель" для вызова дропдауна */
    const refDropdownTrigger = useRef(null);
    const [isDateSelected, setIsDateSelected] = useState(!!recurrenceUntilTime);
    const handleChangeDatePicker = useCallback((nextDate, nextTime) => {
        setIsDateSelected(true);
        onChange(nextDate, nextTime);
    }, [onChange]);
    const handleChangeSelect = useCallback((value) => {
        switch (value) {
            case EOption.Date: {
                refDropdownTrigger.current?.click?.();
                break;
            }
            case EOption.Never: {
                setIsDateSelected(false);
                break;
            }
        }
    }, []);
    const options = useMemo(() => {
        return [
            {
                value: EOption.Never,
                // никогда
                label: getLang('calls_never'),
            },
            {
                value: EOption.Date,
                label: isDateSelected
                    ? getLang('calls_change_date') // изменить дату
                    : getLang('calls_choose_date'), // выбрать дату
            },
        ];
    }, [date, isDateSelected]);
    /** контект компонента `<Select />` */
    const selectProps = useFormSelectValue({
        options,
        initialValue: () => {
            if (recurrenceUntilTime) {
                return EOption.Date;
            }
            return EOption.Never;
        },
        onChange: handleChangeSelect,
    });
    /** отображаемый заголовок в `<Select />` */
    const placeholder = (() => {
        switch (selectProps.value) {
            case EOption.Date:
                return getChosenDateText(date, time, true);
            default:
                return selectProps.label;
        }
    })();
    /** выбранное пользователем значение, для прокидывания в ajax */
    const value = (() => {
        switch (selectProps.value) {
            case EOption.Date:
                return date;
            default:
                return null;
        }
    })();
    return {
        date,
        time,
        handleChangeDatePicker,
        selectProps,
        refDropdownTrigger,
        placeholder,
        value,
    };
};
//# sourceMappingURL=useRRuleEndValue.js.map