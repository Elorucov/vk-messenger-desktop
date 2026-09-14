import { useEffect, useRef } from 'react';
import { getChatMembers, getFriends, getGroupMembers } from '../../../selectors';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
/** хук-мапа вообще всех участников чата, кроме participants */
export const usePersonCache = () => {
    const groupMembers = useTypedSelector(getGroupMembers);
    const chatMembers = useTypedSelector(getChatMembers);
    const friends = useTypedSelector(getFriends);
    /** cached prev values to compare */
    const prev = useRef({});
    /** cached persons somehow involved in chat */
    const cache = useRef(undefined);
    // инициируем только 1 раз
    if (!cache.current) {
        cache.current = new Map();
    }
    /** update cache persons helper function */
    const updateCache = (...lists) => {
        lists.forEach((list) => {
            list.forEach((member) => {
                // просто перезаписываем, не проверяя кишки
                cache.current.set(member.id, member);
            });
        });
    };
    // sync cache update onrender
    if (prev.current.chatMembers !== chatMembers) {
        updateCache(chatMembers);
        prev.current.chatMembers = chatMembers;
    }
    if (prev.current.groupMembers !== groupMembers) {
        updateCache(groupMembers);
        prev.current.groupMembers = groupMembers;
    }
    if (prev.current.friends !== friends) {
        updateCache(friends);
        prev.current.friends = friends;
    }
    useEffect(() => {
        return () => {
            cache.current.clear();
            prev.current = {};
        };
    }, []);
    return { personCache: cache };
};
//# sourceMappingURL=usePersonCache.js.map