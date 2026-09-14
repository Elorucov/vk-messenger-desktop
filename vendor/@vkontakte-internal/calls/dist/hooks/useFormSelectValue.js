import { useCallback, useState, useMemo } from 'react';
import { useLang } from './useLang';
export const useFormSelectValue = ({ initialValue, options, onChange, }) => {
    const { getLang } = useLang();
    const [value, setValue] = useState(initialValue || options[0]?.value);
    const handleChange = useCallback((next) => {
        const value = next.value;
        setValue(value);
        onChange?.(value);
    }, []);
    const label = useMemo(() => {
        const el = options.find((item) => item.value === value);
        return el ? el.label : '';
    }, [value, options]);
    return {
        value,
        onChange: handleChange,
        options,
        label,
        searchPlaceholder: getLang('calls_search_empty_list'),
        setValue,
    };
};
//# sourceMappingURL=useFormSelectValue.js.map