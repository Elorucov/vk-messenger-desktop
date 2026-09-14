import { createDeviceByExternalIdSelector } from '../selectors';
import { useTypedSelector } from './useTypedSelector';
export const useWasConnected = (externalId) => useTypedSelector((state) => {
    const device = createDeviceByExternalIdSelector(externalId)(state);
    return !!device?.wasConnected;
});
//# sourceMappingURL=useWasConnected.js.map