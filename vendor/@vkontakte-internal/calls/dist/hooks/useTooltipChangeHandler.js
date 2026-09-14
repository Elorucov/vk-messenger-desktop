import { useCallback } from 'react';
import { E_ACTION } from '../constants';
import { useTypedDispatch } from './useTypedDispatch';
export const useTooltipChangeHandler = () => {
    const dispatch = useTypedDispatch();
    return useCallback((tooltip, status) => {
        dispatch({
            type: E_ACTION.SET_TOOLTIP,
            tooltips: {
                [tooltip]: status,
            },
        });
    }, [dispatch]);
};
//# sourceMappingURL=useTooltipChangeHandler.js.map