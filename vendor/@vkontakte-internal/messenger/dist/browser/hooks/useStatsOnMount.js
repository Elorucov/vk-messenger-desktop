import { useBrowserEnv } from '../hooks/misc';
import { useEffect } from 'react';
/**
 * Хук для логирования ивентов на маунте компонента
 *
 * Удобно использовать для логирования событий навигации,
 * где компонент является экраном
 */
export function useStatsOnMount(event) {
    const { stats } = useBrowserEnv();
    useEffect(() => {
        stats.logEvent(event);
        // Логируем ивент только на маунте компонента-экрана
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
//# sourceMappingURL=useStatsOnMount.js.map