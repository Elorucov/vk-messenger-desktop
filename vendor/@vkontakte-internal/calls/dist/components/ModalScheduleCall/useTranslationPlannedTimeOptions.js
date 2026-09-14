import { useMemo } from 'react';
import { useLang } from '../../hooks/useLang';
import { useFormSelectValue } from '../../hooks/useFormSelectValue';
import { ETranslationPlannedTimeVariant } from '@vkontakte-internal/calls-core';
export const useTranslationPlannedTimeOptions = ({ initialValue = ETranslationPlannedTimeVariant.EqualToCallTime, setOpenDatePicker, }) => {
    const { getLang } = useLang();
    const options = useMemo(() => [
        {
            value: ETranslationPlannedTimeVariant.EqualToCallTime,
            label: getLang('calls_translation_planned_time_equal_call_time'),
        },
        {
            value: ETranslationPlannedTimeVariant.Custom,
            label: getLang('calls_translation_planned_time_custom'),
        },
    ], []);
    const handleChange = (value) => {
        if (value === ETranslationPlannedTimeVariant.Custom) {
            setOpenDatePicker(true);
        }
    };
    return useFormSelectValue({
        options,
        initialValue,
        onChange: handleChange,
    });
};
//# sourceMappingURL=useTranslationPlannedTimeOptions.js.map