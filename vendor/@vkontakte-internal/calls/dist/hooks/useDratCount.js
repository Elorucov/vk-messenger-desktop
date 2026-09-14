import { useMemo } from 'react';
import { objectReduce } from '../helpers/helpers';
import { useTypedSelector } from './useTypedSelector';
import { getIsHelpRequested } from '../helpers/participant';
import { getDevices } from '../selectors';
export const useDratCount = () => {
    const devices = useTypedSelector(getDevices);
    return useMemo(() => {
        return objectReduce(devices, (acc, device) => {
            if (getIsHelpRequested(device)) {
                acc++;
            }
            return acc;
        }, 0);
    }, [devices]);
};
//# sourceMappingURL=useDratCount.js.map