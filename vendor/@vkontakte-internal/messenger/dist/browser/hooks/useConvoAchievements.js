import { useCallback, useEffect, useState } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import { fromApiAchievements } from '../../data/converter/AchievementConverter';
const ACHIEVEMENTS_COUNT_FOR_LOAD = 10;
export function useConvoAchievements(peerId) {
    const apiFetch = useApiFetch();
    const [achievements, setAchievements] = useState();
    const loadConvoAchievements = useCallback(async () => {
        try {
            const response = await apiFetch('messages.getUserAchievements', {
                user_id: peerId,
                count: ACHIEVEMENTS_COUNT_FOR_LOAD,
            });
            setAchievements(fromApiAchievements(response.achievements));
        }
        catch (err) { }
    }, [apiFetch, peerId]);
    useEffect(() => {
        loadConvoAchievements();
    }, [loadConvoAchievements]);
    return {
        achievements,
    };
}
//# sourceMappingURL=useConvoAchievements.js.map