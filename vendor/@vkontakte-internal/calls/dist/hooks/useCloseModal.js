import { useCallback } from 'react';
import { useTypedDispatch } from './useTypedDispatch';
import { toggleChildModal, toggleModal } from '../actions';
const useForceCloseModal = () => {
    const dispatch = useTypedDispatch();
    return useCallback(() => {
        dispatch(toggleModal());
    }, []);
};
export const useCloseChildModal = () => {
    const dispatch = useTypedDispatch();
    return useCallback(() => {
        dispatch(toggleChildModal());
    }, []);
};
export const useCloseModal = (externalMethod) => {
    const closeModal = useForceCloseModal();
    return useCallback(() => {
        if (externalMethod) {
            externalMethod();
        }
        else {
            closeModal();
        }
    }, [externalMethod]);
};
export const useConditionalCloseModal = (shouldBeClosed) => {
    const closeModal = useForceCloseModal();
    return useCallback(() => {
        if (!shouldBeClosed || shouldBeClosed()) {
            closeModal();
        }
    }, [shouldBeClosed]);
};
//# sourceMappingURL=useCloseModal.js.map