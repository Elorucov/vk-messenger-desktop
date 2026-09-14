import { useCallback, useState } from 'react';
import { getCallable } from '../helpers/helpers';
export const useFormCheckboxesValues = ({ name, initialValue, } = {}) => {
    const [checked, setChecked] = useState(() => !!getCallable(initialValue));
    const onChange = useCallback((event) => {
        setChecked(event.target.checked);
    }, []);
    return {
        name,
        checked,
        onChange,
    };
};
//# sourceMappingURL=useFormCheckboxesValues.js.map