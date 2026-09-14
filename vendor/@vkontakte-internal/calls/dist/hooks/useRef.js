import { useRef as reactUserRef } from 'react';
import { getCallable } from '../helpers/helpers';
export const useRef = (defaultValue) => {
    const isSet = reactUserRef(false);
    const value = reactUserRef();
    if (!isSet.current && !value.current) {
        value.current = getCallable(defaultValue);
        isSet.current = true;
    }
    return value;
};
//# sourceMappingURL=useRef.js.map