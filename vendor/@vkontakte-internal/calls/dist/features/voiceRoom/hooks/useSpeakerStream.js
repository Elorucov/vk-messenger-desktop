import { useCallback } from 'react';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getCallTopology } from '../../../selectors';
import { getStream } from '../../../helpers/participant';
import { useIsMe } from './useIsMe';
export const useSpeakerStream = () => {
    const checkIsMe = useIsMe();
    const topology = useTypedSelector(getCallTopology);
    return useCallback((device) => {
        const isMe = checkIsMe(device.externalId);
        return getStream(device, {
            animojiBackendRender: !isMe && topology === "SERVER" /* TransportTopology.SERVER */,
            useCameraOrAnimoji: true,
        });
    }, [checkIsMe, topology]);
};
//# sourceMappingURL=useSpeakerStream.js.map