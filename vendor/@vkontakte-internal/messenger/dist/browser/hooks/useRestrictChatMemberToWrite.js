import { useCallback } from 'react';
import { useDispatch } from './misc';
export const useRestrictChatMemberToWrite = ({ chatId }) => {
    const dispatch = useDispatch();
    const restrictToWrite = useCallback((memberId, time) => {
        dispatch({
            type: 'UserRestrictChatMemberToWrite',
            chatId,
            memberId,
            duration: time,
            userAction: 'restrict_to_write',
        });
    }, [dispatch, chatId]);
    const allowToWrite = useCallback((memberId) => {
        dispatch({
            type: 'UserRestrictChatMemberToWrite',
            chatId,
            memberId,
            userAction: 'allow_to_write',
        });
    }, [dispatch, chatId]);
    return {
        restrictToWrite,
        allowToWrite,
    };
};
//# sourceMappingURL=useRestrictChatMemberToWrite.js.map