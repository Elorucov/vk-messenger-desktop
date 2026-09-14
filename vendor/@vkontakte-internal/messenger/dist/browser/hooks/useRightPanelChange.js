import { useRouter } from '../ui/Router/Router';
import { isDeepEqual } from '../../core/utils/misc';
import { useEffect, useRef } from 'react';
export function useRightPanelChange(cb) {
    const $cb = useRef(cb);
    $cb.current = cb;
    const { router } = useRouter();
    const $route = useRef(router.screenRoute);
    useEffect(() => {
        const unsub = router.subscribe((route) => {
            let hasChanges = false;
            // Объект правой панели не большой, такое сравнение много времени не займет
            if (!isDeepEqual(route.rp, $route.current.rp)) {
                hasChanges = true;
            }
            //Если кликнули на тэг, то будет открыт поиск
            if (($route.current.kind === 'ConvoRoute' ||
                $route.current.kind === 'ChannelRoute') &&
                (route.kind === 'ConvoRoute' || route.kind === 'ChannelRoute') &&
                route.search !== $route.current.search) {
                hasChanges = true;
            }
            if (hasChanges) {
                $cb.current();
            }
            $route.current = route;
        });
        return () => unsub();
    }, [router]);
}
//# sourceMappingURL=useRightPanelChange.js.map