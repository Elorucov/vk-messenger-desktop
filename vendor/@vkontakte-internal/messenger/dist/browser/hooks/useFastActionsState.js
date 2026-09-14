import { useCallback, useState } from 'react';
/**
 * Хук для хранения общего состояния открытого контекстного меню
 * Нужен из-за существования опции "Наведение + клик"
 */
export const useFastActionsState = () => {
    const [isDropdownFastActionsOpened, setDropdownFastActionsOpened] = useState(false);
    const [isContextMenuFastActionsOpened, setContextMenuFastActionsOpened] = useState(false);
    const openDropdownFastActions = useCallback(() => {
        setContextMenuFastActionsOpened(false);
        setDropdownFastActionsOpened(true);
    }, []);
    const openContextMenuFastActions = useCallback(() => {
        setDropdownFastActionsOpened(false);
        setContextMenuFastActionsOpened(true);
    }, []);
    const closeDropdownFastActions = useCallback(() => {
        setDropdownFastActionsOpened(false);
    }, []);
    const closeContextMenuFastActions = useCallback(() => {
        setContextMenuFastActionsOpened(false);
    }, []);
    return {
        isDropdownFastActionsOpened,
        isContextMenuFastActionsOpened,
        openDropdownFastActions,
        openContextMenuFastActions,
        closeDropdownFastActions,
        closeContextMenuFastActions,
    };
};
//# sourceMappingURL=useFastActionsState.js.map