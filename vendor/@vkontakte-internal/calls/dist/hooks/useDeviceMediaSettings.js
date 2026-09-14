import { createDeviceByExternalIdSelector } from '../selectors';
import { useTypedSelector } from './useTypedSelector';
export const useDeviceMediaSettings = (externalId) => useTypedSelector((state) => {
    const device = createDeviceByExternalIdSelector(externalId)(state);
    return device?.mediaSettings;
});
//# sourceMappingURL=useDeviceMediaSettings.js.map