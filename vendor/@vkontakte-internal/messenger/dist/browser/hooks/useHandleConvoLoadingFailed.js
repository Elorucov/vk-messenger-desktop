import { useEffect, useRef } from 'react';
export const useHandleConvoLoadingFailed = (onError, currentPeerId, convoLoadingFailed) => {
    const handleErrorRef = useRef(onError);
    handleErrorRef.current = onError;
    const currentPeerIdRef = useRef(currentPeerId);
    currentPeerIdRef.current = currentPeerId;
    const currentConvoLoadingFailedRef = useRef(convoLoadingFailed);
    currentConvoLoadingFailedRef.current = convoLoadingFailed;
    useEffect(() => {
        const prevConvoLoadingFailed = convoLoadingFailed;
        return () => {
            if (currentConvoLoadingFailedRef.current &&
                currentConvoLoadingFailedRef.current !== prevConvoLoadingFailed &&
                currentPeerIdRef.current === currentConvoLoadingFailedRef.current) {
                handleErrorRef.current();
            }
        };
    }, [convoLoadingFailed]);
};
//# sourceMappingURL=useHandleConvoLoadingFailed.js.map