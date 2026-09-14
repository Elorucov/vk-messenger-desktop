import { useDispatch } from '../hooks/misc';
import { SECONDS_IN_THE_DAY } from '@vkontakte/vkjs';
import { useNow } from '../hooks/useNow';
import { useCallback } from 'react';
const dayTime = SECONDS_IN_THE_DAY * 1000;
/**
 * Тайминг через который будет автоматически снова показываться баннер
 * Таким образом напоминаем пользователю пройти интеграцию с ЭЖД
 */
const BANNER_VISIBILITY_SWITCH_TIMINGS = [
    dayTime,
    dayTime * 3,
    dayTime * 10,
    dayTime * 30,
];
/**
 * В случае если пользователь скрыл баннер в 4-й раз, далее баннер будет показываться через этот временной промежуток
 */
const BANNER_MAX_TIMING = dayTime * 30;
export function useEduIntegrationBanner({ banner, }) {
    const dispatch = useDispatch();
    const { hiddenAt, hiddenCount, isEnabled } = banner;
    const now = useNow();
    const isHiddenRemotely = !isEnabled;
    const close = useCallback(() => {
        dispatch({
            type: 'HideEduIntegrationBanner',
        });
    }, [dispatch]);
    if (!hiddenAt) {
        // Баннер не был скрыт локально
        return {
            isVisible: !isHiddenRemotely,
            close,
        };
    }
    if (isHiddenRemotely) {
        return {
            isVisible: false,
            close,
        };
    }
    const timing = BANNER_VISIBILITY_SWITCH_TIMINGS[hiddenCount - 1] ?? BANNER_MAX_TIMING;
    if (now - hiddenAt >= timing) {
        // Прошло время скрытия, надо показывать баннер обратно
        dispatch({
            type: 'ShowEduIntegrationBanner',
        });
        return {
            isVisible: true,
            close,
        };
    }
    // Баннер пока не надо показывать обратно
    return {
        isVisible: false,
        close,
    };
}
//# sourceMappingURL=useEduIntegrationBanner.js.map