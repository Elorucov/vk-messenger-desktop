import { useState, useCallback, useMemo } from 'react';
import { useModal } from '../../hooks/useModal';
export const useErrorModal = () => {
    const errorModal = useModal();
    const [errorText, setErrorText] = useState();
    const open = useCallback((error) => {
        setErrorText(error);
        errorModal.open();
    }, [errorModal]);
    const close = useCallback(() => {
        errorModal.close();
        setErrorText(undefined);
    }, [errorModal]);
    return useMemo(() => ({
        errorText,
        open,
        close,
    }), [close, errorText, open]);
};
//# sourceMappingURL=useErrorModal.js.map