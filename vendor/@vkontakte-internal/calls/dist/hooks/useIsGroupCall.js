import { useMemo } from 'react';
import { useTypedSelector } from './useTypedSelector';
import { isGroupCall } from '@vkontakte-internal/calls-core';
import { getMyId, getPeerId, getCallDataTopology } from '../selectors';
export const useIsGroupCall = () => {
    const myId = useTypedSelector(getMyId);
    const peerId = useTypedSelector(getPeerId);
    const callTopology = useTypedSelector(getCallDataTopology);
    return useMemo(() => isGroupCall(myId, peerId, callTopology), [myId, peerId, callTopology]);
};
//# sourceMappingURL=useIsGroupCall.js.map