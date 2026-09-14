import { useMemo } from 'react';
import { useLang } from '../../hooks/useLang';
import { useFormSelectValue } from '../../hooks/useFormSelectValue';
import { ERepeatCallVariant } from '@vkontakte-internal/calls-core';
import { getOptionText } from './utils';
/**
 * должен вернуть список опций для отрисовки в селекте
 * "повторять звонок", в зависимости от выбранной пользователем
 * даты
 *
 * например:
 * ```
 *  'Каждый день',
 *  'Каждую неделю, по понедельникам',
 *  'Каждую неделю, в рабочие дни',
 *  '18 числа каждого месяца',
 *  'По понедельникам на 3-й неделе месяца',
 *  'Каждый год',
 * ```
 */
export const useRepeatCallOptions = ({ date, initialValue = ERepeatCallVariant.Never }) => {
    const { getLang } = useLang();
    const options = useMemo(() => {
        return [
            {
                value: ERepeatCallVariant.Never,
                label: getOptionText(date, ERepeatCallVariant.Never, getLang),
            },
            {
                value: ERepeatCallVariant.Daily,
                label: getOptionText(date, ERepeatCallVariant.Daily, getLang),
            },
            {
                value: ERepeatCallVariant.Weekly,
                label: getOptionText(date, ERepeatCallVariant.Weekly, getLang),
            },
            {
                value: ERepeatCallVariant.WeeklyOnDayType,
                label: getOptionText(date, ERepeatCallVariant.WeeklyOnDayType, getLang),
            },
            {
                value: ERepeatCallVariant.Monthly,
                label: getOptionText(date, ERepeatCallVariant.Monthly, getLang),
            },
            {
                value: ERepeatCallVariant.Yearly,
                label: getOptionText(date, ERepeatCallVariant.Yearly, getLang),
            },
        ];
    }, [date]);
    return useFormSelectValue({
        options,
        initialValue,
    });
};
//# sourceMappingURL=useRepeatCallOptions.js.map