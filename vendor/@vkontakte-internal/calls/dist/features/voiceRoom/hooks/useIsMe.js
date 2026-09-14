import { useCallback } from 'react';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getMyExternalId } from '../../../selectors';
import { isSameExternalId } from '@vkontakte-internal/calls-core';
export const useIsMe = () => {
    const localExternalId = useTypedSelector(getMyExternalId);
    return useCallback((externalId) => isSameExternalId(localExternalId, externalId), [localExternalId]);
};
//# sourceMappingURL=useIsMe.js.map