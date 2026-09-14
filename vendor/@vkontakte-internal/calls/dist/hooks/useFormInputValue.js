import { useRef, useState, useEffect, useCallback } from 'react';
export const useFormInputValue = ({ initialValue, validator }) => {
    const [value, setValue] = useState((initialValue || ''));
    const [error, setError] = useState(false);
    const touched = useRef(false);
    /** отрабатываем инпут */
    const handleChange = useCallback((e) => {
        touched.current = true;
        setValue(e.target.value);
    }, []);
    const clearValue = () => setValue('');
    useEffect(() => {
        if (!touched.current || !validator) {
            return;
        }
        setError(validator(value));
    }, [value, validator]);
    return {
        value,
        error,
        onChange: handleChange,
        clearValue,
    };
};
//# sourceMappingURL=useFormInputValue.js.map