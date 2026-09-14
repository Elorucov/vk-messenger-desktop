import { createDeviceByExternalIdSelector } from '../selectors';
import { getIsHandRaised } from '../helpers/participant';
import { useTypedSelector } from './useTypedSelector';
export const useIsHandRaised = (externalId) => useTypedSelector((state) => {
    const device = createDeviceByExternalIdSelector(externalId)(state);
    return getIsHandRaised(device);
});
//# sourceMappingURL=useIsHandRaised.js.map