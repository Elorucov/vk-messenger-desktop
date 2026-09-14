import { useSelector } from 'react-redux';
import { isParticipantAnonym } from '../helpers/participant';
/** хук для проверки, что пользователь - аноним */
export const useIsAnonymous = () => {
    const me = useSelector((state) => state.me);
    const isAnonymous = isParticipantAnonym(me);
    return { isAnonymous };
};
//# sourceMappingURL=useIsAnonymous.js.map