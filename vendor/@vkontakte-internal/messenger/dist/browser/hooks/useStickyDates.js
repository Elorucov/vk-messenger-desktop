import { debounce } from '../../core/utils/misc';
import { useCallback, useEffect, useRef } from 'react';
const STICKY_DATE_VISIBILITY_TIMEOUT = 2000;
export function useStickyDates({ container }) {
    const $stickyDates = useRef(new Map());
    const $activeDate = useRef(0);
    const $isDisabled = useRef(false);
    const changeActiveDate = useCallback((date) => {
        if (date === $activeDate.current) {
            return;
        }
        $stickyDates.current.get($activeDate.current)?.(false, true);
        $stickyDates.current.get(date)?.(true, $isDisabled.current);
        $activeDate.current = date;
    }, []);
    const registerStickyDate = useCallback((date, dateCallback) => {
        $stickyDates.current.set(date, dateCallback);
        if (date === $activeDate.current) {
            dateCallback(true, $isDisabled.current);
        }
        return () => {
            $stickyDates.current.delete(date);
        };
    }, []);
    useEffect(() => {
        if (!container) {
            return;
        }
        const stickyDates = $stickyDates.current;
        const disableDate = debounce(() => {
            $isDisabled.current = true;
            stickyDates.get($activeDate.current)?.(true, true);
        }, STICKY_DATE_VISIBILITY_TIMEOUT, false);
        const handleUserActivity = () => {
            if ($isDisabled.current) {
                $isDisabled.current = false;
                stickyDates.get($activeDate.current)?.(true, false);
            }
            disableDate();
        };
        container.addEventListener('mousemove', handleUserActivity, {
            passive: true,
        });
        container.addEventListener('scroll', handleUserActivity, {
            passive: true,
        });
        disableDate();
        return () => {
            disableDate.cancel();
            stickyDates.clear();
            container.removeEventListener('mousemove', handleUserActivity);
            container.removeEventListener('scroll', handleUserActivity);
        };
        // Игнорируем $container, так как это реф на HTMLDivElement
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [container]);
    return { changeActiveDate, registerStickyDate };
}
//# sourceMappingURL=useStickyDates.js.map