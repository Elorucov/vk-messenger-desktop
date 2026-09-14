import { useDispatch } from 'react-redux';
import { E_ACTION } from '../constants';
/** типизированный dispatch + коллекция экшенов */
export const useTypedDispatch = () => {
    const dispatch = useDispatch();
    return dispatch;
};
export { E_ACTION };
//# sourceMappingURL=useTypedDispatch.js.map